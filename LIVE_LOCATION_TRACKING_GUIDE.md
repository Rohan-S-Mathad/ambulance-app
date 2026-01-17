# 📍 Live Location Tracking Guide

## ✅ New Features Implemented!

### Overview

Your ambulance emergency system now has **complete live location tracking** with automatic updates
every 10 seconds!

---

## 🚑 Ambulance Features

### 1. Pending Patient Display

When an emergency alert arrives:

- 🚨 **Clear alert notification** with incident ID
- 📍 **Patient coordinates** displayed
- ✅ **Accept/Reject buttons** to respond
- 💬 **Clear status messages** at every step

### 2. Accept Flow

After accepting an emergency:

1. **Incident assigned confirmation** message
2. **Patient location coordinates** shown in real-time
3. **"View Live Location" button** becomes active
4. Button remains accessible for entire journey

### 3. Live Patient Tracking Screen

Features:

- 🗺️ **Google Maps integration** with patient marker (RED)
- 📍 **Your location marker** (BLUE)
- 📏 **Distance calculation** between you and patient
- ⏱️ **ETA estimation** (based on 40 km/h average speed)
- 🔄 **Auto-updates every 10 seconds**
- 📊 **Live coordinate display** (6 decimal places)
- ⏰ **Last update timestamp** showing HH:MM:SS

### 4. Control Buttons

- 🔄 **Refresh**: Manual refresh of all locations
- 📍 **Center**: Center map on patient location
- 🗺️ **Navigate**: Open Google Maps turn-by-turn navigation

### 5. Live Updates

- **Patient coordinates**: Update every 10 seconds from Firestore
- **Ambulance location**: Updates every 10 seconds from GPS
- **Map markers**: Move smoothly to new positions
- **Distance & ETA**: Recalculated automatically

---

## 🏥 Hospital Features

### 1. Pending Patient Display

When an emergency alert arrives:

- 🚨 **Emergency alert card** with full details
- 👤 **Patient ID** and **Incident ID**
- 📍 **Patient location** in coordinates
- ⏰ **Timestamp** of emergency
- ✅ **Accept/Reject buttons**

### 2. Accept Flow

After accepting an emergency:

1. **Assignment confirmation** displayed
2. **Patient location** shown in coordinate system
3. **Live updates start automatically**
4. Coordinates update every 10 seconds

### 3. Live Location Updates

Features:

- 📍 **6-decimal precision** coordinates (e.g., 12.971600, 77.594600)
- 🔄 **Auto-refresh every 10 seconds**
- 📊 **Lat/Lon display** in easy-to-read format
- ✅ **No manual refresh needed** - fully automatic
- 💚 **Status indicator** showing "Patient Assigned"

### 4. Continuous Monitoring

- Updates continue while activity is open
- Firestore listener for real-time changes
- Fallback retry on network errors
- Clean resource cleanup on exit

---

## 🎯 Technical Implementation

### Ambulance Activity

```kotlin
// Location: app/src/main/java/com/example/ambulance/ui/ambulance/AmbulanceActivity.kt

Features:
- Real-time broadcast listening
- Patient location fetching from Firestore
- "View Live Location" button
- State management (pending → accepted → tracking)
```

### Patient Tracking Activity

```kotlin
// Location: app/src/main/java/com/example/ambulance/ui/ambulance/PatientTrackingActivity.kt

Features:
- Google Maps integration
- Dual markers (patient RED, ambulance BLUE)
- FusedLocationProvider for ambulance GPS
- Firestore snapshot listener for patient updates
- Handler with 10-second intervals
- Distance calculation using Haversine formula
- ETA estimation
- Resource cleanup (listeners, handlers)
```

### Hospital Activity

```kotlin
// Location: app/src/main/java/com/example/ambulance/ui/hospital/HospitalActivity.kt

Features:
- Emergency broadcast listening
- First-Accept-Wins algorithm
- Live coordinate updates every 10 seconds
- Firestore real-time listener
- Timestamp display
- Automatic retry on errors
```

---

## 📱 User Flow

### For Ambulance Driver

```
1. Open App → Select "Ambulance" → Login
   ↓
2. Wait for Emergency Alert
   ↓
3. Emergency Arrives → See Patient Location
   ↓
4. Press "Accept" Button
   ↓
5. Incident Assigned → "View Live Location" Button Activates
   ↓
6. Press "View Live Location"
   ↓
7. See Patient on Map with Live Updates Every 10 Seconds
   ↓
8. Use "Navigate" to Open Google Maps Turn-by-Turn
   ↓
9. Arrive at Patient Location
```

### For Hospital Staff

```
1. Open App → Select "Hospital" → Login
   ↓
2. Wait for Emergency Alert
   ↓
3. Emergency Arrives → See Patient Details & Location
   ↓
4. Press "Accept" Button
   ↓
5. Patient Assigned → See Live Coordinates
   ↓
6. Coordinates Update Every 10 Seconds Automatically
   ↓
7. Prepare Emergency Room
   ↓
8. Ambulance Brings Patient
```

---

## 🔧 Configuration

### Update Interval

Default: **10 seconds**

To change:

```kotlin
// In PatientTrackingActivity.kt or HospitalActivity.kt
private val updateInterval = 10000L // Change to desired milliseconds
```

### ETA Speed Assumption

Default: **40 km/h**

To change:

```kotlin
// In PatientTrackingActivity.kt, calculateDistance() method
val eta = (distance / 40.0 * 60).toInt() // Change 40.0 to desired speed
```

---

## 📊 Data Flow

### Ambulance → Patient Tracking

