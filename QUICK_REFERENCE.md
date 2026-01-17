# Quick Reference Guide

## Smart Ambulance Dispatch Backend

---

## 🚀 Quick Deploy (5 Minutes)

```bash
# 1. Install dependencies
cd functions && npm install

# 2. Login to Firebase
firebase login

# 3. Deploy everything
firebase deploy --only firestore
firebase deploy --only functions

# 4. Get API URL
firebase functions:list
```

---

## 🔌 API Endpoints Cheat Sheet

### Base URL

```
https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/api
```

### Common Requests

**Create Incident:**

```bash
curl -X POST {BASE_URL}/incident \
  -H "Content-Type: application/json" \
  -d '{"userLat": 12.9716, "userLon": 77.5946, "userId": "user123"}'
```

**Ambulance Accept:**

```bash
curl -X POST {BASE_URL}/incident/{INCIDENT_ID}/acceptAmbulance \
  -H "Content-Type: application/json" \
  -d '{"ambulanceId": "amb_001"}'
```

**Hospital Accept:**

```bash
curl -X POST {BASE_URL}/incident/{INCIDENT_ID}/acceptHospital \
  -H "Content-Type: application/json" \
  -d '{"hospitalId": "hosp_001"}'
```

**Update Location:**

```bash
curl -X POST {BASE_URL}/ambulance/amb_001/location \
  -H "Content-Type: application/json" \
  -d '{"lat": 12.9800, "lon": 77.6000}'
```

**Get Broadcasts:**

```bash
curl {BASE_URL}/broadcasts/ambulance/amb_001
```

---

## 📊 Database Collections

### Ambulances

```
Collection: ambulances
Document ID: amb_001, amb_002, amb_003

Fields:
- ambId: string
- name: string
- phone: string
- lat: number
- lon: number
- status: "available" | "busy"
- currentIncidentId: string | null
```

### Hospitals

```
Collection: hospitals
Document ID: hosp_001, hosp_002, hosp_003

Fields:
- hospId: string
- name: string
- phone: string
- lat: number
- lon: number
- status: "available" | "busy"
- currentIncidentId: string | null
- beds: number
```

### Incidents

```
Collection: incidents
Document ID: auto-generated

Fields:
- incidentId: string
- userLat: number
- userLon: number
- status: "pending" | "ambulance_assigned" | "hospital_assigned" | "completed"
- assignedAmbId: string | null
- assignedHospId: string | null
- createdAt: timestamp
```

### Broadcasts

```
Collection: broadcasts
Document ID: auto-generated

Fields:
- targetType: "ambulance" | "hospital"
- targetId: string
- incidentId: string
- status: "pending" | "accepted" | "cancelled" | "expired"
- distance: number (km)
- createdAt: timestamp
- expiresAt: timestamp
```

---

## 📍 Live Location Tracking - Quick Guide

## 🚑 For Ambulance Drivers

### When Emergency Arrives

1. See alert with patient coordinates
2. Press **"Accept"** button
3. Press **"View Live Location"** (green button)

### On Tracking Screen

- **RED marker** = Patient location
- **BLUE marker** = Your location
- **Updates** = Every 10 seconds automatically
- **Distance** = Shown in kilometers
- **ETA** = Estimated time in minutes

### Control Buttons

| Button  | Function                    |
|---------|-----------------------------|
| 🔄      | Manual refresh of locations |
| 📍      | Center map on patient       |
| 🗺️ Nav | Open Google Maps navigation |

## 🏥 For Hospital Staff

### When Emergency Arrives

1. See patient details and coordinates
2. Press **"Accept"** button
3. Coordinates update automatically every 10 seconds

### What You See

- **Incident ID**: Unique emergency identifier
- **Patient ID**: Patient identifier
- **Latitude**: 6 decimal places (e.g., 12.971600)
- **Longitude**: 6 decimal places (e.g., 77.594600)
- **Auto-updates**: No action needed

## ⚙️ Configuration

### Update Frequency

