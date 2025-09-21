import 'package:flutter/foundation.dart';

import 'user_model.dart';

@immutable
class AuthState {
  final bool isAuthenticated;
  final bool isLoading;
  final UserModel? user;
  final String? error;

  const AuthState._({
    required this.isAuthenticated,
    required this.isLoading,
    this.user,
    this.error,
  });

  const AuthState.initial()
      : this._(
          isAuthenticated: false,
          isLoading: false,
        );

  const AuthState.loading()
      : this._(
          isAuthenticated: false,
          isLoading: true,
        );

  const AuthState.authenticated(UserModel user)
      : this._(
          isAuthenticated: true,
          isLoading: false,
          user: user,
        );

  const AuthState.unauthenticated()
      : this._(
          isAuthenticated: false,
          isLoading: false,
        );

  const AuthState.error(String error)
      : this._(
          isAuthenticated: false,
          isLoading: false,
          error: error,
        );

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AuthState &&
        other.isAuthenticated == isAuthenticated &&
        other.isLoading == isLoading &&
        other.user == user &&
        other.error == error;
  }

  @override
  int get hashCode {
    return isAuthenticated.hashCode ^
        isLoading.hashCode ^
        user.hashCode ^
        error.hashCode;
  }
}
