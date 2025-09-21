/**
 * Advanced QR Controller - Enhanced QR Operations
 */

const QRCode = require('qrcode');
const sharp = require('sharp');
const canvas = require('canvas');
const jsqr = require('jsqr');
const uuid = require('uuid');
const _ = require('lodash');

const QRCodeModel = require('../models/mongodb/qr-code');
const QRTemplate = require('../models/mongodb/qr-template');
const ScanHistory = require('../models/mongodb/scan-history');
const logger = require('../utils/logger');
const { validateQRData, generateQRHash, optimizeQRSettings } = require('../utils/qr-utils');
const cacheService = require('../services/cache-service');

/**
 * Generate QR Code with Advanced Template Support
 */
exports.generateQRCode = async (req, res, next) => {
  try {
    const {
      data,
      template_id,
      size = 400,
      error_correction = 'M',
      format = 'PNG',
      custom_settings = {}
    } = req.body;

    // Validate QR data
    const validationResult = validateQRData(data);
    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR data',
        errors: validationResult.errors
      });
    }

    // Get template if specified
    let template = null;
    if (template_id) {
      template = await QRTemplate.findById(template_id);
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }
    }

    // Prepare QR settings
    const qrSettings = {
      errorCorrectionLevel: error_correction,
      type: format.toLowerCase(),
      width: parseInt(size),
      color: {
        dark: template?.settings?.color?.dark || '#000000',
        light: template?.settings?.color?.light || '#FFFFFF'
      },
      margin: template?.settings?.margin || 4,
      ...custom_settings
    };

    // Optimize settings based on data complexity
    const optimizedSettings = optimizeQRSettings(JSON.stringify(data), qrSettings);

    // Generate QR code
    let qrBuffer;
    let qrDataURL;

    if (template && template.settings.custom_design) {
      // Generate with custom template design
      qrBuffer = await generateCustomTemplateQR(JSON.stringify(data), template, optimizedSettings);
    } else {
      // Standard QR generation
      qrBuffer = await QRCode.toBuffer(JSON.stringify(data), optimizedSettings);
    }

    // Generate data URL for immediate display
    qrDataURL = `data:image/${format.toLowerCase()};base64,${qrBuffer.toString('base64')}`;

    // Generate QR ID and hash
    const qrId = `QR_${uuid.v4().replace(/-/g, '').toUpperCase().substring(0, 16)}`;
    const dataHash = generateQRHash(JSON.stringify(data));

    // Create QR record in database
    const qrRecord = new QRCodeModel({
      qr_id: qrId,
      qr_data: JSON.stringify(data),
      qr_data_hash: dataHash,
      size: parseInt(size),
      error_correction_level: error_correction,
      format: format,
      template_id: template_id,
      template_version: template?.version,
      component_id: data.component_id,
      component_type: data.component_type,
      component_serial: data.serial_number,
      image_base64: qrBuffer.toString('base64'),
      image_size_bytes: qrBuffer.length,
      quality_score: await calculateQRQuality(qrBuffer),
      validation_status: 'valid',
      metadata: {
        generation_settings: optimizedSettings,
        generation_timestamp: new Date(),
        user_agent: req.get('user-agent'),
        ip_address: req.ip
      },
      created_by: req.user?.id
    });

    await qrRecord.save();

    // Update template usage statistics
    if (template) {
      await QRTemplate.findByIdAndUpdate(template_id, {
        $inc: { usage_count: 1 },
        last_used: new Date()
      });
    }

    // Cache QR code for quick access
    await cacheService.setQRCode(qrId, {
      data: JSON.stringify(data),
      image_base64: qrBuffer.toString('base64'),
      metadata: qrRecord.metadata
    }, 3600); // 1 hour cache

    logger.info(`QR Code generated: ${qrId}, size: ${qrBuffer.length} bytes`);

    res.status(201).json({
      success: true,
      message: 'QR Code generated successfully',
      data: {
        qr_id: qrId,
        qr_data_url: qrDataURL,
        image_base64: qrBuffer.toString('base64'),
        size: parseInt(size),
        format: format,
        quality_score: qrRecord.quality_score,
        template_used: template?.display_name || 'Standard',
        metadata: {
          data_hash: dataHash,
          generation_time: new Date(),
          file_size_bytes: qrBuffer.length,
          optimization_applied: !_.isEqual(qrSettings, optimizedSettings)
        }
      }
    });

  } catch (error) {
    logger.error('QR generation error:', error);
    next(error);
  }
};

