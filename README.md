# Smart Field Survey App

A React Native (Expo SDK 54) application designed for field surveyors to collect, manage, and export survey data on the go.

## Features

### Dashboard
- Overview of today's survey count, total surveys, and active surveys
- Quick action cards for camera, location, contacts, clipboard, and creating new surveys
- Interactive map (react-native-maps) displaying survey locations with pins
- Recent surveys list with priority and status badges
- Pull-to-refresh support

### Multi-Step Survey Creation
- 4-step form workflow: Site Info, Survey Details, GPS Location, Review
- Step progress indicator with validation per step
- Optional GPS location capture using expo-location (can be skipped)
- Priority selection (High, Medium, Low) and status tracking
- Survey photos attached directly to entries
- Automatic offline persistence via expo-file-system

### Camera & Media
- Live camera capture using expo-camera
- Photos saved to device gallery with fallback to expo-sharing
- Photo attachment to individual survey entries

### Location & Maps
- GPS coordinate capture during survey creation
- Interactive MapView on dashboard showing all survey pins
- Map preview on survey detail screen
- Location permission handling

### Survey History & Management
- Searchable survey history with text filter
- Priority filter (High, Medium, Low)
- Survey preview with full details, photos, and map location
- Edit existing surveys inline
- Submit surveys to update status

### PDF Export
- Generate PDF reports from any survey using expo-print
- Share PDFs via expo-sharing to any app on the device

### Dark & Light Mode
- Toggle between Light and Dark themes
- System theme preference support
- Theme persisted across app restarts via expo-file-system

### Profile
- Profile image picker with gallery selection
- Profile image persistence via expo-file-system
- Employee details, contact info, and field preferences
- Survey completion stats with progress bar
- Workload summary with pending and high-priority counts

### Notifications
- In-app alert notifications for pending survey reminders
- Daily reminder scheduling support (native builds)

### Offline Support
- All surveys stored locally in expo-file-system (no backend required)
- Data survives app restarts and is loaded on mount

## Tech Stack

| Technology | Purpose |
|---|---|
| React Native 0.81 | Mobile framework |
| Expo SDK 54 | Development platform |
| Expo Router v6 | File-based navigation |
| Expo Camera | Camera capture |
| Expo Location | GPS coordinates |
| Expo File System | Local data persistence |
| Expo Print | PDF generation |
| Expo Sharing | File sharing |
| Expo Image Picker | Gallery image selection |
| Expo Media Library | Gallery save |
| react-native-maps | Interactive maps |
| react-native-reanimated | Animations |
| @expo/vector-icons | Ionicons |

## Getting Started

1. Navigate to the app folder:
   ```bash
   cd SmartFieldSurvey
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the app:
   ```bash
   npm start
   ```

4. Scan the QR code with Expo Go on your Android or iOS device.

## Project Structure

```
SmartFieldSurvey/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx        # Tab navigator
│   │   ├── index.tsx          # Dashboard
│   │   ├── create.tsx         # Multi-step survey form
│   │   ├── history.tsx        # Survey history
│   │   └── profile.tsx        # Profile & settings
│   ├── camera.tsx             # Camera screen
│   ├── contacts.tsx           # Contacts screen
│   ├── clipboard.tsx          # Clipboard screen
│   ├── location.tsx           # Location screen
│   ├── survey-preview.tsx     # Survey detail & export
│   └── _layout.tsx            # Root layout
├── components/
│   ├── AppHeader.tsx
│   └── QuickActionCard.tsx
├── constants/
│   ├── data.ts                # Mock data & interfaces
│   └── theme.ts               # Light/dark color definitions
├── context/
│   └── SurveyContext.tsx       # Global state & persistence
├── hooks/
│   ├── use-color-scheme.ts    # Theme resolution
│   └── use-theme.ts           # Theme preference & toggle
└── utils/
    └── notifications.ts       # Notification helpers
```

## License

This project is for educational and demonstration purposes.
