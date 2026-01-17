# Smart Ambulance Dispatch & Hospital Pre-Booking System

## Backend Implementation Guide

---

## 🎯 Overview

This is a **production-ready backend** for a Smart Ambulance Dispatch system that:

✅ Automatically finds and broadcasts to nearest ambulances  
✅ Implements **First-Accept Algorithm** to prevent race conditions  
✅ Auto-triggers hospital broadcasts after ambulance assignment  
✅ Provides real-time location tracking  
✅ Uses Firestore transactions for atomic operations  
✅ Includes comprehensive logging and error handling

---

## 🏗️ Architecture

```
User App → Firebase Cloud Functions (REST API)
            ↓
         Firestore (Database)
            ↓
      Real-time Snapshots
            ↓
   Ambulance/Hospital Apps
```

**Key Components:**

- **Firebase Cloud Functions** - Backend logic (Node.js 18)
- **Firestore** - NoSQL database with real-time listeners
- **Haversine Distance** - Geographic distance calculation
- **Transactions** - Atomic first-accept algorithm

---

## 📦 What's Included

### Backend Files

```
functions/
├── index.js                    # All Cloud Functions (REST API + Triggers)
├── package.json                # Dependencies
├── services/
│   ├── incidentService.js      # Incident CRUD + dispatch logic
│   └── locationService.js      # Location tracking
├── utils/
│   ├── distance.js             # Haversine formula
│   ├── broadcast.js            # Broadcast management
│   ├── validation.js           # Input validation
│   └── logger.js               # Structured logging
```

### Configuration Files

```
firestore.rules                 # Security rules
firestore.indexes.json          # Database indexes
firebase.json                   # Firebase config
```

### Documentation

```
BACKEND_ARCHITECTURE.md         # Complete architecture guide
TESTING_GUIDE.md               # Testing scenarios + Postman
functions/README.md            # Functions-specific guide
```

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
cd functions
npm install
```

### Step 2: Login to Firebase

```bash
firebase login
```

### Step 3: Initialize Firebase (if not already done)

```bash
firebase init
```

Select:

- ✅ Firestore
- ✅ Functions
- Choose your project

### Step 4: Deploy Everything

```bash
# Deploy Firestore rules and indexes
firebase deploy --only firestore

# Deploy Cloud Functions
firebase deploy --only functions
```

### Step 5: Get Your API URL

```bash
firebase functions:list
```

Copy the `api` function URL. It will look like:

```
https://us-central1-your-project.cloudfunctions.net/api
```

---

## 🗄️ Database Setup

### Add Sample Data

Go to [Firebase Console](https://console.firebase.google.com/) → Firestore Database

#### Add Ambulances Collection

**Collection:** `ambulances`

Add 3 documents:

**Document 1 (ID: `amb_001`):**

```json
{
  "ambId": "amb_001",
  "name": "City Ambulance 001",
  "phone": "+91-9876543210",
  "lat": 12.9716,
  "lon": 77.5946,
  "status": "available",
  "currentIncidentId": null
}
```

**Document 2 (ID: `amb_002`):**

```json
{
  "ambId": "amb_002",
  "name": "Metro Ambulance 002",
  "phone": "+91-9876543211",
  "lat": 12.9800,
  "lon": 77.6000,
  "status": "available",
  "currentIncidentId": null
}
```

**Document 3 (ID: `amb_003`):**

```json
{
  "ambId": "amb_003",
  "name": "Express Ambulance 003",
  "phone": "+91-9876543212",
  "lat": 12.9650,
  "lon": 77.5900,
  "status": "available",
  "currentIncidentId": null
}
```

#### Add Hospitals Collection

**Collection:** `hospitals`

Add 3 documents:

**Document 1 (ID: `hosp_001`):**

```json
{
  "hospId": "hosp_001",
  "name": "City General Hospital",
  "phone": "+91-80-12345678",
  "lat": 12.9750,
  "lon": 77.6050,
  "status": "available",
  "currentIncidentId": null,
  "beds": 50
}
```

**Document 2 (ID: `hosp_002`):**

```json
{
  "hospId": "hosp_002",
  "name": "Metro Medical Center",
  "phone": "+91-80-12345679",
  "lat": 12.9900,
  "lon": 77.6200,
  "status": "available",
  "currentIncidentId": null,
  "beds": 100
}
```

**Document 3 (ID: `hosp_003`):**

```json
{
  "hospId": "hosp_003",
  "name": "Emergency Care Hospital",
  "phone": "+91-80-12345680",
  "lat": 12.9600,
  "lon": 77.5800,
  "status": "available",
  "currentIncidentId": null,
  "beds": 75
}
```

---

## 🧪 Test Your Backend

### Using cURL

```bash
# Test health endpoint
curl https://YOUR-FUNCTION-URL/api/health

