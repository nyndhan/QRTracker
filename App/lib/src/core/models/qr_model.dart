import 'package:json_annotation/json_annotation.dart';

part 'qr_model.g.dart';

@JsonSerializable()
class QRModel {
  @JsonKey(name: 'qr_id')
  final String qrId;

  @JsonKey(name: 'component_type')
  final String? componentType;

  @JsonKey(name: 'component_id')
  final String? componentId;

  @JsonKey(name: 'track_number')
  final String? trackNumber;

  final String? location;

  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;

  const QRModel({
    required this.qrId,
    this.componentType,
    this.componentId,
    this.trackNumber,
    this.location,
    this.createdAt,
    this.updatedAt,
  });

  factory QRModel.fromJson(Map<String, dynamic> json) =>
      _$QRModelFromJson(json);

  Map<String, dynamic> toJson() => _$QRModelToJson(this);
}

@JsonSerializable()
class QRGenerateRequest {
  @JsonKey(name: 'component_type')
  final String componentType;

  @JsonKey(name: 'component_id')
  final String componentId;

  @JsonKey(name: 'track_number')
  final String trackNumber;

  final String? location;

  final int size;

  @JsonKey(name: 'error_correction')
  final String errorCorrection;

  const QRGenerateRequest({
    required this.componentType,
    required this.componentId,
    required this.trackNumber,
    this.location,
    this.size = 300,
    this.errorCorrection = 'M',
  });

  factory QRGenerateRequest.fromJson(Map<String, dynamic> json) =>
      _$QRGenerateRequestFromJson(json);

  Map<String, dynamic> toJson() => _$QRGenerateRequestToJson(this);
}

@JsonSerializable()
class QRScanRequest {
  @JsonKey(name: 'qr_code')
  final String qrCode;

  const QRScanRequest({
    required this.qrCode,
  });

  factory QRScanRequest.fromJson(Map<String, dynamic> json) =>
      _$QRScanRequestFromJson(json);

  Map<String, dynamic> toJson() => _$QRScanRequestToJson(this);
}

@JsonSerializable()
class QRScanResult {
  @JsonKey(name: 'qr_id')
  final String qrId;

  @JsonKey(name: 'component_type')
  final String? componentType;

  @JsonKey(name: 'component_id')
  final String? componentId;

  @JsonKey(name: 'track_number')
  final String? trackNumber;

  final String? location;

  @JsonKey(name: 'last_scanned')
  final DateTime? lastScanned;

  final bool valid;

  const QRScanResult({
    required this.qrId,
    this.componentType,
    this.componentId,
    this.trackNumber,
    this.location,
    this.lastScanned,
    this.valid = true,
  });

  factory QRScanResult.fromJson(Map<String, dynamic> json) =>
      _$QRScanResultFromJson(json);

  Map<String, dynamic> toJson() => _$QRScanResultToJson(this);
}
