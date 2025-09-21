// Application Data
const servicesData = {
  fastapi_core: {
    name: "FastAPI Core Service",
    port: 8000,
    description: "High-performance Python API server",
    status: "running",
    files: 7,
    features: [
      "Railway Component Management",
      "User Authentication & Authorization", 
      "Digital Inspections",
      "Inventory Tracking",
      "Audit Logging",
      "External API Integrations"
    ],
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/railway/tracks",
        description: "List railway tracks with filtering",
        auth: "Bearer Token"
      },
      {
        method: "POST", 
        path: "/api/v1/railway/components",
        description: "Create new railway component",
        auth: "Bearer Token"
      },
      {
        method: "POST",
        path: "/api/v1/railway/inspections/digital", 
        description: "Create digital inspection",
        auth: "Bearer Token"
      },
      {
        method: "GET",
        path: "/api/v1/railway/analytics/dashboard",
        description: "Get railway analytics",
        auth: "Bearer Token"
      }
    ]
  },
  qr_service: {
    name: "Node.js QR Microservice",
    port: 3001,
    description: "Specialized QR code operations",
    status: "running",
    files: 3,
    features: [
      "Advanced QR Generation",
      "Template Management", 
      "Batch Processing",
      "Print Services",
      "Quality Assessment",
      "Scan Analytics"
    ],
    endpoints: [
      {
        method: "POST",
        path: "/api/qr/generate",
        description: "Generate QR code with templates",
        auth: "API Key"
      },
      {
        method: "POST",
        path: "/api/qr/scan", 
        description: "Scan and validate QR code",
        auth: "API Key"
      },
      {
        method: "POST",
        path: "/api/batch/generate",
        description: "Bulk QR generation", 
        auth: "API Key"
      },
      {
        method: "GET",
        path: "/api/analytics/qr",
        description: "QR usage analytics",
        auth: "API Key"
      }
    ]
  },
  realtime_service: {
    name: "Real-time Service",
    port: 3002,
    description: "WebSocket and live synchronization",
    status: "running", 
    files: 2,
    features: [
      "WebSocket Connections",
      "Live Data Updates",
      "Push Notifications",
      "Event Streaming",
      "Multi-user Collaboration",
      "Real-time Analytics"
    ],
    endpoints: [
      {
        method: "WS",
        path: "/ws/railway-updates",
        description: "Railway data live updates",
        auth: "WebSocket Token"
      },
      {
        method: "WS", 
        path: "/ws/qr-events",
        description: "QR operation events",
        auth: "WebSocket Token"
      },
      {
        method: "POST",
        path: "/api/notifications",
        description: "Send push notification",
        auth: "API Key"
      }
    ]
  },
  ai_service: {
    name: "AI/ML Service",
    port: 8001,
    description: "Machine learning capabilities",
    status: "running",
    files: 1,
    features: [
      "Predictive Maintenance",
      "Component Failure Prediction",
      "Quality Assessment", 
      "Usage Pattern Analysis",
      "Anomaly Detection",
      "Computer Vision"
    ],
    endpoints: [
      {
        method: "POST",
        path: "/api/ai/predict/maintenance",
        description: "Predict component maintenance needs",
        auth: "Bearer Token"
      },
      {
        method: "POST",
        path: "/api/ai/analyze/quality",
        description: "Assess component quality", 
        auth: "Bearer Token"
      },
      {
        method: "GET",
        path: "/api/ai/models/status",
        description: "Get ML model status",
        auth: "Bearer Token"
      }
    ]
  }
};

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  initTabNavigation();
  initServiceModals();
  initAPIExplorer();
  initDatabaseTabs();
  initDeploymentTabs();
  initCopyButtons();
  initServiceToggles();
  initCharts();
  initAnimations();
}

// Tab Navigation
function initTabNavigation() {
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      
      // Update active nav tab
      navTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update active content
      tabContents.forEach(content => {
        content.classList.remove('active');
      });
      
      const targetContent = document.getElementById(targetTab);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
}

// Service Modals
function initServiceModals() {
  const serviceBoxes = document.querySelectorAll('.service-box');
  const modal = document.getElementById('service-modal');
  const closeBtn = document.querySelector('.modal-close');
  
  serviceBoxes.forEach(box => {
    box.addEventListener('click', () => {
      const serviceKey = box.dataset.service;
      const serviceData = servicesData[serviceKey];
      
      if (serviceData) {
        showServiceModal(serviceData);
      }
    });
  });
  
  closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });
}

