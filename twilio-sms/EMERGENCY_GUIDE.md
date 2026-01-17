# 🚨 Emergency Response System - Complete Guide

## Emergency Button → Voice Calls → Live Tracking

---

## 🎯 System Flow

```
1. Patient presses EMERGENCY button
   ↓
2. System creates emergency & calls 2 ambulances + 1 hospital (VOICE CALLS)
   ↓
3. Ambulances receive automated voice message:
   "Emergency alert! Patient needs assistance at [location]. Press 1 to accept."
   ↓
4. First ambulance presses 1 (accepts)
   ↓
5. System shares ambulance's live location with patient
   ↓
6. System calls hospital with voice message:
   "Patient incoming. Ambulance on the way. Press 1 to confirm bed."
   ↓
7. Hospital presses 1 (confirms bed)
   ↓
8. System notifies patient: "Hospital bed confirmed!"
```

---

## 🚀 Quick Setup

### Step 1: Configure Phone Numbers

Edit `.env` file:

```env
# Your Twilio credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Verified ambulance phone numbers (THESE WILL RECEIVE CALLS)
AMBULANCE_1_PHONE=+919876543210
AMBULANCE_2_PHONE=+919876543211

# Verified hospital phone number
HOSPITAL_1_PHONE=+918765432109

# Your server URL
SERVER_URL=http://localhost:3000
```

### Step 2: Start Server

```bash
cd twilio-sms
npm install
npm start
```

---

## 🆘 Emergency Button API

### From Android App

```kotlin
// When emergency button is pressed
suspend fun createEmergency() {
    val emergency = EmergencyRequest(
        patientPhone = "+919123456789",
        patientName = "John Doe",
        patientLocation = LocationData(
            lat = 12.9716,
            lon = 77.5946,
            address = "MG Road, Bangalore"
        )
    )
    
    val response = api.createEmergency(emergency)
    
    if (response.isSuccessful) {
        val emergencyId = response.body()?.emergencyId
        // Start tracking screen
        navigateToTracking(emergencyId)
    }
}
```

### REST API Call

```bash
POST http://localhost:3000/emergency/create
Content-Type: application/json

{
  "patientPhone": "+919123456789",
  "patientName": "John Doe",
  "patientLocation": {
    "lat": 12.9716,
    "lon": 77.5946,
    "address": "MG Road, Bangalore"
  }
}
```

### Response

```json
{
  "success": true,
  "emergencyId": "EMR_1702035600000",
  "message": "Emergency created and calls initiated",
  "ambulanceCalls": 2,
  "data": {
    "id": "EMR_1702035600000",
    "patientPhone": "+919123456789",
    "patientName": "John Doe",
    "status": "pending"
  }
}
```

---

## 📞 What Happens Next

### Ambulances Receive Voice Call

**Automated Voice Message:**
> "Emergency alert! Emergency alert! Patient John Doe needs immediate ambulance assistance.
Location: MG Road, Bangalore. Emergency ID: EMR_1702035600000. Press 1 to accept this emergency.
Press 2 to reject."

### First Ambulance Accepts

**Ambulance API Call:**

```bash
POST http://localhost:3000/emergency/EMR_1702035600000/ambulance/accept
Content-Type: application/json

{
  "ambulanceId": "AMB_001",
  "location": {
    "lat": 12.9800,
    "lon": 77.6000
  }
}
```

**What Happens:**

1. ✅ Ambulance assigned to emergency
2. 📱 Patient receives SMS: "Ambulance accepted! Tracking: http://yourapp.com/track/EMR_xxx"
3. 📞 Hospital receives automated voice call

---

## 📍 Live Location Tracking

### Ambulance Updates Location Every 5 Seconds

```kotlin
// In ambulance app
locationManager.requestLocationUpdates(5000, 10f) { location ->
    api.updateAmbulanceLocation(
        emergencyId,
        LocationUpdate(location.latitude, location.longitude)
    )
}
```

### API Call

```bash
POST http://localhost:3000/emergency/EMR_1702035600000/ambulance/location
Content-Type: application/json

{
  "lat": 12.9825,
  "lon": 77.6025
}
```

### Patient Tracks Ambulance

