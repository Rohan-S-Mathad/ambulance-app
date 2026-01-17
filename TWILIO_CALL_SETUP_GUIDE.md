# 🚨 Twilio Emergency Call Setup Guide

## Problem Solved

Emergency button in Android app now triggers **REAL PHONE CALLS** to ambulances and hospitals using
Twilio!

---

## 📋 What We Added

### 1. **Retrofit API Client**

- Added HTTP client to connect Android app to Twilio server
- Files created:
    - `TwilioApiService.kt` - API interface
    - `RetrofitClient.kt` - HTTP client configuration

### 2. **Automatic Call Triggering**

- Modified `FirestoreRepository.kt` to call Twilio API when emergency is created
- Calls are triggered automatically when user presses emergency button

### 3. **Dependencies Added**

```gradle
implementation("com.squareup.retrofit2:retrofit:2.9.0")
implementation("com.squareup.retrofit2:converter-gson:2.9.0")
implementation("com.squareup.okhttp3:logging-interceptor:4.11.0")
```

---

## 🚀 Setup Instructions

### Step 1: Start the Twilio Server

```powershell
# Navigate to twilio-sms directory
cd twilio-sms

# Start the server
npm start
```

**You should see:**

```
======================================================================
🚨 EMERGENCY RESPONSE SYSTEM STARTED!
💻 Server: http://localhost:3000
======================================================================
```

### Step 2: Configure Server URL in Android App

Open `app/src/main/java/com/example/ambulance/data/RetrofitClient.kt`

**For Android Emulator:**

```kotlin
private const val BASE_URL = "http://10.0.2.2:3000/"  // ✅ Use this for emulator
```

**For Physical Device:**

```kotlin
private const val BASE_URL = "http://192.168.1.100:3000/"  // ⚠️ Replace with YOUR computer's IP
```

**To find your IP address:**

```powershell
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

### Step 3: Sync Gradle

In Android Studio:

1. Click **File** → **Sync Project with Gradle Files**
2. Wait for sync to complete

### Step 4: Rebuild the App

```
Build → Clean Project
Build → Rebuild Project
```

---

## 🧪 Testing

### Test 1: Server Health Check

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/health"
```

**Expected Response:**

```json
{
  "status": "ok",
  "service": "Twilio Emergency API",
  "timestamp": "2024-12-08T..."
}
```

### Test 2: Manual API Test

```powershell
$body = @{
    patientPhone = "+919482936725"
    patientName = "Test Patient"
    latitude = 12.9716
    longitude = 77.5946
    address = "Test Location, Bangalore"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:3000/emergency/trigger" -Body $body -ContentType "application/json"
```

**This should trigger calls to:**

- Ambulance 1: `+919901647386`
- Ambulance 2: `+917892280875`
- Hospital 1: `+919482936725`

### Test 3: Android App Test

1. Run the app in emulator/device
2. Select **User** role
3. Click **Emergency Button**
4. Check server console for logs:
   ```
   📞 Calling 3 ambulances...
   ✅ Called City Ambulance 1: SMxxx...
   ✅ Emergency calls triggered successfully!
   ```

---

## 📱 How It Works

### Flow Diagram

```
User Presses Emergency Button
         ↓
UserActivity gets location
         ↓
IncidentViewModel.createIncident()
         ↓
FirestoreRepository.createIncidentAndBroadcast()
         ↓
1. Creates incident in Firebase
2. Broadcasts to nearest ambulances (Firebase)
3. Calls triggerEmergencyCall() ← NEW!
         ↓
RetrofitClient.twilioApi.triggerEmergency()
         ↓
POST http://localhost:3000/emergency/trigger
         ↓
Node.js Twilio Server
         ↓
Twilio API makes calls to:
  - Ambulance 1: +919901647386
  - Ambulance 2: +917892280875
  - Hospital 1: +919482936725
```

---

## 🔍 Debugging

### Check Android Logs

In Android Studio → Logcat, filter by `TwilioAPI`:

```
✅ Success: Emergency calls triggered successfully!
❌ Error: Failed to connect to /10.0.2.2:3000
```

### Common Issues

#### 1. ❌ "Failed to connect to /10.0.2.2:3000"

**Solution:**

- Make sure Twilio server is running
- Check if port 3000 is blocked by firewall

#### 2. ❌ "No ambulance phone numbers configured"

**Solution:**

- Check `.env` file has phone numbers:
  ```env
  AMBULANCE_1_PHONE=+919901647386
  AMBULANCE_2_PHONE=+917892280875
  HOSPITAL_1_PHONE=+919482936725
  ```

#### 3. ❌ Calls not going through

**Solution:**

- Check Twilio console for errors
- Verify phone numbers are verified (for trial account)
- Check Twilio account balance

#### 4. ❌ "cleartext HTTP traffic not permitted"

**Solution:**
Add to `AndroidManifest.xml`:

```xml
<application
    android:usesCleartextTraffic="true"
    ...>
```

---

## 📊 Server Endpoints

### Health Check

```
GET /health
```

### Trigger Emergency

```
POST /emergency/trigger
Body: {
  "patientPhone": "+919482936725",
  "patientName": "John Doe",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "address": "MG Road, Bangalore"
}
```

### Create Emergency (Advanced)

```
POST /emergency/create
Body: {
  "patientPhone": "+919482936725",
  "patientName": "John Doe",
  "patientLocation": {
    "lat": 12.9716,
    "lon": 77.5946,
    "address": "MG Road, Bangalore"
  }
}
```

---

## 🎯 What Happens When Calls Are Made

1. **Ambulance Receives Call:**
   ```
   "Emergency Alert! Emergency Alert! 
   A medical emergency has been reported.
   Patient location: Latitude 12.9716, Longitude 77.5946.
   Press 1 to accept this emergency.
   Press 2 to decline."
   ```

2. **Hospital Receives Call:**
   ```
   Similar voice message with emergency details
   ```

3. **SMS Backup:**
    - All contacts also receive SMS as backup
    - Contains emergency location and details

---

## 🔐 Security Notes

1. **Never commit `.env` file** to Git
2. **Use environment variables** for production
3. **Add authentication** to API endpoints in production
4. **Rate limiting** recommended for production

---

## 📝 Phone Numbers in .env

Your current configuration:

```env
AMBULANCE_1_PHONE=+919901647386
AMBULANCE_2_PHONE=+917892280875
HOSPITAL_1_PHONE=+919482936725
```

**Note:** These numbers must be verified in Twilio console if using trial account.

---

## ✅ Verification Checklist

- [ ] Twilio server is running (`npm start`)
- [ ] Server responds to `/health` endpoint
- [ ] `.env` file has correct phone numbers
- [ ] Phone numbers are verified in Twilio console
- [ ] Android app has correct `BASE_URL`
- [ ] Gradle sync completed successfully
- [ ] App rebuilt after changes
- [ ] INTERNET permission in AndroidManifest
- [ ] Firewall allows port 3000

---

## 🎉 Success Indicators

When everything works:

1. **Android Logcat shows:**
   ```
   D/TwilioAPI: ✅ Emergency calls triggered successfully!
   ```

2. **Server console shows:**
   ```
   📞 Calling 3 ambulances...
   ✅ Called City Ambulance 1: SMxxx...
   ```

3. **Phone rings!** 📱

---

## 🆘 Need Help?

1. Check server is running: `http://localhost:3000/health`
2. Check Android logs: Filter by `TwilioAPI`
3. Check Twilio console: https://console.twilio.com
4. Verify `.env` configuration
5. Test with PowerShell script first

---

**Setup complete! Emergency calls will now work! 🚨📞**
