# Railway AI QR Management System - Mobile App

## Overview
Complete Flutter mobile application for the Railway AI QR Management System, designed for Smart India Hackathon 2025.

## Features
- 🔐 **Secure Authentication** - JWT-based login with role management
- 📊 **Interactive Dashboard** - Real-time statistics and analytics
- 📱 **QR Code Management** - Advanced scanning and generation using AI Barcode Scanner
- 🚂 **Railway System Integration** - Complete railway component management
- 🤖 **AI Analytics** - Machine learning insights and predictions
- ⚡ **Real-time Updates** - WebSocket integration for live data
- 📈 **Charts & Analytics** - Beautiful data visualizations
- 🎯 **Offline Support** - Local data caching with Hive

## Tech Stack
- **Flutter 3.10+** - Cross-platform mobile framework
- **Riverpod** - State management
- **Dio & Retrofit** - HTTP client and API generation
- **AI Barcode Scanner** - QR code scanning (Linux compatible)
- **Hive** - Local database
- **FL Chart** - Data visualization
- **Go Router** - Navigation

## Backend Integration
The app connects to your hybrid backend architecture:
- **Core API (FastAPI)**: http://192.168.1.100:8000
- **QR Service (Node.js)**: http://192.168.1.100:3001
- **Real-time Service (Node.js)**: http://192.168.1.100:3002
- **AI Service (Python)**: http://192.168.1.100:8001

## Quick Start

### Prerequisites
- Flutter SDK 3.10+
- Android Studio or VS Code with Flutter extension
- Backend services running

### Installation
```bash
# Clone and navigate to project
cd railway-ai-qr-mobile

# Get dependencies
flutter pub get

# Generate code (for JSON serialization)
flutter packages pub run build_runner build

# Run the app
flutter run
```

### Development Setup
1. **Update API URLs** in `lib/src/core/services/api_service.dart`
2. **Configure permissions** for camera access
3. **Test QR scanning** with real railway component codes
4. **Verify backend connectivity** in debug mode

## Project Structure
```
lib/
├── src/
│   ├── core/                    # Core functionality
│   │   ├── models/             # Data models
│   │   ├── providers/          # State providers
│   │   ├── router/             # Navigation
│   │   ├── services/           # API and services
│   │   └── theme/              # App theming
│   └── features/               # Feature modules
│       ├── auth/               # Authentication
│       ├── dashboard/          # Main dashboard
│       ├── qr/                 # QR management
│       ├── railway/            # Railway systems
│       └── ai/                 # AI analytics
```

## Key Features

### 🔐 Authentication
- JWT token-based authentication
- Role-based access control
- Secure token storage
- Auto-refresh mechanism

### 📱 QR Code Management
- **AI Barcode Scanner** - Camera-based scanning (no file picker)
- **QR Generation** - Create QR codes for railway components
- **History Tracking** - Complete scan and generation history
- **Batch Operations** - Multiple QR operations

### 🚂 Railway Management
- Track management and monitoring
- Component lifecycle tracking
- Digital inspection workflows
- Maintenance scheduling
- Inventory management

### 🤖 AI Analytics
- Predictive maintenance insights
- Quality analytics
- Anomaly detection
- Performance metrics
- ML-powered recommendations

### ⚡ Real-time Features
- Live WebSocket connections
- Push notifications
- Real-time data synchronization
- Multi-user collaboration

## Demo Credentials
- **Admin**: admin / admin123
- **Inspector**: inspector / inspector123

## Permissions Required
- **Camera** - For QR code scanning
- **Internet** - For API communication
- **Storage** - For local data caching

## Configuration

### API Configuration
Update the API endpoints in `lib/src/core/services/api_service.dart`:

```dart
class ApiConfig {
  static const String coreApiUrl = 'http://YOUR_IP:8000';
  static const String qrServiceUrl = 'http://YOUR_IP:3001';
  static const String realtimeServiceUrl = 'http://YOUR_IP:3002';
  static const String aiServiceUrl = 'http://YOUR_IP:8001';
}
```

### Build Configuration
- **Debug**: `flutter run`
- **Release**: `flutter build apk --release`
- **Profile**: `flutter run --profile`

## Platform Support
- ✅ **Android** - Full support with camera permissions
- ✅ **iOS** - Full support with camera permissions
- ❌ **Linux** - QR scanning via camera (no file picker as requested)

## Smart India Hackathon 2025 Ready
This mobile app is specifically designed for SIH 2025 submission with:
- ✅ Professional UI/UX design
- ✅ Complete backend integration
- ✅ Real-time capabilities
- ✅ AI/ML integration
- ✅ Railway-specific workflows
- ✅ Production-ready architecture
- ✅ Comprehensive documentation

## Contributing
1. Follow Flutter coding conventions
2. Use proper state management patterns
3. Implement proper error handling
4. Add comprehensive tests
5. Update documentation

## Support
For technical support or questions about the mobile app implementation, please refer to the project documentation or contact the development team.

## License
This project is developed for Smart India Hackathon 2025.