```kotlin
// In patient app - Real-time polling
lifecycleScope.launch {
    while (isTracking) {
        val emergency = api.getEmergency(emergencyId)
        
        emergency.body()?.data?.assignedAmbulance?.location?.let { loc ->
            updateMapMarker(loc.lat, loc.lon)
            calculateETA(loc)
        }
        
        delay(3000) // Update every 3 seconds
    }
}
```

### API Call

```bash
GET http://localhost:3000/emergency/EMR_1702035600000
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "EMR_1702035600000",
    "patientName": "John Doe",
    "patientLocation": {
      "lat": 12.9716,
      "lon": 77.5946,
      "address": "MG Road, Bangalore"
    },
    "status": "ambulance_assigned",
    "assignedAmbulance": {
      "id": "AMB_001",
      "location": {
        "lat": 12.9825,
        "lon": 77.6025
      },
      "lastUpdate": "2024-12-08T10:30:00.000Z"
    },
    "assignedHospital": null
  }
}
```

---

## 🏥 Hospital Confirmation

### Hospital Receives Voice Call

**Automated Voice Message:**
> "Emergency patient incoming! Patient John Doe is being transported. Ambulance City Ambulance 1 is
on the way. Emergency ID: EMR_1702035600000. Please confirm bed availability. Press 1 to confirm bed
available. Press 2 if no beds available."

### Hospital Accepts

```bash
POST http://localhost:3000/emergency/EMR_1702035600000/hospital/accept
Content-Type: application/json

{
  "hospitalId": "HOSP_001"
}
```

**What Happens:**

1. ✅ Hospital assigned
2. 📱 Patient receives SMS: "Hospital confirmed! Bed ready at City General Hospital."
3. 📱 Ambulance receives SMS: "Hospital bed confirmed at City General Hospital."

---

## 📱 Android Integration

### Data Classes

```kotlin
data class EmergencyRequest(
    val patientPhone: String,
    val patientName: String,
    val patientLocation: LocationData
)

data class LocationData(
    val lat: Double,
    val lon: Double,
    val address: String
)

data class LocationUpdate(
    val lat: Double,
    val lon: Double
)

data class EmergencyResponse(
    val success: Boolean,
    val emergencyId: String,
    val message: String
)

data class EmergencyDetails(
    val id: String,
    val patientName: String,
    val patientLocation: LocationData,
    val status: String,
    val assignedAmbulance: AmbulanceInfo?,
    val assignedHospital: HospitalInfo?
)

data class AmbulanceInfo(
    val id: String,
    val location: LocationData,
    val lastUpdate: String
)
```

### Retrofit API Interface

```kotlin
interface EmergencyApiService {
    @POST("emergency/create")
    suspend fun createEmergency(
        @Body request: EmergencyRequest
    ): Response<EmergencyResponse>
    
    @POST("emergency/{id}/ambulance/accept")
    suspend fun ambulanceAccept(
        @Path("id") emergencyId: String,
        @Body request: AcceptRequest
    ): Response<AcceptResponse>
    
    @POST("emergency/{id}/ambulance/location")
    suspend fun updateLocation(
        @Path("id") emergencyId: String,
        @Body location: LocationUpdate
    ): Response<UpdateResponse>
    
    @GET("emergency/{id}")
    suspend fun getEmergency(
        @Path("id") emergencyId: String
    ): Response<EmergencyDetailsResponse>
}
```

### Emergency Button Click

```kotlin
binding.emergencyButton.setOnClickListener {
    lifecycleScope.launch {
        try {
            showLoading()
            
            val currentLocation = getCurrentLocation()
            val address = getAddressFromLocation(currentLocation)
            
            val emergency = EmergencyRequest(
                patientPhone = userPhone,
                patientName = userName,
                patientLocation = LocationData(
                    lat = currentLocation.latitude,
                    lon = currentLocation.longitude,
                    address = address
                )
            )
            
            val response = api.createEmergency(emergency)
            
            if (response.isSuccessful) {
                val emergencyId = response.body()?.emergencyId
                Toast.makeText(this@MainActivity, 
                    "Emergency alert sent! Calling ambulances...", 
                    Toast.LENGTH_LONG).show()
                
                // Navigate to tracking screen
                val intent = Intent(this@MainActivity, TrackingActivity::class.java)
                intent.putExtra("emergencyId", emergencyId)
                startActivity(intent)
            } else {
                showError("Failed to create emergency")
            }
            
        } catch (e: Exception) {
            showError("Error: ${e.message}")
        } finally {
            hideLoading()
        }
    }
}
```

