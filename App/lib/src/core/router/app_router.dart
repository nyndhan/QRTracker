import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../providers/auth_provider.dart';
import '../../features/auth/pages/login_page.dart';
import '../../features/dashboard/pages/dashboard_page.dart';
import '../../features/qr/pages/qr_scan_page.dart';
import '../../features/qr/pages/qr_generate_page.dart';
import '../../features/qr/pages/qr_history_page.dart';
import '../../features/railway/pages/railway_dashboard_page.dart';
import '../../features/railway/pages/component_list_page.dart';
import '../../features/ai/pages/ai_analytics_page.dart';
import '../../features/profile/pages/profile_page.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: authState.isAuthenticated ? '/dashboard' : '/login',
    routes: [
      // Auth Routes
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),

      // Main App Routes
      GoRoute(
        path: '/dashboard',
        builder: (context, state) => const DashboardPage(),
      ),

      // QR Routes
      GoRoute(
        path: '/qr-scan',
        builder: (context, state) => const QRScanPage(),
      ),
      GoRoute(
        path: '/qr-generate',
        builder: (context, state) => const QRGeneratePage(),
      ),
      GoRoute(
        path: '/qr-history',
        builder: (context, state) => const QRHistoryPage(),
      ),

      // Railway Routes
      GoRoute(
        path: '/railway',
        builder: (context, state) => const RailwayDashboardPage(),
      ),
      GoRoute(
        path: '/railway/components',
        builder: (context, state) => const ComponentListPage(),
      ),

      // AI Routes
      GoRoute(
        path: '/ai-analytics',
        builder: (context, state) => const AIAnalyticsPage(),
      ),

      // Profile Routes
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfilePage(),
      ),
    ],
    redirect: (context, state) {
      final isAuthenticated = authState.isAuthenticated;
      final isLoginRoute = state.location == '/login';

      if (!isAuthenticated && !isLoginRoute) {
        return '/login';
      }

      if (isAuthenticated && isLoginRoute) {
        return '/dashboard';
      }

      return null;
    },
  );
});
