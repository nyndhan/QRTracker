import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';

import '../../../core/providers/auth_provider.dart';
import '../../../core/services/api_service.dart';
import '../widgets/stats_card.dart';
import '../widgets/quick_actions.dart';

class DashboardPage extends ConsumerStatefulWidget {
  const DashboardPage({super.key});

  @override
  ConsumerState<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends ConsumerState<DashboardPage> {
  bool _isLoading = true;
  Map<String, dynamic>? _railwayStats;
  Map<String, dynamic>? _qrStats;
  Map<String, dynamic>? _aiInsights;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    setState(() => _isLoading = true);

    try {
      final futures = await Future.wait([
        ref.read(coreApiProvider).getRailwayAnalytics('7d'),
        ref.read(qrApiProvider).getQRAnalytics('7d'),
        ref.read(aiApiProvider).getAIInsights('7d'),
      ]);

      setState(() {
        _railwayStats = futures[0].data?.toJson();
        _qrStats = futures[1].data?.toJson();
        _aiInsights = futures[2].data?.toJson();
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      _showError('Failed to load dashboard data');
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            onPressed: _loadDashboardData,
            icon: const Icon(Icons.refresh),
          ),
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'logout') {
                ref.read(authProvider.notifier).logout();
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'logout',
                child: Text('Logout'),
              ),
            ],
            child: CircleAvatar(
              backgroundColor: Theme.of(context).primaryColor,
              child: Text(
                user?.firstName?.substring(0, 1).toUpperCase() ?? 'U',
                style: const TextStyle(color: Colors.white),
              ),
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadDashboardData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome Section
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Welcome back, ${user?.firstName ?? 'User'}!',
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Railway AI QR Management System',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[600],
                        ),
                      ),
                      if (user?.role != null) ...[
                        const SizedBox(height: 8),
                        Chip(
                          label: Text(user!.role!.toUpperCase()),
                          backgroundColor: Theme.of(context).primaryColor.withOpacity(0.1),
                        ),
                      ],
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Quick Actions
              const QuickActionsWidget(),

              const SizedBox(height: 16),

              // Stats Cards
              if (_isLoading) ...[
                _buildLoadingCards(),
              ] else ...[
                _buildStatsCards(),
              ],

              const SizedBox(height: 16),

              // Charts Section
              if (!_isLoading) ...[
                _buildChartsSection(),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLoadingCards() {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      childAspectRatio: 1.5,
      mainAxisSpacing: 16,
      crossAxisSpacing: 16,
      children: List.generate(
        4,
        (index) => const StatsCard(
          title: '',
          value: '',
          icon: Icons.hourglass_empty,
          isLoading: true,
        ),
      ),
    );
  }

  Widget _buildStatsCards() {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      childAspectRatio: 1.5,
      mainAxisSpacing: 16,
      crossAxisSpacing: 16,
      children: [
        StatsCard(
          title: 'Total Tracks',
          value: (_railwayStats?['totalTracks'] ?? 0).toString(),
          icon: Icons.train,
          color: Colors.blue,
          trend: _railwayStats?['tracksTrend']?.toDouble(),
        ),
        StatsCard(
          title: 'Active Components',
          value: (_railwayStats?['activeComponents'] ?? 0).toString(),
          icon: Icons.engineering,
          color: Colors.green,
          trend: _railwayStats?['componentsTrend']?.toDouble(),
        ),
        StatsCard(
          title: 'QR Codes',
          value: (_qrStats?['totalGenerated'] ?? 0).toString(),
          icon: Icons.qr_code,
          color: Colors.purple,
          trend: _qrStats?['generatedTrend']?.toDouble(),
        ),
        StatsCard(
          title: 'Inspections',
          value: (_railwayStats?['inspectionsToday'] ?? 0).toString(),
          icon: Icons.assignment_turned_in,
          color: Colors.orange,
          trend: _railwayStats?['inspectionsTrend']?.toDouble(),
        ),
      ],
    );
  }

  Widget _buildChartsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Analytics Overview',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'QR Scans This Week',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  height: 200,
                  child: LineChart(
                    LineChartData(
                      gridData: const FlGridData(show: true),
                      titlesData: const FlTitlesData(show: true),
                      borderData: FlBorderData(show: true),
                      lineBarsData: [
                        LineChartBarData(
                          spots: _generateSampleData(),
                          isCurved: true,
                          color: Theme.of(context).primaryColor,
                          barWidth: 3,
                          belowBarData: BarAreaData(
                            show: true,
                            color: Theme.of(context).primaryColor.withOpacity(0.3),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  List<FlSpot> _generateSampleData() {
    // Sample data for demonstration
    return [
      const FlSpot(0, 10),
      const FlSpot(1, 15),
      const FlSpot(2, 12),
      const FlSpot(3, 18),
      const FlSpot(4, 25),
      const FlSpot(5, 22),
      const FlSpot(6, 30),
    ];
  }
}
