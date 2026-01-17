# Hospital Dashboard - Smart Ambulance Dispatch System

## Overview

The Hospital Dashboard is a professional, real-time emergency management interface for hospitals to
receive, review, and accept patient emergencies from the Smart Ambulance Dispatch system.

## Features

### ✅ Real-Time Emergency Alerts

- Automatic listening for emergency broadcasts via Firebase Firestore
- Instant notification when new emergencies are available
- Live updates without manual refresh

### ✅ Patient Information Display

- Incident ID and Patient ID
- Precise GPS coordinates (Latitude/Longitude)
- Timestamp of emergency creation
- Clear, professional layout

### ✅ First-Accept Wins Algorithm

- Atomic Firestore transactions ensure only ONE hospital can accept
- If another hospital accepts first, automatic cancellation occurs
- Race condition protection built-in

### ✅ Action Controls

- **Accept Button**: Assigns the emergency to this hospital
- **Reject Button**: Declines the emergency (soft rejection)
- Buttons disabled during processing to prevent double-clicks

### ✅ Status Feedback

- Success: "✓ You have been assigned to this emergency"
- Failure: "✗ Another hospital already accepted"
- Clear visual indicators (green for success, red for cancellation)

---

## Architecture

### Technology Stack

- **Language**: Kotlin
- **UI Framework**: XML with Material Design Components
- **Database**: Firebase Firestore
- **Architecture Pattern**: MVVM-lite (direct Firestore access)
- **Async Operations**: Kotlin Coroutines

### File Structure

```
app/src/main/
├── java/com/example/ambulance/
│   ├── ui/hospital/
│   │   └── HospitalActivity.kt          # Main hospital logic
│   ├── data/
│   │   ├── FirestoreRepository.kt       # Database operations
│   │   └── models/
│   │       ├── Incident.kt              # Incident data class
│   │       └── Broadcast.kt             # Broadcast data class
└── res/layout/
    └── activity_hospital.xml            # Hospital UI layout
```

---

## UI Components

### Header Section