# Create an incident
curl -X POST https://YOUR-FUNCTION-URL/api/incident \
  -H "Content-Type: application/json" \
  -d '{
    "userLat": 12.9716,
    "userLon": 77.5946,
    "userId": "test_user",
    "description": "Test emergency"
  }'
```

### Using Postman

Import the Postman collection from `TESTING_GUIDE.md`:

1. Open Postman
2. Click Import
3. Copy the JSON from TESTING_GUIDE.md
4. Update `baseUrl` variable with your Function URL

---

## 🔌 API Endpoints

### Base URL

```
https://us-central1-<project-id>.cloudfunctions.net/api
```

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/incident` | Create incident |
| GET | `/incident/:id` | Get incident details |
| POST | `/incident/:id/acceptAmbulance` | Ambulance accepts |
| POST | `/incident/:id/acceptHospital` | Hospital accepts |
| POST | `/ambulance/:id/location` | Update ambulance location |
| GET | `/broadcasts/:type/:id` | Get broadcasts for entity |

See **BACKEND_ARCHITECTURE.md** for complete API documentation.

---

## 🔐 How First-Accept Works

### The Problem

Multiple ambulances receive the same incident broadcast and try to accept simultaneously. Without
proper handling, two ambulances could be assigned to the same incident.

### The Solution: Firestore Transactions

```javascript
db.runTransaction(async (transaction) => {
  // 1. Read current state
  const incident = await transaction.get(incidentRef);
  
  // 2. Check if already assigned
  if (incident.data().assignedAmbId !== null) {
    return { success: false, reason: 'already_assigned' };
  }
  
  // 3. Assign atomically
  transaction.update(incidentRef, {
    assignedAmbId: ambulanceId,
    status: 'ambulance_assigned'
  });
  
  return { success: true };
});
```

### Why It Works

- **Atomicity**: All operations succeed or fail together
- **Isolation**: Concurrent transactions don't interfere
- **Consistency**: Only one ambulance gets assigned

**Example:**

```
Time    Ambulance A    Ambulance B    Ambulance C
───────────────────────────────────────────────────
T0      Accept →       -              -
T1      Transaction    Accept →       -
T2      Read (null)    Transaction    Accept →
T3      Assign A       Read (null)    Transaction
T4      COMMIT ✓       Assign B       Read (A)
T5      -              FAIL ✗         FAIL ✗
```

Only **Ambulance A** succeeds!

---

## 📈 System Flow

### Complete Incident Lifecycle

1. **User creates incident**
   ```
   POST /incident { lat, lon }
   ```

2. **Backend finds nearest ambulances**
    - Query all available ambulances
    - Calculate distances using Haversine
    - Select top 3 nearest

3. **Broadcast to ambulances**
    - Create 3 broadcast documents
    - Status: "pending"

4. **Ambulances listen via Firestore snapshot**
   ```kotlin
   db.collection("broadcasts")
     .whereEqualTo("targetId", ambulanceId)
     .whereEqualTo("status", "pending")
     .addSnapshotListener { ... }
   ```

5. **First ambulance accepts**
   ```
   POST /incident/{id}/acceptAmbulance { ambulanceId }
   ```

6. **Transaction ensures atomic assignment**
    - Check assignedAmbId is null
    - Assign ambulance
    - Update status to "ambulance_assigned"

7. **Firestore trigger fires**
    - onUpdate detects status change
    - Automatically broadcasts to hospitals

8. **First hospital accepts**
   ```
   POST /incident/{id}/acceptHospital { hospitalId }
   ```

9. **Incident complete**
   ```
   POST /incident/{id}/complete
   ```

---

## 🗂️ Database Collections

### incidents

```javascript
{
  incidentId: string,
  userLat: number,
  userLon: number,
  status: "pending" | "ambulance_assigned" | "hospital_assigned" | "completed",
  assignedAmbId: string | null,
  assignedHospId: string | null,
  createdAt: timestamp
}
```

### broadcasts