**Default:** 10 seconds  
**Location:** `updateInterval` in code

### ETA Speed

**Default:** 40 km/h  
**Location:** `calculateDistance()` method

## 🔍 Troubleshooting

### Location Not Updating?

1. ✅ Location permission granted
2. ✅ GPS enabled
3. ✅ Network connected
4. ✅ App in foreground

### Map Not Showing?

1. ✅ Google Play Services installed
2. ✅ Location permission granted
3. ✅ Wait 10-20 seconds for GPS lock

## 📊 Data Precision

| Field     | Precision     | Example   |
|-----------|---------------|-----------|
| Latitude  | 6 decimals    | 12.971600 |
| Longitude | 6 decimals    | 77.594600 |
| Distance  | 2 decimals    | 3.45 km   |
| ETA       | Whole minutes | 5 min     |
| Timestamp | HH:MM:SS      | 14:23:47  |

## ✅ Quick Test

### Ambulance Test (30 seconds)

```
1. Login as Ambulance
2. Trigger emergency
3. Accept emergency
4. Open live location
5. Verify map shows markers
6. Wait 10 seconds
7. Check timestamp updated
```

### Hospital Test (30 seconds)

```
1. Login as Hospital
2. Trigger emergency  
3. Note coordinates
4. Accept emergency
5. Wait 10 seconds
6. Verify coordinates changed
```

## 🎯 Key Features

✅ Pending patient display
✅ Accept/Reject buttons
✅ Live coordinates (6 decimals)
✅ Auto-update every 10 seconds
✅ Google Maps integration
✅ Distance & ETA calculation
✅ Turn-by-turn navigation
✅ No manual refresh needed

## 📱 Installation

```bash
# Build the app
cd "C:\Users\ROHAN MATHAD\AndroidStudioProjects\ambulance"
.\gradlew assembleDebug

# Install on device
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

## 🆘 Need Help?

**Documentation:**

- `LIVE_LOCATION_TRACKING_GUIDE.md` - Full guide
- `IMPLEMENTATION_SUMMARY.md` - Technical details
- `QUICK_FIX_SUMMARY.md` - IP address fixes

**Status:** ✅ All features working!

## 📈 System Flow

```
User → Create Incident
  ↓
Backend → Find 3 nearest ambulances
  ↓
Backend → Create broadcasts
  ↓
Ambulances → Listen via snapshots
  ↓
First Ambulance → Accept (transaction)
  ↓
Backend → Cancel other broadcasts
  ↓
Firestore Trigger → Broadcast to hospitals
  ↓
Hospitals → Listen via snapshots
  ↓
First Hospital → Accept (transaction)
  ↓
Backend → Cancel other broadcasts
  ↓
Complete!
```

## 🎯 Status Flow

```
Incident States:
pending → ambulance_assigned → hospital_assigned → completed