### Live Tracking Screen

```kotlin
class TrackingActivity : AppCompatActivity() {
    private lateinit var map: GoogleMap
    private var ambulanceMarker: Marker? = null
    private var trackingJob: Job? = null
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val emergencyId = intent.getStringExtra("emergencyId")
        
        // Start tracking
        trackingJob = lifecycleScope.launch {
            while (isActive) {
                try {
                    val response = api.getEmergency(emergencyId!!)
                    
                    response.body()?.data?.let { emergency ->
                        updateUI(emergency)
                        
                        emergency.assignedAmbulance?.location?.let { loc ->
                            updateAmbulanceMarker(loc.lat, loc.lon)
                            calculateETA(loc)
                        }
                    }
                    
                } catch (e: Exception) {
                    Log.e(TAG, "Tracking error", e)
                }
                
                delay(3000) // Update every 3 seconds
            }
        }
    }
    
    private fun updateAmbulanceMarker(lat: Double, lon: Double) {
        val position = LatLng(lat, lon)
        
        if (ambulanceMarker == null) {
            ambulanceMarker = map.addMarker(
                MarkerOptions()
                    .position(position)
                    .title("Ambulance")
                    .icon(BitmapDescriptorFactory.fromResource(R.drawable.ambulance_icon))
            )
        } else {
            ambulanceMarker?.position = position
        }
        
        map.animateCamera(CameraUpdateFactory.newLatLngZoom(position, 15f))
    }
    
    override fun onDestroy() {
        super.onDestroy()
        trackingJob?.cancel()
    }
}
```

---

## 🧪 Testing Locally

### Test 1: Create Emergency

```bash
curl -X POST http://localhost:3000/emergency/create \
  -H "Content-Type: application/json" \
  -d '{
    "patientPhone": "+919123456789",
    "patientName": "Test Patient",
    "patientLocation": {
      "lat": 12.9716,
      "lon": 77.5946,
      "address": "Test Location"
    }
  }'
```

**Expected:**

- You'll see logs showing calls being made
- Ambulance phones will receive voice calls
- Response includes `emergencyId`

### Test 2: Ambulance Accepts

```bash
curl -X POST http://localhost:3000/emergency/EMR_xxx/ambulance/accept \
  -H "Content-Type: application/json" \
  -d '{
    "ambulanceId": "AMB_001",
    "location": { "lat": 12.9800, "lon": 77.6000 }
  }'
```

**Expected:**

- Hospital receives voice call
- Patient receives SMS

### Test 3: Update Location

```bash
curl -X POST http://localhost:3000/emergency/EMR_xxx/ambulance/location \
  -H "Content-Type: application/json" \
  -d '{ "lat": 12.9825, "lon": 77.6025 }'
```

### Test 4: Track Emergency

```bash
curl http://localhost:3000/emergency/EMR_xxx
```

**Expected:**

- Returns complete emergency data
- Includes ambulance location

---

## 💡 Key Features

✅ **Emergency Button** - One tap creates emergency  
✅ **Automated Voice Calls** - Calls 2 ambulances + 1 hospital  
✅ **Voice Messages** - Clear instructions via phone  
✅ **First Responder** - First ambulance to accept gets assigned  
✅ **Live Location** - Real-time ambulance tracking  
✅ **Hospital Coordination** - Automatic hospital notification  
✅ **SMS Updates** - Patient receives status updates  
✅ **Simple API** - Easy Android integration

---

## 📞 Twilio Requirements

1. **Verified Phone Numbers** (Trial Account):
    - Add ambulance phone numbers to verified list
    - Add hospital phone number to verified list
    - Add patient phone number to verified list

2. **Upgrade to Paid** (Production):
    - Remove verification requirement
    - Call any phone number

---

**System is ready! Test with real phone numbers! 🚀**