function showServiceModal(serviceData) {
  const modal = document.getElementById('service-modal');
  const title = document.getElementById('modal-title');
  const status = document.getElementById('service-status');
  const port = document.getElementById('service-port'); 
  const files = document.getElementById('service-files');
  const features = document.getElementById('service-features');
  const endpoints = document.getElementById('service-endpoints');
  
  title.textContent = serviceData.name;
  port.textContent = serviceData.port;
  files.textContent = `${serviceData.files} files`;
  
  // Features
  features.innerHTML = '';
  serviceData.features.forEach(feature => {
    const li = document.createElement('li');
    li.textContent = feature;
    features.appendChild(li);
  });
  
  // Endpoints
  endpoints.innerHTML = '';
  serviceData.endpoints.forEach(endpoint => {
    const endpointDiv = document.createElement('div');
    endpointDiv.className = 'endpoint-item';
    endpointDiv.innerHTML = `
      <div class="endpoint-method">
        <span class="method ${endpoint.method.toLowerCase()}">${endpoint.method}</span>
        <span class="path">${endpoint.path}</span>
      </div>
      <p>${endpoint.description}</p>
      <span class="auth-badge">${endpoint.auth}</span>
    `;
    endpoints.appendChild(endpointDiv);
  });
  
  modal.classList.remove('hidden');
}

// API Explorer
function initAPIExplorer() {
  const apiServices = document.querySelectorAll('.api-service');
  const apiEndpoints = document.querySelectorAll('.api-endpoints');
  
  apiServices.forEach(service => {
    service.addEventListener('click', () => {
      const targetAPI = service.dataset.api;
      
      // Update active service
      apiServices.forEach(s => s.classList.remove('active'));
      service.classList.add('active');
      
      // Update active endpoints
      apiEndpoints.forEach(endpoint => {
        endpoint.classList.remove('active');
      });
      
      const targetEndpoints = document.getElementById(`api-${targetAPI}`);
      if (targetEndpoints) {
        targetEndpoints.classList.add('active');
      }
    });
  });
}

// Database Tabs
function initDatabaseTabs() {
  const dbTabs = document.querySelectorAll('.db-tab');
  const dbContents = document.querySelectorAll('.db-content');
  
  dbTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetDB = tab.dataset.db;
      
      // Update active tab
      dbTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update active content
      dbContents.forEach(content => {
        content.classList.remove('active');
      });
      
      const targetContent = document.getElementById(targetDB);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
}

// Deployment Tabs
function initDeploymentTabs() {
  const envTabs = document.querySelectorAll('.env-tab');
  const envContents = document.querySelectorAll('.env-content');
  
  envTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetEnv = tab.dataset.env;
      
      // Update active tab
      envTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update active content
      envContents.forEach(content => {
        content.classList.remove('active');
      });
      
      const targetContent = document.getElementById(targetEnv);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
}

// Copy Buttons
function initCopyButtons() {
  const copyButtons = document.querySelectorAll('.copy-btn, .copy-btn-inline');
  
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.dataset.copy;
      
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showCopyFeedback(btn);
        }).catch(() => {
          // Fallback for older browsers
          fallbackCopyToClipboard(textToCopy);
          showCopyFeedback(btn);
        });
      }
    });
  });
}

function fallbackCopyToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }
  
  document.body.removeChild(textArea);
}

function showCopyFeedback(btn) {
  const originalText = btn.textContent;
  btn.textContent = 'Copied!';
  btn.style.background = 'var(--color-success)';
  
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = '';
  }, 2000);
}

// Service Toggles
function initServiceToggles() {
  const toggles = document.querySelectorAll('.service-toggle input[type="checkbox"]');
  
  toggles.forEach(toggle => {
    toggle.addEventListener('change', () => {
      const serviceCard = toggle.closest('.service-card');
      const serviceName = serviceCard.querySelector('h3').textContent;
      
      if (toggle.checked) {
        console.log(`${serviceName} started`);
        showNotification(`${serviceName} started successfully`, 'success');
      } else {
        console.log(`${serviceName} stopped`);
        showNotification(`${serviceName} stopped`, 'info');
      }
    });
  });
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification--${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 16px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  if (type === 'success') {
    notification.style.backgroundColor = 'var(--color-success)';
  } else if (type === 'error') {
    notification.style.backgroundColor = 'var(--color-error)';
  } else {
    notification.style.backgroundColor = 'var(--color-info)';
  }
  
  document.body.appendChild(notification);
  
  // Trigger animation
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove notification
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Charts
function initCharts() {
  initPerformanceChart();
  initQROperationsChart();
}

function initPerformanceChart() {
  const ctx = document.getElementById('performance-chart');
  if (!ctx) return;
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      datasets: [
        {
          label: 'FastAPI Core',
          data: [65, 75, 85, 95, 88, 92],
          borderColor: '#1FB8CD',
          backgroundColor: 'rgba(31, 184, 205, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'QR Service',
          data: [55, 65, 78, 82, 79, 85],
          borderColor: '#FFC185',
          backgroundColor: 'rgba(255, 193, 133, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Real-time Service',
          data: [45, 55, 68, 75, 72, 78],
          borderColor: '#B4413C',
          backgroundColor: 'rgba(180, 65, 60, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'AI/ML Service',
          data: [35, 45, 58, 68, 65, 72],
          borderColor: '#5D878F',
          backgroundColor: 'rgba(93, 135, 143, 0.1)', 
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      },
      elements: {
        point: {
          radius: 4,
          hoverRadius: 6
        }
      }
    }
  });
}