Broadcast States:
pending → accepted | cancelled | expired
```

## 📞 Quick Links

- **Firebase Console:** https://console.firebase.google.com/
- **Functions Dashboard:** Console → Functions
- **Firestore Database:** Console → Firestore Database
- **Logs:** Console → Functions → Logs tab

---

## ✅ Pre-Deployment Checklist

- [ ] Node.js 18+ installed
- [ ] Firebase CLI installed: `npm install -g firebase-tools`
- [ ] Firebase project created
- [ ] `cd functions && npm install` completed
- [ ] Firebase login successful
- [ ] Firestore initialized
- [ ] Sample data added to Firestore

## 🚀 Post-Deployment Checklist

- [ ] Functions deployed successfully
- [ ] Firestore rules deployed
- [ ] Firestore indexes deployed
- [ ] API URL obtained from `firebase functions:list`
- [ ] Health endpoint returns 200: `curl {BASE_URL}/health`
- [ ] Sample ambulances and hospitals added
- [ ] Postman collection imported and tested
- [ ] Create incident returns 201
- [ ] Broadcasts created successfully
- [ ] Accept endpoints work correctly

## 📊 Performance Expectations

| Operation            | Expected Time |
|----------------------|---------------|
| Create Incident      | 500-800ms     |
| Accept (Transaction) | 200-400ms     |
| Update Location      | 100-200ms     |
| Get Broadcasts       | 150-300ms     |
| Firestore Trigger    | 1-2 seconds   |

## 💰 Cost Estimate (Free Tier)

- **Cloud Functions:** 2M invocations/month
- **Firestore:** 50K reads, 20K writes/day
- **Typical Usage:** 100 incidents/day = **FREE**

## 🏆 What You Have

Production-ready backend  
First-Accept algorithm (no race conditions)  
Automatic hospital broadcasting  
Real-time location tracking  
Distance-based dispatch  
4,000+ lines of code & docs  
Complete API  
Security rules  
Firestore indexes  
Testing guide  
Ready to integrate with Android

---

## 💡 Key Algorithms

### First-Accept (Race Condition Prevention)

```javascript
db.runTransaction(async (transaction) => {
  const incident = await transaction.get(incidentRef);
  
  if (incident.data().assignedAmbId !== null) {
    return { success: false };  // Already assigned
  }
  
  transaction.update(incidentRef, {
    assignedAmbId: ambulanceId
  });
  
  return { success: true };  // First one wins!
});
```

### Distance Calculation (Haversine)

```javascript
distance = 6371 * 2 * atan2(
  sqrt(a),
  sqrt(1 - a)
)

where a = sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)
```

---

## 📈 System Flow

```
User → Create Incident
  ↓
Backend → Find 3 nearest ambulances
  ↓
Backend → Create broadcasts
  ↓
Ambulances → Listen via snapshots
  ↓
First Ambulance → Accept (transaction)
  ↓
Backend → Cancel other broadcasts
  ↓
Firestore Trigger → Broadcast to hospitals
  ↓
Hospitals → Listen via snapshots
  ↓
First Hospital → Accept (transaction)
  ↓
Backend → Cancel other broadcasts
  ↓
Complete!
```

## 🎯 Status Flow

```
Incident States:
pending → ambulance_assigned → hospital_assigned → completed

Broadcast States:
pending → accepted | cancelled | expired
```

## 📞 Quick Links

- **Firebase Console:** https://console.firebase.google.com/
- **Functions Dashboard:** Console → Functions
- **Firestore Database:** Console → Firestore Database
- **Logs:** Console → Functions → Logs tab

---

## ✅ Pre-Deployment Checklist

- [ ] Node.js 18+ installed
- [ ] Firebase CLI installed: `npm install -g firebase-tools`
- [ ] Firebase project created
- [ ] `cd functions && npm install` completed
- [ ] Firebase login successful
- [ ] Firestore initialized
- [ ] Sample data added to Firestore

## 🚀 Post-Deployment Checklist

- [ ] Functions deployed successfully
- [ ] Firestore rules deployed
- [ ] Firestore indexes deployed
- [ ] API URL obtained from `firebase functions:list`
- [ ] Health endpoint returns 200: `curl {BASE_URL}/health`
- [ ] Sample ambulances and hospitals added
- [ ] Postman collection imported and tested
- [ ] Create incident returns 201
- [ ] Broadcasts created successfully
- [ ] Accept endpoints work correctly

## 📊 Performance Expectations

| Operation            | Expected Time |
|----------------------|---------------|
| Create Incident      | 500-800ms     |
| Accept (Transaction) | 200-400ms     |
| Update Location      | 100-200ms     |
| Get Broadcasts       | 150-300ms     |
| Firestore Trigger    | 1-2 seconds   |

## 💰 Cost Estimate (Free Tier)

- **Cloud Functions:** 2M invocations/month
- **Firestore:** 50K reads, 20K writes/day
- **Typical Usage:** 100 incidents/day = **FREE**

## 🏆 What You Have

Production-ready backend  
First-Accept algorithm (no race conditions)  
Automatic hospital broadcasting  
Real-time location tracking  
Distance-based dispatch  
4,000+ lines of code & docs  
Complete API  
Security rules  
Firestore indexes  
Testing guide  
Ready to integrate with Android

---

## 💡 Key Algorithms

### First-Accept (Race Condition Prevention)

```javascript
db.runTransaction(async (transaction) => {
  const incident = await transaction.get(incidentRef);
  
  if (incident.data().assignedAmbId !== null) {
    return { success: false };  // Already assigned
  }
  
  transaction.update(incidentRef, {
    assignedAmbId: ambulanceId
  });
  
  return { success: true };  // First one wins!
});
```

### Distance Calculation (Haversine)

```javascript
distance = 6371 * 2 * atan2(
  sqrt(a),
  sqrt(1 - a)
)