/**
 * Scan and Validate QR Code
 */
exports.scanQRCode = async (req, res, next) => {
  try {
    const {
      image_data,
      image_url,
      location,
      scan_context = {}
    } = req.body;

    let imageBuffer;

    // Get image data
    if (image_data) {
      // Base64 image data
      imageBuffer = Buffer.from(image_data.replace(/^data:image\/[a-z]+;base64,/, ''), 'base64');
    } else if (image_url) {
      // Download image from URL
      const response = await axios.get(image_url, { responseType: 'arraybuffer' });
      imageBuffer = Buffer.from(response.data);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either image_data or image_url is required'
      });
    }

    // Process image for QR scanning
    const image = sharp(imageBuffer);
    const { data, info } = await image
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .greyscale()
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true });

    // Scan QR code
    const qrResult = jsqr(new Uint8ClampedArray(data), info.width, info.height);

    if (!qrResult) {
      return res.status(400).json({
        success: false,
        message: 'No QR code found in the image',
        error_code: 'QR_NOT_FOUND'
      });
    }

    // Parse QR data
    let qrData;
    try {
      qrData = JSON.parse(qrResult.data);
    } catch (parseError) {
      qrData = { raw_data: qrResult.data };
    }

    // Validate QR data integrity
    const dataHash = generateQRHash(qrResult.data);

    // Find QR record in database
    let qrRecord = await QRCodeModel.findOne({ qr_data_hash: dataHash });

    if (!qrRecord) {
      // Try to find by component data
      if (qrData.component_id) {
        qrRecord = await QRCodeModel.findOne({ component_id: qrData.component_id });
      }
    }

    // Create scan history record
    const scanId = `SCAN_${uuid.v4().replace(/-/g, '').toUpperCase().substring(0, 16)}`;
    const scanRecord = new ScanHistory({
      scan_id: scanId,
      qr_code_id: qrRecord?._id,
      qr_data_hash: dataHash,
      scanned_data: qrResult.data,
      scan_timestamp: new Date(),
      location: location,
      scan_context: scan_context,
      device_info: {
        user_agent: req.get('user-agent'),
        ip_address: req.ip,
        platform: req.get('sec-ch-ua-platform')
      },
      validation_status: qrRecord ? 'valid' : 'unknown',
      scan_quality: calculateScanQuality(qrResult),
      processing_time: Date.now() - req.startTime,
      user_id: req.user?.id
    });

    await scanRecord.save();

    // Update QR code scan statistics
    if (qrRecord) {
      await QRCodeModel.findByIdAndUpdate(qrRecord._id, {
        $inc: { scan_count: 1 },
        last_scanned_at: new Date(),
        $addToSet: { 
          scan_locations: location,
          scanners: req.user?.id
        }
      });

      // Update unique scanners count
      const uniqueScannersCount = await ScanHistory.distinct('user_id', { qr_code_id: qrRecord._id });
      await QRCodeModel.findByIdAndUpdate(qrRecord._id, {
        unique_scanners: uniqueScannersCount.length
      });
    }

    // Prepare response
    const response = {
      success: true,
      message: 'QR Code scanned successfully',
      data: {
        scan_id: scanId,
        qr_data: qrData,
        qr_record_found: !!qrRecord,
        scan_quality: scanRecord.scan_quality,
        validation_status: scanRecord.validation_status,
        component_info: qrRecord ? {
          component_id: qrRecord.component_id,
          component_type: qrRecord.component_type,
          component_serial: qrRecord.component_serial,
          last_scan: qrRecord.last_scanned_at,
          total_scans: qrRecord.scan_count
        } : null,
        scan_metadata: {
          data_hash: dataHash,
          scan_time: new Date(),
          processing_time_ms: Date.now() - req.startTime
        }
      }
    };

    // Add component details if available
    if (qrRecord && qrData.component_id) {
      // Fetch component details from core API
      try {
        const componentResponse = await axios.get(
          `${process.env.CORE_API_URL}/api/v1/railway/components/${qrData.component_id}`,
          {
            headers: { Authorization: req.get('Authorization') },
            timeout: 5000
          }
        );

        response.data.component_details = componentResponse.data.data;
      } catch (apiError) {
        logger.warn('Failed to fetch component details:', apiError.message);
      }
    }

    logger.info(`QR Code scanned: ${scanId}, quality: ${scanRecord.scan_quality}`);

    res.json(response);

  } catch (error) {
    logger.error('QR scan error:', error);
    next(error);
  }
};

