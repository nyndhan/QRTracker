import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'api_service.dart';

class WebSocketService {
  WebSocketChannel? _channel;
  bool _isConnected = false;

  bool get isConnected => _isConnected;

  Future<void> connect(String token) async {
    try {
      final uri = Uri.parse('${ApiConfig.realtimeServiceUrl}/socket.io/');
      _channel = WebSocketChannel.connect(
        uri,
        protocols: ['websocket'],
      );

      // Send auth token
      _channel?.sink.add(jsonEncode({
        'type': 'auth',
        'token': token,
      }));

      _isConnected = true;

      _channel?.stream.listen(
        _handleMessage,
        onDone: _handleDisconnection,
        onError: _handleError,
      );
    } catch (e) {
      _isConnected = false;
      print('WebSocket connection error: $e');
    }
  }

  void _handleMessage(dynamic message) {
    try {
      final data = jsonDecode(message);
      // Handle different message types
      switch (data['type']) {
        case 'qr_scan':
          _handleQRScanEvent(data['data']);
          break;
        case 'maintenance_alert':
          _handleMaintenanceAlert(data['data']);
          break;
        case 'system_update':
          _handleSystemUpdate(data['data']);
          break;
      }
    } catch (e) {
      print('Error handling WebSocket message: $e');
    }
  }

  void _handleQRScanEvent(Map<String, dynamic> data) {
    // Handle QR scan events
    print('QR Scan Event: $data');
  }

  void _handleMaintenanceAlert(Map<String, dynamic> data) {
    // Handle maintenance alerts
    print('Maintenance Alert: $data');
  }

  void _handleSystemUpdate(Map<String, dynamic> data) {
    // Handle system updates
    print('System Update: $data');
  }

  void _handleDisconnection() {
    _isConnected = false;
    print('WebSocket disconnected');
  }

  void _handleError(error) {
    _isConnected = false;
    print('WebSocket error: $error');
  }

  void disconnect() {
    _channel?.sink.close();
    _isConnected = false;
  }

  void sendMessage(Map<String, dynamic> message) {
    if (_isConnected) {
      _channel?.sink.add(jsonEncode(message));
    }
  }
}

final webSocketServiceProvider = StateProvider<WebSocketService>((ref) {
  return WebSocketService();
});