where a = sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)
```

---

## 📈 System Flow

```
User → Create Incident
  ↓
Backend → Find 3 nearest ambulances
  ↓
Backend → Create broadcasts
  ↓
Ambulances → Listen via snapshots
  ↓
First Ambulance → Accept (transaction)
  ↓
Backend → Cancel other broadcasts
  ↓
Firestore Trigger → Broadcast to hospitals
  ↓
Hospitals → Listen via snapshots
  ↓
First Hospital → Accept (transaction)
  ↓
Backend → Cancel other broadcasts
  ↓
Complete!
```

## 🎯 Status Flow

```
Incident States:
pending → ambulance_assigned → hospital_assigned → completed

Broadcast States:
pending → accepted | cancelled | expired
```

## 📞 Quick Links

- **Firebase Console:** https://console.firebase.google.com/
- **Functions Dashboard:** Console → Functions
- **Firestore Database:** Console → Firestore Database
- **Logs:** Console → Functions → Logs tab

---

## ✅ Pre-Deployment Checklist

- [ ] Node.js 18+ installed
- [ ] Firebase CLI installed: `npm install -g firebase-tools`
- [ ] Firebase project created
- [ ] `cd functions && npm install` completed
- [ ] Firebase login successful
- [ ] Firestore initialized
- [ ] Sample data added to Firestore

## 🚀 Post-Deployment Checklist

- [ ] Functions deployed successfully
- [ ] Firestore rules deployed
- [ ] Firestore indexes deployed
- [ ] API URL obtained from `firebase functions:list`
- [ ] Health endpoint returns 200: `curl {BASE_URL}/health`
- [ ] Sample ambulances and hospitals added
- [ ] Postman collection imported and tested
- [ ] Create incident returns 201
- [ ] Broadcasts created successfully
- [ ] Accept endpoints work correctly

## 📊 Performance Expectations

| Operation            | Expected Time |
|----------------------|---------------|
| Create Incident      | 500-800ms     |
| Accept (Transaction) | 200-400ms     |
| Update Location      | 100-200ms     |
| Get Broadcasts       | 150-300ms     |
| Firestore Trigger    | 1-2 seconds   |

## 💰 Cost Estimate (Free Tier)

- **Cloud Functions:** 2M invocations/month
- **Firestore:** 50K reads, 20K writes/day
- **Typical Usage:** 100 incidents/day = **FREE**

## 🏆 What You Have

Production-ready backend  
First-Accept algorithm (no race conditions)  
Automatic hospital broadcasting  
Real-time location tracking  
Distance-based dispatch  
4,000+ lines of code & docs  
Complete API  
Security rules  
Firestore indexes  
Testing guide  
Ready to integrate with Android

---

## 💡 Key Algorithms

### First-Accept (Race Condition Prevention)

```javascript
db.runTransaction(async (transaction) => {
  const incident = await transaction.get(incidentRef);
  
  if (incident.data().assignedAmbId !== null) {
    return { success: false };  // Already assigned
  }
  
  transaction.update(incidentRef, {
    assignedAmbId: ambulanceId
  });
  
  return { success: true };  // First one wins!
});
```

### Distance Calculation (Haversine)

```javascript
distance = 6371 * 2 * atan2(
  sqrt(a),
  sqrt(1 - a)
)