/**
 * Get QR Code Details
 */
exports.getQRCode = async (req, res, next) => {
  try {
    const { qrId } = req.params;
    const { include_scans = false, include_analytics = false } = req.query;

    // Try cache first
    let qrData = await cacheService.getQRCode(qrId);

    if (!qrData) {
      // Fetch from database
      const qrRecord = await QRCodeModel.findOne({ qr_id: qrId });

      if (!qrRecord) {
        return res.status(404).json({
          success: false,
          message: 'QR Code not found',
          error_code: 'QR_NOT_FOUND'
        });
      }

      qrData = qrRecord;
    }

    const response = {
      success: true,
      data: {
        qr_id: qrData.qr_id,
        qr_data: JSON.parse(qrData.qr_data),
        component_info: {
          component_id: qrData.component_id,
          component_type: qrData.component_type,
          component_serial: qrData.component_serial
        },
        qr_properties: {
          size: qrData.size,
          error_correction_level: qrData.error_correction_level,
          format: qrData.format,
          quality_score: qrData.quality_score
        },
        statistics: {
          scan_count: qrData.scan_count || 0,
          unique_scanners: qrData.unique_scanners || 0,
          first_scanned_at: qrData.first_scanned_at,
          last_scanned_at: qrData.last_scanned_at
        },
        status: {
          status: qrData.status,
          validation_status: qrData.validation_status,
          created_at: qrData.created_at,
          updated_at: qrData.updated_at
        }
      }
    };

    // Include scan history if requested
    if (include_scans === 'true') {
      const scanHistory = await ScanHistory.find({ qr_code_id: qrData._id })
        .sort({ scan_timestamp: -1 })
        .limit(50)
        .select('-scanned_data -device_info');

      response.data.recent_scans = scanHistory;
    }

    // Include analytics if requested
    if (include_analytics === 'true') {
      response.data.analytics = await generateQRAnalytics(qrData._id);
    }

    res.json(response);

  } catch (error) {
    logger.error('Get QR code error:', error);
    next(error);
  }
};

/**
 * Generate Custom Template QR
 */
async function generateCustomTemplateQR(data, template, settings) {
  const { createCanvas, loadImage } = canvas;

  // Create base QR code
  const qrDataURL = await QRCode.toDataURL(data, settings);

  // Load QR image
  const qrImage = await loadImage(qrDataURL);

  // Create custom canvas based on template
  const canvasWidth = settings.width + (template.settings.padding || 40);
  const canvasHeight = settings.width + (template.settings.padding || 40) + (template.settings.text_height || 60);
  const canv = createCanvas(canvasWidth, canvasHeight);
  const ctx = canv.getContext('2d');

  // Background
  ctx.fillStyle = template.settings.background_color || '#FFFFFF';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Border if specified
  if (template.settings.border) {
    ctx.strokeStyle = template.settings.border_color || '#000000';
    ctx.lineWidth = template.settings.border_width || 2;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
  }

  // Draw QR code
  const qrX = (canvasWidth - settings.width) / 2;
  const qrY = (template.settings.padding || 20);
  ctx.drawImage(qrImage, qrX, qrY, settings.width, settings.width);

  // Add template text/labels
  if (template.settings.show_text && template.settings.text_content) {
    ctx.fillStyle = template.settings.text_color || '#000000';
    ctx.font = `${template.settings.text_size || 16}px ${template.settings.text_font || 'Arial'}`;
    ctx.textAlign = 'center';

    const textY = qrY + settings.width + (template.settings.text_margin || 20);
    ctx.fillText(template.settings.text_content, canvasWidth / 2, textY);
  }

  // Convert to buffer
  return canv.toBuffer('image/png');
}

/**
 * Calculate QR Quality Score
 */
async function calculateQRQuality(qrBuffer) {
  try {
    // Use Sharp to analyze image quality
    const image = sharp(qrBuffer);
    const stats = await image.stats();

    // Basic quality metrics
    const sharpnessScore = calculateSharpness(stats);
    const contrastScore = calculateContrast(stats);
    const noiseScore = calculateNoise(stats);

    // Combined quality score (0-1)
    const qualityScore = (sharpnessScore + contrastScore + (1 - noiseScore)) / 3;

    return Math.round(qualityScore * 100) / 100;
  } catch (error) {
    logger.warn('QR quality calculation failed:', error);
    return 0.8; // Default quality score
  }
}