function initQROperationsChart() {
  const ctx = document.getElementById('qr-operations-chart');
  if (!ctx) return;
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Generated', 'Scanned', 'Validated', 'Failed'],
      datasets: [{
        data: [156, 89, 134, 8],
        backgroundColor: [
          '#1FB8CD',
          '#FFC185', 
          '#B4413C',
          '#ECEBD5'
        ],
        borderWidth: 2,
        borderColor: 'var(--color-surface)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        title: {
          display: false
        }
      },
      cutout: '60%'
    }
  });
}

// Animations
function initAnimations() {
  // Animate service status indicators
  animateStatusIndicators();
  
  // Animate metrics on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateMetrics(entry.target);
      }
    });
  });
  
  const metricCards = document.querySelectorAll('.metric-card');
  metricCards.forEach(card => {
    observer.observe(card);
  });
}

function animateStatusIndicators() {
  const statusIndicators = document.querySelectorAll('.service-status.running');
  
  statusIndicators.forEach(indicator => {
    setInterval(() => {
      indicator.style.opacity = '0.3';
      setTimeout(() => {
        indicator.style.opacity = '1';
      }, 500);
    }, 2000);
  });
}

function animateMetrics(metricCard) {
  const valueElement = metricCard.querySelector('.metric-value');
  if (!valueElement || valueElement.dataset.animated) return;
  
  valueElement.dataset.animated = 'true';
  
  const finalValue = valueElement.textContent;
  const numericValue = parseFloat(finalValue.replace(/[^\d.]/g, ''));
  const unit = finalValue.replace(/[\d.]/g, '');
  
  if (isNaN(numericValue)) return;
  
  let currentValue = 0;
  const increment = numericValue / 30;
  const duration = 1000;
  const stepTime = duration / 30;
  
  valueElement.textContent = '0' + unit;
  
  const timer = setInterval(() => {
    currentValue += increment;
    if (currentValue >= numericValue) {
      valueElement.textContent = finalValue;
      clearInterval(timer);
    } else {
      if (unit.includes('%')) {
        valueElement.textContent = Math.round(currentValue) + unit;
      } else if (unit.includes('ms')) {
        valueElement.textContent = Math.round(currentValue) + unit;
      } else {
        valueElement.textContent = Math.round(currentValue) + unit;
      }
    }
  }, stepTime);
}

// Utility Functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Search functionality (if needed in future)
function initSearch() {
  const searchInput = document.querySelector('.search-input');
  if (!searchInput) return;
  
  const debouncedSearch = debounce((query) => {
    performSearch(query);
  }, 300);
  
  searchInput.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
  });
}

function performSearch(query) {
  // Implementation for search functionality
  console.log('Searching for:', query);
}

// Error handling
window.addEventListener('error', (e) => {
  console.error('Application error:', e.error);
});

// Handle focus management for accessibility
function initAccessibility() {
  // Skip link functionality
  const skipLink = document.querySelector('.skip-link');
  if (skipLink) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.focus();
      }
    });
  }
  
  // Keyboard navigation for modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.querySelector('.modal:not(.hidden)');
      if (modal) {
        modal.classList.add('hidden');
      }
    }
  });
}

// Initialize accessibility features
document.addEventListener('DOMContentLoaded', initAccessibility);

// Performance monitoring
function initPerformanceMonitoring() {
  if ('performance' in window) {
    window.addEventListener('load', () => {
      const timing = performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      console.log(`Page load time: ${loadTime}ms`);
    });
  }
}

initPerformanceMonitoring();