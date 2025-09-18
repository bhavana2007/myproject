# Phone Connection Guide for Flutter App

## Method 1: USB Debugging (Recommended)

### Step 1: Enable Developer Options on Your Phone
1. Go to **Settings** > **About Phone**
2. Tap **Build Number** 7 times
3. You'll see "You are now a developer!" message

### Step 2: Enable USB Debugging
1. Go to **Settings** > **Developer Options**
2. Turn on **USB Debugging**
3. Turn on **Install via USB** (if available)

### Step 3: Connect Phone to Computer
1. Connect phone to computer using USB cable
2. On your phone, tap "Allow USB Debugging" when prompted
3. Select "Always allow from this computer"

### Step 4: Verify Connection
Open Command Prompt/PowerShell and run:
```bash
flutter devices
```
You should see your phone listed.

### Step 5: Run the App
```bash
flutter run
```

## Method 2: Wireless Debugging (Android 11+)

### Step 1: Enable Wireless Debugging
1. Go to **Settings** > **Developer Options**
2. Turn on **Wireless Debugging**
3. Tap **Pair device with pairing code**
4. Note the IP address and port (e.g., 192.168.1.100:5555)

### Step 2: Connect from Computer
```bash
adb pair 192.168.1.100:5555
# Enter the pairing code when prompted
adb connect 192.168.1.100:5555
```

### Step 3: Run the App
```bash
flutter run
```

## Method 3: APK Installation

### Step 1: Build APK
```bash
flutter build apk --release
```

### Step 2: Install on Phone
1. Copy the APK file from `build/app/outputs/flutter-apk/` to your phone
2. Enable "Install from Unknown Sources" in phone settings
3. Install the APK file

## Troubleshooting

### Phone Not Detected
1. Try different USB cable
2. Install phone drivers (Samsung, Xiaomi, etc.)
3. Restart ADB: `adb kill-server && adb start-server`

### App Crashes
1. Check Flutter doctor: `flutter doctor`
2. Update Flutter: `flutter upgrade`
3. Clean build: `flutter clean && flutter pub get`

### Permission Issues
1. Grant all permissions when app asks
2. Check phone storage space
3. Restart the app

## Required Software
- **Flutter SDK** (installed)
- **Android Studio** (for Android development)
- **Phone drivers** (Samsung, Xiaomi, OnePlus, etc.)
- **ADB** (comes with Android Studio)

## Quick Commands
```bash
# Check connected devices
flutter devices

# Run app on connected device
flutter run

# Build APK for installation
flutter build apk

# Check Flutter installation
flutter doctor

# Clean and rebuild
flutter clean
flutter pub get
flutter run
```

## Notes
- Keep phone unlocked during development
- USB debugging must stay enabled
- Some phones need OEM drivers installed
- Wireless debugging works best on same WiFi network