```javascript
{
  targetType: "ambulance" | "hospital",
  targetId: string,
  incidentId: string,
  status: "pending" | "accepted" | "cancelled" | "expired",
  distance: number,  // km
  createdAt: timestamp,
  expiresAt: timestamp
}
```

### ambulances

```javascript
{
  ambId: string,
  name: string,
  phone: string,
  lat: number,
  lon: number,
  status: "available" | "busy",
  currentIncidentId: string | null
}
```

### hospitals

```javascript
{
  hospId: string,
  name: string,
  phone: string,
  lat: number,
  lon: number,
  status: "available" | "busy",
  currentIncidentId: string | null,
  beds: number
}
```

---

## 🔒 Security

### Firestore Rules

See `firestore.rules` for complete security configuration.

**Key Rules:**

- ✅ Anyone can read incidents (for tracking)
- ❌ Only Cloud Functions can update assignments
- ✅ Ambulances can only update their own data
- ✅ Hospitals can only update their own data
- ❌ Users cannot modify `assignedAmbId` directly

---

## 📊 Monitoring & Logs

### View Logs

```bash
# All function logs
firebase functions:log

# Specific function
firebase functions:log --only api

# Follow logs in real-time
firebase functions:log --only api --follow
```

### Log Format

All logs are structured JSON:

```json
{
  "timestamp": "2024-12-08T10:00:00.000Z",
  "level": "INFO",
  "event": "INCIDENT_CREATED",
  "incidentId": "abc123",
  "userLat": 12.9716,
  "userLon": 77.5946
}
```

---

## 🐛 Troubleshooting

### "No available ambulances"

- Check ambulances exist in Firestore
- Verify `status` is `"available"`
- Check distance is within 50km

### "Transaction failed"

- Verify Firestore indexes are deployed
- Check for document ID mismatches
- Review Firestore security rules

### "Deployment failed"

```bash
# Check Node version
node --version  # Should be 18

# Reinstall dependencies
cd functions
rm -rf node_modules package-lock.json
npm install
```

### "Function timeout"

- Default timeout is 60 seconds
- Optimize queries
- Reduce transaction complexity

---

## 📚 Documentation

### Complete Guides

- **BACKEND_ARCHITECTURE.md** - Detailed architecture, API docs, algorithms
- **TESTING_GUIDE.md** - Test scenarios, Postman collection, sample data
- **functions/README.md** - Cloud Functions specific guide

### Code Documentation

All functions include JSDoc comments:

```javascript
/**
 * Create a new incident and broadcast to nearest ambulances
 * @param {object} db - Firestore database instance
 * @param {number} userLat - User latitude
 * @param {number} userLon - User longitude
 * @returns {Promise<object>} Created incident data
 */
```

---

## 🚀 Next Steps

### For Android Integration

1. **Add Firebase SDK** to your Android app
2. **Listen to broadcasts** using Firestore snapshots
3. **Call API endpoints** to accept incidents
4. **Update location** every 5 seconds

Example Kotlin code:

```kotlin
// Listen for broadcasts
db.collection("broadcasts")
    .whereEqualTo("targetType", "ambulance")
    .whereEqualTo("targetId", ambulanceId)
    .whereEqualTo("status", "pending")
    .addSnapshotListener { snapshot, _ ->
        snapshot?.documents?.forEach { doc ->
            val broadcast = doc.toObject(Broadcast::class.java)
            // Show notification
        }
    }

// Accept incident
api.acceptIncident(incidentId, ambulanceId)
```

### Additional Features

- [ ] Push notifications using FCM
- [ ] Voice call integration
- [ ] Route optimization
- [ ] ETA calculation
- [ ] Payment integration
- [ ] Analytics dashboard

---

## 💡 Key Highlights

✨ **Transaction-based First-Accept** - No race conditions  
✨ **Automatic Hospital Broadcast** - Via Firestore triggers  
✨ **Real-time Updates** - Firestore snapshots  
✨ **Distance Calculation** - Haversine formula  
✨ **Comprehensive Logging** - Structured JSON logs  
✨ **Production Ready** - Error handling, validation, security

---

## 🤝 Support

For questions or issues:

1. Check the documentation files
2. Review Firebase Console logs
3. Test with Postman collection
4. Check Firestore security rules

---

## 📄 License

MIT License - Feel free to use in your projects!

---

**Built with ❤️ using Firebase Cloud Functions**