/**
 * Calculate Scan Quality
 */
function calculateScanQuality(qrResult) {
  // Basic quality metrics from jsqr result
  let quality = 1.0;

  // Check for detection confidence (if available)
  if (qrResult.location) {
    // Check if corners are well-defined
    const corners = [
      qrResult.location.topLeftCorner,
      qrResult.location.topRightCorner,
      qrResult.location.bottomLeftCorner,
      qrResult.location.bottomRightCorner
    ];

    // Calculate corner deviation (lower is better)
    const cornerDeviations = corners.map(corner => 
      Math.sqrt(corner.x * corner.x + corner.y * corner.y) % 1
    );

    const avgDeviation = cornerDeviations.reduce((sum, dev) => sum + dev, 0) / 4;
    quality -= avgDeviation * 0.2; // Reduce quality based on corner deviation
  }

  return Math.max(0.1, Math.min(1.0, quality));
}

/**
 * Generate QR Analytics
 */
async function generateQRAnalytics(qrCodeId) {
  try {
    const scans = await ScanHistory.find({ qr_code_id: qrCodeId });

    const analytics = {
      total_scans: scans.length,
      unique_users: [...new Set(scans.map(s => s.user_id))].length,
      average_scan_quality: scans.reduce((sum, s) => sum + (s.scan_quality || 0), 0) / scans.length,
      scan_frequency: calculateScanFrequency(scans),
      location_distribution: calculateLocationDistribution(scans),
      device_distribution: calculateDeviceDistribution(scans),
      temporal_pattern: calculateTemporalPattern(scans)
    };

    return analytics;
  } catch (error) {
    logger.error('QR analytics generation error:', error);
    return null;
  }
}

// Helper functions for quality calculations
function calculateSharpness(stats) {
  // Simple sharpness estimation based on standard deviation
  const avgStdDev = stats.channels.reduce((sum, ch) => sum + ch.stdev, 0) / stats.channels.length;
  return Math.min(1.0, avgStdDev / 50); // Normalize to 0-1
}

function calculateContrast(stats) {
  // Contrast based on min/max difference
  const avgRange = stats.channels.reduce((sum, ch) => sum + (ch.max - ch.min), 0) / stats.channels.length;
  return Math.min(1.0, avgRange / 255); // Normalize to 0-1
}

function calculateNoise(stats) {
  // Simple noise estimation
  const avgMean = stats.channels.reduce((sum, ch) => sum + ch.mean, 0) / stats.channels.length;
  const avgStdDev = stats.channels.reduce((sum, ch) => sum + ch.stdev, 0) / stats.channels.length;
  const noiseRatio = avgStdDev / avgMean;
  return Math.min(1.0, noiseRatio * 2); // Normalize to 0-1
}

// Analytics helper functions
function calculateScanFrequency(scans) {
  // Calculate scans per day over last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentScans = scans.filter(s => s.scan_timestamp >= thirtyDaysAgo);
  return recentScans.length / 30; // Average per day
}

function calculateLocationDistribution(scans) {
  // Group scans by location (simplified)
  const locationGroups = {};
  scans.forEach(scan => {
    if (scan.location && scan.location.latitude && scan.location.longitude) {
      const key = `${Math.round(scan.location.latitude * 100)},${Math.round(scan.location.longitude * 100)}`;
      locationGroups[key] = (locationGroups[key] || 0) + 1;
    }
  });
  return locationGroups;
}

function calculateDeviceDistribution(scans) {
  // Group scans by device type
  const deviceGroups = {};
  scans.forEach(scan => {
    const userAgent = scan.device_info?.user_agent || 'unknown';
    let deviceType = 'unknown';

    if (userAgent.toLowerCase().includes('mobile')) deviceType = 'mobile';
    else if (userAgent.toLowerCase().includes('tablet')) deviceType = 'tablet';
    else if (userAgent.toLowerCase().includes('desktop')) deviceType = 'desktop';

    deviceGroups[deviceType] = (deviceGroups[deviceType] || 0) + 1;
  });
  return deviceGroups;
}

function calculateTemporalPattern(scans) {
  // Analyze scan patterns by hour of day
  const hourlyPattern = {};
  scans.forEach(scan => {
    const hour = new Date(scan.scan_timestamp).getHours();
    hourlyPattern[hour] = (hourlyPattern[hour] || 0) + 1;
  });
  return hourlyPattern;
}

module.exports = exports;