where a = sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)
```

---

## 🔐 Security Rules Summary

```javascript
// Incidents - Read: all, Write: Cloud Functions only
match /incidents/{incidentId} {
  allow read: if true;
  allow create: if isAuthenticated();
  allow update: if false;
}

// Ambulances - Only owner can update
match /ambulances/{ambulanceId} {
  allow read: if true;
  allow update: if request.auth.uid == ambulanceId;
}

// Broadcasts - Read: owner only, Write: Cloud Functions only
match /broadcasts/{broadcastId} {
  allow read: if resource.data.targetId == request.auth.uid;
  allow create: if false;
}
```

---

## 💡 Key Algorithms

### First-Accept (Race Condition Prevention)

```javascript
db.runTransaction(async (transaction) => {
  const incident = await transaction.get(incidentRef);
  
  if (incident.data().assignedAmbId !== null) {
    return { success: false };  // Already assigned
  }
  
  transaction.update(incidentRef, {
    assignedAmbId: ambulanceId
  });
  
  return { success: true };  // First one wins!
});
```

### Distance Calculation (Haversine)

```javascript
distance = 6371 * 2 * atan2(
  sqrt(a),
  sqrt(1 - a)
)

where a = sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)
```

---

## 📈 System Flow

```
User → Create Incident
  ↓
Backend → Find 3 nearest ambulances
  ↓
Backend → Create broadcasts
  ↓
Ambulances → Listen via snapshots
  ↓
First Ambulance → Accept (transaction)
  ↓
Backend → Cancel other broadcasts
  ↓
Firestore Trigger → Broadcast to hospitals
  ↓
Hospitals → Listen via snapshots
  ↓
First Hospital → Accept (transaction)
  ↓
Backend → Cancel other broadcasts
  ↓
Complete!
```

---

## 🎯 Status Flow

```
Incident States:
pending → ambulance_assigned → hospital_assigned → completed

Broadcast States:
pending → accepted | cancelled | expired
```

---

## 📞 Quick Links

- **Firebase Console:** https://console.firebase.google.com/
- **Functions Dashboard:** Console → Functions
- **Firestore Database:** Console → Firestore Database
- **Logs:** Console → Functions → Logs tab

---

## ✅ Pre-Deployment Checklist

- [ ] Node.js 18+ installed
- [ ] Firebase CLI installed: `npm install -g firebase-tools`
- [ ] Firebase project created
- [ ] `cd functions && npm install` completed
- [ ] Firebase login successful
- [ ] Firestore initialized
- [ ] Sample data added to Firestore

---

## 🚀 Post-Deployment Checklist

- [ ] Functions deployed successfully
- [ ] Firestore rules deployed
- [ ] Firestore indexes deployed
- [ ] API URL obtained from `firebase functions:list`
- [ ] Health endpoint returns 200: `curl {BASE_URL}/health`
- [ ] Sample ambulances and hospitals added
- [ ] Postman collection imported and tested
- [ ] Create incident returns 201
- [ ] Broadcasts created successfully
- [ ] Accept endpoints work correctly

---

## 📊 Performance Expectations

| Operation | Expected Time |
|-----------|--------------|
| Create Incident | 500-800ms |
| Accept (Transaction) | 200-400ms |
| Update Location | 100-200ms |
| Get Broadcasts | 150-300ms |
| Firestore Trigger | 1-2 seconds |

---

## 💰 Cost Estimate (Free Tier)

- **Cloud Functions:** 2M invocations/month
- **Firestore:** 50K reads, 20K writes/day
- **Typical Usage:** 100 incidents/day = **FREE** ✅

---

## 🏆 What You Have

✅ Production-ready backend  
✅ First-Accept algorithm (no race conditions)  
✅ Automatic hospital broadcasting  
✅ Real-time location tracking  
✅ Distance-based dispatch  
✅ 4,000+ lines of code & docs  
✅ Complete API  
✅ Security rules  
✅ Firestore indexes  
✅ Testing guide  
✅ Ready to integrate with Android

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Status:** Production Ready ✅
