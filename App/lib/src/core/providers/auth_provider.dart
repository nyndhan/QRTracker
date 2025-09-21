import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/user_model.dart';
import '../models/auth_state.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier(this._coreApi, this._storage) : super(const AuthState.initial()) {
    _checkAuthStatus();
  }

  final CoreApiService _coreApi;
  final StorageService _storage;

  Future<void> _checkAuthStatus() async {
    final token = _storage.getToken();
    if (token != null) {
      try {
        final response = await _coreApi.getCurrentUser();
        if (response.success && response.data != null) {
          state = AuthState.authenticated(response.data!);
        } else {
          await logout();
        }
      } catch (e) {
        await logout();
      }
    }
  }

  Future<bool> login(String username, String password) async {
    state = const AuthState.loading();

    try {
      final response = await _coreApi.login(username, password);

      if (response.success && response.data != null) {
        await _storage.saveToken(response.data!.accessToken);
        if (response.data!.refreshToken != null) {
          await _storage.saveRefreshToken(response.data!.refreshToken!);
        }

        final userResponse = await _coreApi.getCurrentUser();
        if (userResponse.success && userResponse.data != null) {
          state = AuthState.authenticated(userResponse.data!);
          return true;
        }
      }

      state = AuthState.error(response.message ?? 'Login failed');
      return false;
    } catch (e) {
      state = AuthState.error('Network error: ${e.toString()}');
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await _coreApi.logout();
    } catch (e) {
      // Ignore logout API errors
    } finally {
      await _storage.clearAuth();
      state = const AuthState.unauthenticated();
    }
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    ref.watch(coreApiProvider),
    ref.watch(storageServiceProvider),
  );
});
