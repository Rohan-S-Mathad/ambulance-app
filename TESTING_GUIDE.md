# Testing Guide

## Smart Ambulance Dispatch System

---

## 📋 Contents

1. [Setup Sample Data](#setup-sample-data)
2. [Postman Collection](#postman-collection)
3. [Test Scenarios](#test-scenarios)
4. [Expected Results](#expected-results)

---

## 🗂️ Setup Sample Data

### Step 1: Add Sample Ambulances

Navigate to Firestore Console and add these documents to the `ambulances` collection:

#### Ambulance 1

**Document ID:** `amb_001`

```json
{
  "ambId": "amb_001",
  "name": "City Ambulance 001",
  "phone": "+91-9876543210",
  "lat": 12.9716,
  "lon": 77.5946,
  "status": "available",
  "currentIncidentId": null,
  "lastLocationUpdate": null,
  "updatedAt": null
}
```

#### Ambulance 2

**Document ID:** `amb_002`

```json
{
  "ambId": "amb_002",
  "name": "Metro Ambulance 002",
  "phone": "+91-9876543211",
  "lat": 12.9800,
  "lon": 77.6000,
  "status": "available",
  "currentIncidentId": null,
  "lastLocationUpdate": null,
  "updatedAt": null
}
```

#### Ambulance 3

**Document ID:** `amb_003`

```json
{
  "ambId": "amb_003",
  "name": "Express Ambulance 003",
  "phone": "+91-9876543212",
  "lat": 12.9650,
  "lon": 77.5900,
  "status": "available",
  "currentIncidentId": null,
  "lastLocationUpdate": null,
  "updatedAt": null
}
```

---

### Step 2: Add Sample Hospitals

Add these documents to the `hospitals` collection:

#### Hospital 1

**Document ID:** `hosp_001`

```json
{
  "hospId": "hosp_001",
  "name": "City General Hospital",
  "phone": "+91-80-12345678",
  "lat": 12.9750,
  "lon": 77.6050,
  "status": "available",
  "currentIncidentId": null,
  "beds": 50,
  "updatedAt": null
}
```

#### Hospital 2

**Document ID:** `hosp_002`

```json
{
  "hospId": "hosp_002",
  "name": "Metro Medical Center",
  "phone": "+91-80-12345679",
  "lat": 12.9900,
  "lon": 77.6200,
  "status": "available",
  "currentIncidentId": null,
  "beds": 100,
  "updatedAt": null
}
```

#### Hospital 3

**Document ID:** `hosp_003`

```json
{
  "hospId": "hosp_003",
  "name": "Emergency Care Hospital",
  "phone": "+91-80-12345680",
  "lat": 12.9600,
  "lon": 77.5800,
  "status": "available",
  "currentIncidentId": null,
  "beds": 75,
  "updatedAt": null
}
```

---

## 📮 Postman Collection

### Import this Postman Collection

```json
{
  "info": {
    "name": "Ambulance Dispatch API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/api",
      "type": "string"
    },
    {
      "key": "incidentId",
      "value": "",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/health",
          "host": ["{{baseUrl}}"],
          "path": ["health"]
        }
      }
    },
    {
      "name": "Create Incident",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "if (pm.response.code === 201) {",
              "    const response = pm.response.json();",
              "    pm.collectionVariables.set('incidentId', response.incidentId);",
              "    console.log('Incident ID:', response.incidentId);",
              "}"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"userLat\": 12.9716,\n  \"userLon\": 77.5946,\n  \"userId\": \"user_test_001\",\n  \"description\": \"Emergency on MG Road - Traffic accident\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/incident",
          "host": ["{{baseUrl}}"],
          "path": ["incident"]
        }
      }
    },
    {
      "name": "Get Incident",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/incident/{{incidentId}}",
          "host": ["{{baseUrl}}"],
          "path": ["incident", "{{incidentId}}"]
        }
      }
    },
    {
      "name": "Ambulance Accept Incident",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"ambulanceId\": \"amb_001\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/incident/{{incidentId}}/acceptAmbulance",
          "host": ["{{baseUrl}}"],
          "path": ["incident", "{{incidentId}}", "acceptAmbulance"]
        }
      }
    },
    {
      "name": "Hospital Accept Incident",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"hospitalId\": \"hosp_001\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/incident/{{incidentId}}/acceptHospital",
          "host": ["{{baseUrl}}"],
          "path": ["incident", "{{incidentId}}", "acceptHospital"]
        }
      }
    },
    {
      "name": "Update Ambulance Location",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"lat\": 12.9750,\n  \"lon\": 77.6000\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/ambulance/amb_001/location",
          "host": ["{{baseUrl}}"],
          "path": ["ambulance", "amb_001", "location"]
        }
      }
    },
    {
      "name": "Get Ambulance Location",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/ambulance/amb_001/location",
          "host": ["{{baseUrl}}"],
          "path": ["ambulance", "amb_001", "location"]
        }
      }
    },
    {
      "name": "Get Broadcasts for Ambulance",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/broadcasts/ambulance/amb_001",
          "host": ["{{baseUrl}}"],
          "path": ["broadcasts", "ambulance", "amb_001"]
        }
      }
    },
    {
      "name": "Complete Incident",
      "request": {
        "method": "POST",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/incident/{{incidentId}}/complete",
          "host": ["{{baseUrl}}"],
          "path": ["incident", "{{incidentId}}", "complete"]
        }
      }
    }
  ]
}
```

### How to Import:

1. Open Postman
2. Click "Import" button
3. Paste the JSON above
4. Update the `baseUrl` variable with your Firebase Functions URL

---

## 🧪 Test Scenarios

### Scenario 1: Complete Happy Path

**Objective:** Test the full lifecycle from incident creation to completion.

#### Step 1: Create Incident

```bash
POST {{baseUrl}}/incident
{
  "userLat": 12.9716,
  "userLon": 77.5946,
  "userId": "user_001",
  "description": "Car accident on MG Road"
}
```

**Expected:**

- Status 201
- Returns `incidentId`
- 3 broadcasts created for nearest ambulances

#### Step 2: Check Broadcasts (Ambulance App)

```bash
GET {{baseUrl}}/broadcasts/ambulance/amb_001
```

**Expected:**

- Returns pending broadcast with incident details
- Includes distance in km

#### Step 3: Ambulance Accepts

```bash
POST {{baseUrl}}/incident/{incidentId}/acceptAmbulance
{
  "ambulanceId": "amb_001"
}
```

**Expected:**

- Status 200
- `success: true`
- Incident status changes to `ambulance_assigned`
- Other ambulance broadcasts cancelled
- Hospital broadcasts created automatically

#### Step 4: Check Hospital Broadcasts

```bash
GET {{baseUrl}}/broadcasts/hospital/hosp_001
```

**Expected:**

- Returns pending broadcast for the incident

#### Step 5: Hospital Accepts

```bash
POST {{baseUrl}}/incident/{incidentId}/acceptHospital
{
  "hospitalId": "hosp_001"
}
```

**Expected:**

- Status 200
- `success: true`
- Incident status changes to `hospital_assigned`
- Other hospital broadcasts cancelled

#### Step 6: Complete Incident

```bash
POST {{baseUrl}}/incident/{incidentId}/complete
```

**Expected:**

- Status 200
- Ambulance status returns to `available`
- Hospital status returns to `available`

---

### Scenario 2: Race Condition Test (First-Accept)

**Objective:** Verify that only one ambulance can accept an incident.

#### Setup:

- Create an incident
- Note the `incidentId`

#### Test:

Run these requests **simultaneously** (use Postman Runner with 0ms delay):

```bash
# Request 1
POST {{baseUrl}}/incident/{incidentId}/acceptAmbulance
{ "ambulanceId": "amb_001" }

# Request 2
POST {{baseUrl}}/incident/{incidentId}/acceptAmbulance
{ "ambulanceId": "amb_002" }

# Request 3
POST {{baseUrl}}/incident/{incidentId}/acceptAmbulance
{ "ambulanceId": "amb_003" }
```

**Expected Results:**

- **One request succeeds** with `{ "success": true }`
- **Two requests fail** with:

```json
{
  "success": false,
  "reason": "already_assigned",
  "assignedTo": "amb_001"
}
```

---

### Scenario 3: Invalid Acceptance Test

**Objective:** Verify that hospitals cannot accept before ambulance assignment.

#### Step 1: Create Incident

```bash
POST {{baseUrl}}/incident
{
  "userLat": 12.9716,
  "userLon": 77.5946
}
```

#### Step 2: Try Hospital Accept (Before Ambulance)

```bash
POST {{baseUrl}}/incident/{incidentId}/acceptHospital
{
  "hospitalId": "hosp_001"
}
```

**Expected:**

```json
{
  "success": false,
  "reason": "ambulance_not_assigned",
  "currentStatus": "pending"
}
```

---

### Scenario 4: Location Tracking Test

**Objective:** Test real-time location updates.

#### Step 1: Update Location Multiple Times

```bash
POST {{baseUrl}}/ambulance/amb_001/location
{ "lat": 12.9716, "lon": 77.5946 }

# Wait 5 seconds

POST {{baseUrl}}/ambulance/amb_001/location
{ "lat": 12.9720, "lon": 77.5950 }

# Wait 5 seconds

POST {{baseUrl}}/ambulance/amb_001/location
{ "lat": 12.9725, "lon": 77.5955 }
```

#### Step 2: Verify Location

```bash
GET {{baseUrl}}/ambulance/amb_001/location
```

**Expected:**

- Returns latest location
- `lastUpdate` timestamp updated

---

### Scenario 5: Distance Calculation Test

**Objective:** Verify Haversine distance calculation.

#### Test Data:

- User Location: `12.9716, 77.5946` (Bangalore MG Road)
- Ambulance 1: `12.9716, 77.5946` (Same location) → **Distance: 0 km**
- Ambulance 2: `12.9800, 77.6000` (≈0.9 km away)
- Ambulance 3: `13.0500, 77.7000` (≈15 km away)

#### Create Incident:

```bash
POST {{baseUrl}}/incident
{
  "userLat": 12.9716,
  "userLon": 77.5946
}
```

#### Check Broadcast Distances:

```bash
GET {{baseUrl}}/broadcasts/ambulance/amb_001
GET {{baseUrl}}/broadcasts/ambulance/amb_002
GET {{baseUrl}}/broadcasts/ambulance/amb_003
```

**Expected:**

- Broadcasts sorted by distance
- Distance field accurately reflects calculated distance

---

## ✅ Expected Results Summary

### API Response Codes

| Endpoint | Success Code | Error Codes |
|----------|-------------|-------------|
| POST /incident | 201 | 400 (validation), 500 |
| GET /incident/{id} | 200 | 404, 500 |
| POST /acceptAmbulance | 200 | 409 (already assigned), 500 |
| POST /acceptHospital | 200 | 409 (already assigned), 500 |
| POST /location | 200 | 400 (validation), 500 |
| GET /location | 200 | 404, 500 |
| GET /broadcasts | 200 | 400, 500 |

---

### Database State Verification

After each test, verify Firestore:

#### After Incident Creation:

- `incidents` collection has new document with `status: "pending"`
- `broadcasts` collection has 3 documents (top 3 nearest ambulances)
- All broadcasts have `status: "pending"`

#### After Ambulance Acceptance:

- `incidents/{id}` has `assignedAmbId` set
- `incidents/{id}` has `status: "ambulance_assigned"`
- `ambulances/{id}` has `status: "busy"`
- Previous ambulance broadcasts have `status: "cancelled"`
- New hospital broadcasts created with `status: "pending"`

#### After Hospital Acceptance:

- `incidents/{id}` has `assignedHospId` set
- `incidents/{id}` has `status: "hospital_assigned"`
- `hospitals/{id}` has `status: "busy"`
- Previous hospital broadcasts have `status: "cancelled"`

#### After Completion:

- `incidents/{id}` has `status: "completed"`
- `ambulances/{id}` has `status: "available"`
- `hospitals/{id}` has `status: "available"`

---

## 🔍 Debugging Tips

### Check Logs:

```bash
firebase functions:log --only api
firebase functions:log --only onIncidentAmbulanceAssigned
```

### Enable Debug Logging:

In `functions/utils/logger.js`, logs are already structured with JSON format.

### Common Issues:

1. **"No available ambulances"**
    - Verify ambulances exist in Firestore
    - Check ambulance `status` is `"available"`

2. **"Transaction failed"**
    - Check Firestore rules
    - Verify document IDs are correct

3. **"Broadcasts not created"**
    - Check Firestore indexes are deployed
    - Verify composite indexes exist

---

## 📊 Performance Benchmarks

Expected response times (on Firebase Functions):

| Operation | Expected Time |
|-----------|--------------|
| Create Incident | 500-800ms |
| Accept (Transaction) | 200-400ms |
| Update Location | 100-200ms |
| Get Broadcasts | 150-300ms |

---

## 🎯 Next Steps

After testing:

1. Integrate with Android app
2. Add Firebase Authentication
3. Implement push notifications
4. Add analytics tracking
5. Set up monitoring and alerts

---

## 📝 Test Checklist

- [ ] Health check returns 200
- [ ] Create incident returns 201 with incidentId
- [ ] Broadcasts created for top 3 ambulances
- [ ] First ambulance can accept successfully
- [ ] Second ambulance gets "already_assigned" error
- [ ] Hospital broadcasts triggered automatically
- [ ] First hospital can accept successfully
- [ ] Incident can be completed
- [ ] Ambulance/hospital status returns to available
- [ ] Location updates work correctly
- [ ] Distance calculations are accurate
- [ ] All logs appear in Firebase Console