- **Title**: "Hospital Dashboard"
- **Hospital ID**: Displays the current hospital identifier
- **Background**: Blue (#1976D2)

### Status Message

- Shown when waiting for emergencies
- Text: "Waiting for emergency alerts..."

### Emergency Alert Card

- **Material CardView** with elevation
- Contains:
    - Emergency header with icon (🚨)
    - Timestamp (e.g., "Dec 07, 2025 23:45")
    - Patient Details section
    - Location information (Lat/Lon)
    - Action buttons (Accept/Reject)
    - Status indicators (Assignment/Cancelled)

### Action Buttons

- **Accept Button**: Primary action, blue (#1976D2)
- **Reject Button**: Outlined, red (#D32F2F)
- Buttons hide after action is taken

### Status Cards

- **Assignment Status**: Green background (#E8F5E9)
- **Cancelled Status**: Red background (#FFEBEE)

### Instructions Card

- Gray background (#F5F5F5)
- Provides usage guidelines
- Always visible when no active emergency

---

## Firestore Data Structure

### Collections

#### 1. `incidents`

```kotlin
{
  incidentId: String,
  userId: String,
  userLat: Double,
  userLon: Double,
  createdAt: Timestamp,
  status: String,  // "pending", "ambulance_assigned", "hospital_assigned"
  assignedAmbId: String?,
  assignedHospId: String?
}
```

#### 2. `broadcasts`

```kotlin
{
  targetType: String,  // "hospital" or "ambulance"
  targetId: String,    // hospitalId or ambulanceId
  incidentId: String,
  status: String,      // "pending", "accepted", "rejected", "cancelled"
  timestamp: Timestamp
}
```

#### 3. `hospitals`

```kotlin
{
  hospitalId: String,
  name: String,
  location: GeoPoint,
  // ... other hospital details
}
```

---

## Core Functionality

### 1. Listening for Broadcasts

**Location**: `startListeningForBroadcasts()`

```kotlin
db.collection("broadcasts")
    .whereEqualTo("targetType", "hospital")
    .whereEqualTo("targetId", hospitalId)
    .whereEqualTo("status", "pending")
    .addSnapshotListener { snapshots, error ->
        // Handle real-time updates
    }
```

**What it does**:

- Creates a real-time listener on the `broadcasts` collection
- Filters for broadcasts targeted at this specific hospital
- Only shows pending broadcasts (not accepted/rejected/cancelled)
- Automatically updates UI when new broadcasts arrive

---

### 2. Accepting an Emergency

**Location**: `acceptEmergency(broadcast)`

**Process**:

1. Disable buttons to prevent duplicate clicks
2. Show "Processing acceptance..." toast
3. Start Firestore transaction on background thread
4. **Transaction READ phase**: Check if incident is already assigned
5. **Transaction WRITE phase**:
    - Assign hospital ID to incident
    - Update incident status to "hospital_assigned"
6. Commit transaction atomically
7. Update UI based on success/failure

**Transaction Code**:

```kotlin
val success = db.runTransaction { transaction ->
    val snapshot = transaction.get(incidentRef)
    val incident = snapshot.toObject(Incident::class.java)
    
    // Check if already assigned
    if (incident?.assignedHospId != null && 
        incident.assignedHospId.isNotEmpty()) {
        return@runTransaction false  // Another hospital was faster
    }
    
    // Assign to this hospital
    transaction.update(incidentRef, "assignedHospId", hospitalId)
    transaction.update(incidentRef, "status", "hospital_assigned")
    
    return@runTransaction true  // Success
}.await()
```

**Why Transaction?**:

- Prevents race conditions (two hospitals accepting simultaneously)
- Atomic operation (all-or-nothing)
- Read-then-write ensures data consistency

---

### 3. Cancelling Other Hospitals

**Location**: `cancelOtherHospitalBroadcasts(incidentId)`

**What it does**:

- After successful acceptance, finds all pending hospital broadcasts
- Updates their status to "cancelled"
- Excludes this hospital's broadcast (already marked "accepted")

**Code**:

```kotlin
db.collection("broadcasts")
    .whereEqualTo("targetType", "hospital")
    .whereEqualTo("incidentId", incidentId)
    .whereEqualTo("status", "pending")
    .get()
    .addOnSuccessListener { documents ->
        for (document in documents) {
            val targetId = document.getString("targetId")
            if (targetId != hospitalId) {
                document.reference.update("status", "cancelled")
            }
        }
    }
```

---

### 4. Rejecting an Emergency

**Location**: `rejectEmergency(broadcast)`

**What it does**:

- Updates this hospital's broadcast status to "rejected"
- Hides action buttons
- Shows rejection status message
- Does NOT affect other hospitals' broadcasts

---

## UI States

### State 1: Waiting

- Status message visible: "Waiting for emergency alerts..."
- Emergency card hidden
- Instructions card visible

### State 2: Emergency Alert Received

- Status message hidden
- Emergency card visible with patient details
- Action buttons (Accept/Reject) enabled
- Instructions card hidden

### State 3: Successfully Accepted

- Action buttons hidden
- Assignment status card visible (green)
- Message: "✓ You have been assigned to this emergency"
- Toast: "Patient Assigned. Prepare Emergency!"

### State 4: Another Hospital Accepted

- Action buttons hidden
- Cancelled status card visible (red)
- Message: "✗ Another hospital accepted this emergency"

### State 5: Rejected

- Action buttons hidden
- Cancelled status card visible (red)
- Message: "✗ You rejected this emergency"

---

## Color Scheme

| Element | Color | Hex Code |
|---------|-------|----------|
| Primary Blue | Blue | #1976D2 |
| Success Green | Green | #2E7D32 |
| Success Background | Light Green | #E8F5E9 |
| Error Red | Red | #C62828 |
| Error Background | Light Red | #FFEBEE |
| Text Primary | Dark Gray | #333333 |
| Text Secondary | Gray | #666666 |
| Text Tertiary | Light Gray | #999999 |
| Background | White | #FFFFFF |
| Border | Light Gray | #E0E0E0 |

---

## Testing Scenarios

### Scenario 1: Normal Acceptance

1. Create an incident from User app
2. Incident broadcasts to multiple hospitals
3. Hospital 1 clicks Accept
4. Transaction succeeds
5. Hospital 1 sees success message
6. Other hospitals see cancellation

### Scenario 2: Race Condition

1. Two hospitals see the same emergency
2. Both click Accept simultaneously
3. One transaction succeeds (first to commit)
4. Other transaction fails (incident already assigned)
5. First hospital sees success
6. Second hospital sees "already accepted" message

### Scenario 3: Rejection

1. Hospital receives emergency alert
2. Hospital clicks Reject
3. Broadcast marked as "rejected"
4. UI shows rejection message
5. Other hospitals still see the emergency

### Scenario 4: No Broadcasts

1. No active emergencies in system
2. Hospital sees "Waiting for emergency alerts..."
3. Instructions card displayed
4. No action buttons visible

---

## Error Handling

### Network Errors

- Toast messages display connection issues
- Buttons re-enabled if transaction fails
- User can retry action

### Permission Errors

- Firestore security rules must allow hospital reads/writes
- Proper authentication required

### Data Errors

- Null checks for all Firestore objects
- Default values in data classes
- Graceful degradation if fields missing

---

## Performance Considerations

### Firestore Optimization

- Single snapshot listener (not multiple)
- Proper cleanup in `onDestroy()`
- Indexed queries for fast filtering

### UI Performance

- View binding (no findViewById overhead)
- Efficient layouts (ConstraintLayout, LinearLayout)
- Minimal nesting depth

### Memory Management

- Listener removed when activity destroyed
- Coroutines cancelled automatically
- No memory leaks

---

## Security Considerations

### Firestore Rules (Example)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Hospitals can read their own broadcasts
    match /broadcasts/{broadcastId} {
      allow read: if request.auth != null && 
                     resource.data.targetType == "hospital" &&
                     resource.data.targetId == request.auth.uid;
      allow update: if request.auth != null;
    }
    
    // Hospitals can read and update incidents
    match /incidents/{incidentId} {
      allow read: if request.auth != null;
      allow update: if request.auth != null;
    }
  }
}
```

---

## Future Enhancements

### Possible Additions

1. **Map Integration**: Show patient location on Google Maps
2. **Distance Calculation**: Display distance from hospital to patient
3. **Hospital Capacity**: Check available beds before accepting
4. **Notifications**: Push notifications for urgent emergencies
5. **History**: View past accepted emergencies
6. **Analytics**: Track response times and acceptance rates
7. **Multi-language**: Support for multiple languages
8. **Dark Mode**: Theme support for night shifts
9. **Audio Alert**: Sound notification for new emergencies
10. **Priority Levels**: Color-code by emergency severity

---

## Configuration

### Change Hospital ID

Update in `HospitalActivity.kt`:

```kotlin
private val hospitalId = "hospital_001"  // Change this
```

### Customize Colors

Edit colors in `activity_hospital.xml`:

```xml
app:cardBackgroundColor="#1976D2"  <!-- Header color -->
android:textColor="#D32F2F"         <!-- Emergency text -->
```

### Adjust Timeouts

Add timeout for stale broadcasts (optional):

```kotlin
val fiveMinutesAgo = Date(System.currentTimeMillis() - 300000)
.whereGreaterThan("timestamp", fiveMinutesAgo)
```

---

## Troubleshooting

### Issue: No broadcasts appearing

**Solution**:

- Check hospital ID matches Firestore data
- Verify broadcast status is "pending"
- Confirm Firestore rules allow read access

### Issue: Transaction always fails

**Solution**:

- Check network connection
- Verify incident exists in Firestore
- Ensure proper field names in transaction

### Issue: UI not updating

**Solution**:

- Verify snapshot listener is active
- Check listener isn't being removed prematurely
- Confirm runOnUiThread() is used for UI updates

### Issue: Multiple hospitals accepting same incident

**Solution**:

- Verify transaction logic is correct
- Check that assignedHospId is being set atomically
- Ensure no parallel writes outside transaction

---

## Code Quality

### Documentation

- All methods have KDoc comments
- Complex logic explained inline
- Clear variable naming

### Best Practices

- Single Responsibility Principle
- Proper error handling
- Resource cleanup
- Null safety

### Testing

- Unit test transaction logic
- UI tests for button interactions
- Integration tests with Firestore emulator

---

## Contact & Support

For issues or questions about the Hospital UI implementation:

- Review this documentation
- Check Firestore console for data
- Enable Firebase debug logging
- Test with Firestore emulator first

---

## Version History

**Version 1.0** (December 2025)

- Initial implementation
- Real-time broadcast listening
- Transaction-based acceptance
- Material Design UI
- Complete error handling

---

## License

Part of the Smart Ambulance Dispatch System
© 2025 - All Rights Reserved
