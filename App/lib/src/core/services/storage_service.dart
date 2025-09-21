import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class StorageService {
  static SharedPreferences? _prefs;

  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  static const String _tokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';
  static const String _userKey = 'user_data';

  String? getToken() {
    return _prefs?.getString(_tokenKey);
  }

  Future<bool> saveToken(String token) async {
    return await _prefs?.setString(_tokenKey, token) ?? false;
  }

  String? getRefreshToken() {
    return _prefs?.getString(_refreshTokenKey);
  }

  Future<bool> saveRefreshToken(String token) async {
    return await _prefs?.setString(_refreshTokenKey, token) ?? false;
  }

  Future<bool> clearAuth() async {
    final results = await Future.wait([
      _prefs?.remove(_tokenKey) ?? Future.value(false),
      _prefs?.remove(_refreshTokenKey) ?? Future.value(false),
      _prefs?.remove(_userKey) ?? Future.value(false),
    ]);

    return results.every((result) => result);
  }
}

final storageServiceProvider = Provider<StorageService>((ref) {
  return StorageService();
});
