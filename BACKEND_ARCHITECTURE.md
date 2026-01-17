# Smart Ambulance Dispatch & Hospital Pre-Booking System

## Backend Architecture Documentation

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [First-Accept Algorithm](#first-accept-algorithm)
6. [Sequence Flows](#sequence-flows)
7. [Deployment Guide](#deployment-guide)
8. [Testing Guide](#testing-guide)

---

## 🎯 System Overview

The Smart Ambulance Dispatch & Hospital Pre-Booking System is a real-time emergency response
platform that:

- **Automatically dispatches** the nearest available ambulance to an emergency incident
- **Prevents race conditions** using Firestore transactions (First-Accept Algorithm)
- **Broadcasts simultaneously** to multiple ambulances/hospitals
- **Auto-cancels** rejected broadcasts when one entity accepts
- **Tracks real-time locations** of ambulances for live updates
- **Ensures data integrity** through atomic operations

### Technology Stack

- **Backend**: Firebase Cloud Functions (Node.js 18)
- **Database**: Firebase Firestore (NoSQL)
- **Distance Calculation**: Haversine formula
- **Authentication**: Firebase Auth (optional)
- **API Style**: REST + Firebase Callable Functions

---

## 🏗️ Architecture Diagram

```
┌─────────────┐
│   User App  │
│  (Android)  │
└──────┬──────┘
       │ 1. Create Incident
       │ POST /incident
       ▼
┌─────────────────────────────────────────┐
│     Firebase Cloud Functions (API)      │
│  ┌──────────────────────────────────┐  │
│  │   incidentService.createIncident  │  │
│  └──────────┬───────────────────────┘  │
└─────────────┼────────────────────────────┘
              │ 2. Store Incident
              ▼
        ┌──────────┐
        │ Firestore│
        │ incidents│
        └──────────┘
              │ 3. Query available ambulances
              ▼
        ┌──────────────┐
        │   Firestore  │
        │  ambulances  │
        └──────┬───────┘
               │ 4. Calculate distances (Haversine)
               │ 5. Create broadcasts
               ▼
        ┌──────────────┐
        │  Firestore   │
        │  broadcasts  │
        └──────┬───────┘
               │ 6. Real-time snapshot
               ▼
    ┌─────────────���────────┐
    │  Ambulance Apps (3)  │
    │  Listen to broadcasts│
    └──────────┬───────────┘
               │ 7. First ambulance accepts
               │ POST /incident/{id}/acceptAmbulance
               ▼
        ┌─────────────────────────────┐
        │ Firestore Transaction       │
        │ (First-Accept Algorithm)    │
        │ 1. Check assignedAmbId==null│
        │ 2. Assign if null           │
        │ 3. Update status            │
        │ 4. Mark ambulance as busy   │
        └──────────┬──────────────────┘
                   │ 8. Cancel other ambulance broadcasts
                   ▼
            ┌──────────────┐
            │  Firestore   │
            │  broadcasts  │
            │ (cancelled)  │
            └──────────────┘
                   │ 9. Firestore Trigger
                   │ onUpdate: status → 'ambulance_assigned'
                   ▼
        ┌──────────────────────────┐
        │ Broadcast to Hospitals   │
        └──────────┬─────���───────────┘
                   │ 10. Real-time snapshot
                   ▼
        ┌──────────────────────┐
        │  Hospital Apps (3)   │
        │  Listen to broadcasts│
        └──────────┬───────────┘
                   │ 11. First hospital accepts
                   │ POST /incident/{id}/acceptHospital
                   ▼
        ┌─────────────────────────────┐
        │ Firestore Transaction       │
        │ (First-Accept Algorithm)    │
        │ 1. Check assignedHospId==null│
        │ 2. Assign if null           │
        │ 3. Update status            │
        │ 4. Mark hospital as busy    │
        └──────────┬──────────────────┘
                   │ 12. Cancel other hospital broadcasts
                   ▼
            ┌──────────────┐
            │  Firestore   │
            │  broadcasts  │
            │ (cancelled)  │
            └──────────────┘
```

---

## 📊 Database Schema

### Collection: `incidents`

Stores emergency incident details.

```javascript
{
  incidentId: string,          // Auto-generated document ID
  userLat: number,             // User latitude (-90 to 90)
  userLon: number,             // User longitude (-180 to 180)
  userId: string | null,       // User ID (Firebase Auth UID)
  status: string,              // 'pending' | 'ambulance_assigned' | 'hospital_assigned' | 'completed'
  assignedAmbId: string | null,// Ambulance ID (set by transaction)
  assignedHospId: string | null,// Hospital ID (set by transaction)
  description: string | null,  // Additional details
  createdAt: timestamp,        // Server timestamp
  updatedAt: timestamp,        // Server timestamp
  ambulanceAcceptedAt: timestamp | null,
  hospitalAcceptedAt: timestamp | null,
  completedAt: timestamp | null
}
```

**Indexes:**

- `status + createdAt` (descending)
- `userId + createdAt` (descending)

---

### Collection: `ambulances`

Stores ambulance information and real-time location.

```javascript
{
  ambId: string,               // Ambulance ID (matches document ID)
  name: string,                // Ambulance name/number
  phone: string,               // Contact number
  lat: number,                 // Current latitude
  lon: number,                 // Current longitude
  status: string,              // 'available' | 'busy'
  currentIncidentId: string | null, // Currently assigned incident
  lastLocationUpdate: timestamp,    // Last location update time
  updatedAt: timestamp         // Last update time
}
```

**Indexes:**

- `status + lat + lon`

---

### Collection: `hospitals`

Stores hospital information.

```javascript
{
  hospId: string,              // Hospital ID (matches document ID)
  name: string,                // Hospital name
  phone: string,               // Contact number
  lat: number,                 // Latitude (usually static)
  lon: number,                 // Longitude (usually static)
  status: string,              // 'available' | 'busy'
  currentIncidentId: string | null, // Currently assigned incident
  beds: number,                // Available beds (optional)
  updatedAt: timestamp         // Last update time
}
```

**Indexes:**

- `status + lat + lon`

---

### Collection: `broadcasts`

Stores broadcast messages sent to ambulances/hospitals.

```javascript
{
  broadcastId: string,         // Auto-generated document ID
  targetType: string,          // 'ambulance' | 'hospital'
  targetId: string,            // ambId or hospId
  incidentId: string,          // Reference to incident
  status: string,              // 'pending' | 'accepted' | 'cancelled' | 'expired'
  distance: number | null,     // Distance in km (calculated by Haversine)
  createdAt: timestamp,        // Broadcast creation time
  expiresAt: timestamp,        // Expiration time (5 minutes)
  acceptedAt: timestamp | null,// Time when accepted
  cancelledAt: timestamp | null// Time when cancelled
}
```

**Indexes:**

- `targetType + targetId + status + createdAt` (descending)
- `incidentId + targetType + status`
- `status + expiresAt`

---

## 🔌 API Endpoints

### Base URL

```
https://us-central1-<project-id>.cloudfunctions.net/api
```

---

### 1. Health Check

**GET** `/health`

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-12-08T10:00:00.000Z",
  "service": "ambulance-dispatch-api"
}
```

---

### 2. Create Incident

**POST** `/incident`

**Request Body:**

```json
{
  "userLat": 12.9716,
  "userLon": 77.5946,
  "userId": "user123",
  "description": "Car accident on MG Road"
}
```

**Response (201):**

```json
{
  "success": true,
  "incidentId": "inc_abc123",
  "data": {
    "incidentId": "inc_abc123",
    "userLat": 12.9716,
    "userLon": 77.5946,
    "status": "pending",
    "assignedAmbId": null,
    "assignedHospId": null,
    "createdAt": { "_seconds": 1702035600 }
  }
}
```

---

### 3. Get Incident Details

**GET** `/incident/:incidentId`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "inc_abc123",
    "userLat": 12.9716,
    "userLon": 77.5946,
    "status": "ambulance_assigned",
    "assignedAmbId": "amb_001",
    "assignedHospId": null
  }
}
```

---

### 4. Ambulance Accepts Incident

**POST** `/incident/:incidentId/acceptAmbulance`

**Request Body:**

```json
{
  "ambulanceId": "amb_001"
}
```

**Response (200) - Success:**

```json
{
  "success": true,
  "incidentId": "inc_abc123",
  "ambulanceId": "amb_001"
}
```

**Response (409) - Already Assigned:**

```json
{
  "success": false,
  "reason": "already_assigned",
  "assignedTo": "amb_002"
}
```

---

### 5. Hospital Accepts Incident

**POST** `/incident/:incidentId/acceptHospital`

**Request Body:**

```json
{
  "hospitalId": "hosp_001"
}
```

**Response (200) - Success:**

```json
{
  "success": true,
  "incidentId": "inc_abc123",
  "hospitalId": "hosp_001"
}
```

**Response (409) - Already Assigned:**

```json
{
  "success": false,
  "reason": "already_assigned",
  "assignedTo": "hosp_002"
}
```

---

### 6. Complete Incident

**POST** `/incident/:incidentId/complete`

**Response (200):**

```json
{
  "success": true,
  "incidentId": "inc_abc123"
}
```

---

### 7. Update Ambulance Location

**POST** `/ambulance/:ambulanceId/location`

**Request Body:**

```json
{
  "lat": 12.9800,
  "lon": 77.6000
}
```

**Response (200):**

```json
{
  "success": true,
  "ambulanceId": "amb_001"
}
```

---

### 8. Get Ambulance Location

**GET** `/ambulance/:ambulanceId/location`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "ambulanceId": "amb_001",
    "lat": 12.9800,
    "lon": 77.6000,
    "lastUpdate": { "_seconds": 1702035600 }
  }
}
```

---

### 9. Get Broadcasts for Target

**GET** `/broadcasts/:targetType/:targetId`

**Example:** `/broadcasts/ambulance/amb_001`

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "bcast_001",
      "targetType": "ambulance",
      "targetId": "amb_001",
      "incidentId": "inc_abc123",
      "status": "pending",
      "distance": 2.5,
      "createdAt": { "_seconds": 1702035600 }
    }
  ]
}
```

---

## 🔐 First-Accept Algorithm

### Overview

The First-Accept Algorithm ensures that only **one ambulance** and **one hospital** can accept an
incident, even if multiple entities try to accept simultaneously. This prevents double-booking and
race conditions.

### Key Mechanism: Firestore Transactions

#### Why Transactions?

Firestore transactions provide **atomicity** - all operations within a transaction either succeed
together or fail together. If two ambulances try to accept the same incident simultaneously, only
one transaction will succeed.

### Algorithm Steps (Ambulance Acceptance)

```javascript
// Step 1: Start transaction
db.runTransaction(async (transaction) => {
  
  // Step 2: Read current incident state
  const incidentDoc = await transaction.get(incidentRef);
  const incidentData = incidentDoc.data();
  
  // Step 3: Check if already assigned
  if (incidentData.assignedAmbId !== null) {
    // Another ambulance already accepted
    return { success: false, reason: 'already_assigned' };
  }
  
  // Step 4: Check status is valid
  if (incidentData.status !== 'pending') {
    return { success: false, reason: 'invalid_status' };
  }
  
  // Step 5: Assign ambulance (atomic write)
  transaction.update(incidentRef, {
    assignedAmbId: ambulanceId,
    status: 'ambulance_assigned',
    ambulanceAcceptedAt: serverTimestamp()
  });
  
  // Step 6: Update ambulance status to busy
  transaction.update(ambulanceRef, {
    status: 'busy',
    currentIncidentId: incidentId
  });
  
  return { success: true };
});

// Step 7: Cancel other broadcasts (after transaction)
await cancelBroadcasts(db, incidentId, 'ambulance', ambulanceId);
```

### Race Condition Prevention

**Scenario:** Three ambulances (A, B, C) try to accept simultaneously.

```
Time    Ambulance A           Ambulance B           Ambulance C
──────────────────────────────────────────────────────────────
T0      Start transaction     -                     -
T1      Read incident         Start transaction     -
T2      assignedAmbId=null    Read incident         Start transaction
T3      Check passed          assignedAmbId=null    Read incident
T4      Assign A              Check passed          assignedAmbId=null
T5      Commit SUCCESS ✓      Assign B              Check passed
T6      -                     Commit FAILED ✗       Assign C
T7      -                     (already assigned)    Commit FAILED ✗
T8      Cancel B & C          -                     (already assigned)
```

**Result:** Only Ambulance A succeeds. B and C receive `{ success: false }`.

### Transaction Guarantees

1. **Atomicity**: All writes in a transaction succeed or all fail
2. **Consistency**: Database remains in valid state
3. **Isolation**: Concurrent transactions don't interfere
4. **Durability**: Once committed, changes are permanent

### Why Outside-Transaction for Cancellation?

Broadcasting cancellations happens **after** the transaction commits because:

- It's not critical to the acceptance logic
- It avoids transaction size limits
- It allows parallel cancellation updates
- Transaction focuses only on the critical path

---

## 📈 Sequence Flows

### Flow 1: Complete Incident Lifecycle

```
User                 Backend              Firestore           Ambulances        Hospitals
 │                      │                     │                    │                │
 │ 1. Create Incident   │                     │                    │                │
 │─────────────────────>│                     │                    │                │
 │                      │ 2. Store incident   │                    │                │
 │                      │────────────────────>│                    │                │
 │                      │                     │                    │                │
 │                      │ 3. Query ambulances │                    │                │
 │                      │────────────────────>│                    │                │
 │                      │                     │                    │                │
 │                      │ 4. Create broadcasts│                    │                │
 │                      │────────────────────>│                    │                │
 │                      │                     │                    │                │
 │                      │                     │ 5. Snapshot event  │                │
 │                      │                     │───────────────────>│                │
 │                      │                     │                    │                │
 │                      │ 6. Accept           │                    │                │
 │                      │<────────────────────────────────────────│                │
 │                      │                     │                    │                │
 │                      │ 7. Transaction      │                    │                │
 │                      │────────────────────>│                    │                │
 │                      │                     │                    │                │
 │                      │ 8. Update trigger   │                    │                │
 │                      │<────────────────────│                    │                │
 │                      │                     │                    │                │
 │                      │ 9. Broadcast hospitals                   │                │
 │                      │────────────────────>│                    │                │
 │                      │                     │                    │                │
 │                      │                     │ 10. Snapshot event │                │
 │                      │                     │───────────────────────────────────>│
 │                      │                     │                    │                │
 │                      │ 11. Accept          │                    │                │
 │                      │<───────────────────────────────────────────────────────│
 │                      │                     │                    │                │
 │                      │ 12. Transaction     │                    │                │
 │                      │────────────────────>│                    │                │
 │                      │                     │                    │                │
 │ 13. Notify complete  │                     │                    │                │
 │<─────────────────────│                     │                    │                │
```

---

## 🚀 Deployment Guide

### Prerequisites

1. Node.js 18 or higher
2. Firebase CLI installed: `npm install -g firebase-tools`
3. Firebase project created

### Step 1: Initialize Firebase

```bash
cd functions
npm install
```

### Step 2: Login to Firebase

```bash
firebase login
```

### Step 3: Initialize Firebase in Project

```bash
firebase init
```

Select:

- Firestore
- Functions
- Use existing project

### Step 4: Deploy Firestore Rules & Indexes

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### Step 5: Deploy Cloud Functions

```bash
firebase deploy --only functions
```

### Step 6: Get Function URLs

```bash
firebase functions:list
```

Copy the API URL (e.g., `https://us-central1-project.cloudfunctions.net/api`)

---

## 🧪 Testing Guide

See `TESTING_GUIDE.md` for:

- Postman collection
- Sample data
- Test scenarios
- Expected responses

---

## 📝 License

MIT License - See LICENSE file for details