```
User Presses Emergency
    ↓
Firestore: incidents/{incidentId}
    ↓
Ambulance Activity Receives Broadcast
    ↓
Fetch Patient Lat/Lon
    ↓
Accept Incident
    ↓
Open PatientTrackingActivity
    ↓
Every 10 seconds:
    - Listen to Firestore incidents/{incidentId}
    - Get FusedLocationProvider (ambulance GPS)
    - Update markers on map
    - Calculate distance & ETA
    - Update UI
```

### Hospital Monitoring

```
User Presses Emergency
    ↓
Firestore: incidents/{incidentId}
    ↓
Hospital Activity Receives Broadcast
    ↓
Display Patient Details
    ↓
Accept Emergency
    ↓
Start Live Updates:
    Every 10 seconds:
        - Query Firestore incidents/{incidentId}
        - Get latest userLat, userLon
        - Update TextView displays
        - Show timestamp
```

---

## 🎨 UI Elements

### Ambulance - Main Screen

- Emergency alert text (multi-line, center-aligned)
- Reject button (outlined, left)
- Accept button (filled pink, right)
- **View Live Location button** (filled green, full-width)

### Ambulance - Tracking Screen

- Google Map (full screen background)
- Top card: Distance, ETA, Last Update timestamp
- Bottom card: Patient info, coordinates, control buttons
- Status bar: "En Route • Updates every 10 seconds"

### Hospital - Main Screen

- Emergency alert card with:
    - Header with timestamp
    - Patient details section
    - Location coordinates (6 decimals)
    - Accept/Reject buttons
    - Assignment status (after accept)

---

## ✅ Testing Checklist

### Ambulance Testing

- [ ] Receive emergency alert
- [ ] See patient coordinates
- [ ] Press Accept button
- [ ] View Live Location button becomes active
- [ ] Open tracking screen
- [ ] See patient marker (RED) on map
- [ ] See your location marker (BLUE) on map
- [ ] Verify distance calculation
- [ ] Verify ETA display
- [ ] Check coordinates update every 10 seconds
- [ ] Test Refresh button
- [ ] Test Center button
- [ ] Test Navigate button (opens Google Maps)
- [ ] Verify last update timestamp changes

### Hospital Testing

- [ ] Receive emergency alert
- [ ] See patient details in card
- [ ] See coordinates (6 decimals)
- [ ] Press Accept button
- [ ] Assignment status shows
- [ ] Coordinates visible after accept
- [ ] Wait 10 seconds - coordinates update
- [ ] Verify continuous updates
- [ ] Check no manual refresh needed
- [ ] Test back button (clean exit)

---

## 🔍 Troubleshooting

### Problem: Location Not Updating

**Ambulance:**

1. Check location permission granted
2. Enable GPS on device
3. Check network connection
4. Verify Firestore rules allow read access

**Hospital:**

1. Check network connection
2. Verify Firestore incident document exists
3. Check console for error messages

### Problem: Map Not Showing

**Solution:**

1. Enable Google Maps API in Firebase
2. Add API key to `AndroidManifest.xml`
3. Check location permission
4. Verify Google Play Services installed

### Problem: "No Location Available"

**Solution:**

1. Go outside or near window (better GPS signal)
2. Wait 10-20 seconds for GPS lock
3. Check location services enabled
4. Try pressing Refresh button

---

## 🚀 Performance

### Network Usage

- Firestore read: ~1 KB per update
- Update frequency: Every 10 seconds
- Total: ~360 KB per hour (minimal)

### Battery Impact

- GPS polling: Every 10 seconds
- Firestore listeners: Real-time
- Impact: Low to moderate
- Recommendation: Keep phone charged during ambulance duty

### Memory

- Map tiles cached automatically
- Handlers cleaned up on destroy
- Listeners removed on activity exit
- No memory leaks

---

## 📝 Important Notes

### For Ambulance Drivers

1. Keep location services ON
2. Keep app in foreground for best updates
3. Phone should be charged/charging
4. Use Navigate button for turn-by-turn directions
5. Updates are automatic - no manual refresh needed

### For Hospital Staff

1. Coordinates update automatically
2. No action needed after accepting
3. Monitor for patient arrival
4. Prepare based on ETA from ambulance
5. System handles all updates in background

---

## 🎓 Code Architecture

### Key Classes

1. **AmbulanceActivity**: Main dashboard, handles broadcasts
2. **PatientTrackingActivity**: Live map with dual tracking
3. **HospitalActivity**: Emergency management with live updates
4. **FirestoreRepository**: Database operations
5. **IncidentViewModel**: MVVM pattern for state management

### Design Patterns

- **Observer Pattern**: LiveData for reactive UI
- **Repository Pattern**: Data access abstraction
- **MVVM**: Separation of concerns
- **Singleton**: Firestore instance
- **Handler Pattern**: Periodic updates

---

## 🔄 Update Mechanism

### Ambulance Tracking

```
Periodic Handler (10s)
    ↓
Get Current Location (GPS)
    ↓
Listen to Firestore (Patient)
    ↓
Update Both Markers
    ↓
Recalculate Distance/ETA
    ↓
Update UI
    ↓
Schedule Next Update
```

### Hospital Monitoring

```
Periodic Handler (10s)
    ↓
Query Firestore for Latest
    ↓
Get userLat, userLon
    ↓
Update TextView Displays
    ↓
Update Timestamp
    ↓
Schedule Next Update
```

---

## 🎉 Success Indicators

### System Working When:

✅ Ambulance sees "View Live Location" button after accepting
✅ Tracking screen shows both markers on map
✅ Distance and ETA update automatically
✅ Timestamp changes every 10 seconds
✅ Hospital sees coordinates updating
✅ Navigate button opens Google Maps
✅ No errors in console
✅ Smooth performance

---

**System Status:** ✅ Fully Functional!
**Last Updated:** December 9, 2025
**Version:** 2.0 with Live Tracking
