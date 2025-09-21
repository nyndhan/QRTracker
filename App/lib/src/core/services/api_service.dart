import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:retrofit/retrofit.dart';

import '../models/api_response.dart';
import '../models/user_model.dart';
import '../models/qr_model.dart';
import '../models/railway_model.dart';

part 'api_service.g.dart';

// API Configuration
class ApiConfig {
  static const String coreApiUrl = 'http://192.168.1.100:8000';
  static const String qrServiceUrl = 'http://192.168.1.100:3001';
  static const String realtimeServiceUrl = 'http://192.168.1.100:3002';
  static const String aiServiceUrl = 'http://192.168.1.100:8001';
}

@RestApi(baseUrl: ApiConfig.coreApiUrl)
abstract class CoreApiService {
  factory CoreApiService(Dio dio, {String baseUrl}) = _CoreApiService;

  // Auth endpoints
  @POST('/api/v1/auth/login')
  @FormUrlEncoded()
  Future<ApiResponse<AuthResponse>> login(
    @Field('username') String username,
    @Field('password') String password,
  );

  @POST('/api/v1/auth/logout')
  Future<ApiResponse<void>> logout();

  @GET('/api/v1/auth/me')
  Future<ApiResponse<UserModel>> getCurrentUser();

  // Railway endpoints
  @GET('/api/v1/railway/analytics/dashboard')
  Future<ApiResponse<RailwayAnalytics>> getRailwayAnalytics(
    @Query('timeframe') String timeframe,
  );

  @GET('/api/v1/railway/tracks')
  Future<ApiResponse<List<TrackModel>>> getTracks(
    @Query('page') int page,
    @Query('limit') int limit,
  );

  @GET('/api/v1/railway/components')
  Future<ApiResponse<List<ComponentModel>>> getComponents(
    @Query('type') String? type,
    @Query('track_id') String? trackId,
  );
}

@RestApi(baseUrl: ApiConfig.qrServiceUrl)
abstract class QRApiService {
  factory QRApiService(Dio dio, {String baseUrl}) = _QRApiService;

  @POST('/api/qr/generate')
  Future<ApiResponse<QRModel>> generateQR(@Body() QRGenerateRequest request);

  @POST('/api/qr/scan')
  Future<ApiResponse<QRScanResult>> scanQR(@Body() QRScanRequest request);

  @GET('/api/qr/history')
  Future<ApiResponse<List<QRModel>>> getQRHistory(
    @Query('page') int page,
    @Query('limit') int limit,
  );

  @GET('/api/analytics/qr')
  Future<ApiResponse<QRAnalytics>> getQRAnalytics(
    @Query('timeframe') String timeframe,
  );
}

@RestApi(baseUrl: ApiConfig.aiServiceUrl)
abstract class AIApiService {
  factory AIApiService(Dio dio, {String baseUrl}) = _AIApiService;

  @GET('/api/insights/dashboard')
  Future<ApiResponse<AIInsights>> getAIInsights(
    @Query('timeframe') String timeframe,
  );

  @GET('/api/predictions/maintenance')
  Future<ApiResponse<List<MaintenancePrediction>>> getMaintenancePredictions();

  @GET('/api/analytics/quality')
  Future<ApiResponse<QualityAnalytics>> getQualityAnalytics();
}

// Dio provider with interceptors
final dioProvider = Provider<Dio>((ref) {
  final dio = Dio();

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) {
        // Add auth token if available
        final token = ref.read(storageServiceProvider).getToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer \$token';
        }
        handler.next(options);
      },
      onError: (error, handler) {
        // Handle common errors
        if (error.response?.statusCode == 401) {
          // Token expired, logout user
          ref.read(authProvider.notifier).logout();
        }
        handler.next(error);
      },
    ),
  );

  return dio;
});

// API service providers
final coreApiProvider = Provider<CoreApiService>((ref) {
  return CoreApiService(ref.watch(dioProvider));
});

final qrApiProvider = Provider<QRApiService>((ref) {
  return QRApiService(ref.watch(dioProvider));
});

final aiApiProvider = Provider<AIApiService>((ref) {
  return AIApiService(ref.watch(dioProvider));
});
