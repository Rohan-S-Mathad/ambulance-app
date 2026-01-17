# 🚀 Quick Start - Emergency Call System

## ✅ Build Status: SUCCESS!

The Android app has been successfully configured to make emergency calls via Twilio!

---

## 🎯 Step-by-Step Instructions

### 1. Start the Twilio Server

```powershell
cd twilio-sms
npm start
```

**Expected output:**

```
======================================================================
🚨 EMERGENCY RESPONSE SYSTEM STARTED!
💻 Server: http://localhost:3000
======================================================================
```

### 2. Verify Server is Running

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/health"
```

**Expected response:**

```json
{
  "status": "ok",
  "service": "Twilio Emergency API"
}
```

### 3. Run the Android App

In Android Studio:

1. Click the green **Run** button ▶️
2. Select your emulator or device
3. Wait for the app to install and launch

### 4. Test Emergency Call

1. In the app, select **"User"** role
2. Click the **Emergency Button** (red button)
3. Grant location permission if asked
4. Watch the magic happen! ✨

---

## 📊 What Happens

```
You press Emergency Button
         ↓
App gets your location
         ↓
Creates Firebase incident
         ↓
Calls Twilio API (http://localhost:3000/emergency/trigger)
         ↓
Server makes calls via Twilio
         ↓
📞 PHONES RING!
```

**Calls will be made to:**

- +919901647386 (Ambulance 1)
- +917892280875 (Ambulance 2)
- +919482936725 (Hospital 1)

---

## 🔍 Verification

### Check Android Logs

In Android Studio → Logcat → Filter by `TwilioAPI`:

**Success:**

```
D/TwilioAPI: ✅ Emergency calls triggered successfully!
```

**Error:**

```
E/TwilioAPI: ❌ Failed to connect to /10.0.2.2:3000
```

### Check Server Logs

In the terminal where you ran `npm start`:

**Success:**

```
📞 Calling 3 ambulances...
✅ Called City Ambulance 1: SMxxx...
```

---

## 🧪 Manual Test (Without App)

Test the server directly:

```powershell
$body = @{
    patientPhone = "+919482936725"
    patientName = "Test Patient"
    latitude = 12.9716
    longitude = 77.5946
    address = "Test Location"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:3000/emergency/trigger" -Body $body -ContentType "application/json"
```

This will trigger calls immediately!

---

## ⚠️ Troubleshooting

### Problem: "Failed to connect to /10.0.2.2:3000"

**Solution:** Make sure server is running!

```powershell
cd twilio-sms
npm start
```

### Problem: Using Physical Device

**Solution:** Edit `RetrofitClient.kt`:

```kotlin
// Find your IP: ipconfig (look for IPv4 Address)
private const val BASE_URL = "http://192.168.1.XXX:3000/"  // Replace XXX with your IP
```

### Problem: "No ambulance phone numbers configured"

**Solution:** Check `twilio-sms/.env` file:

```env
AMBULANCE_1_PHONE=+919901647386
AMBULANCE_2_PHONE=+917892280875
HOSPITAL_1_PHONE=+919482936725
```

---

## 📞 Phone Numbers (Current Config)

From `twilio-sms/.env`:

- **Ambulance 1:** +919901647386
- **Ambulance 2:** +917892280875
- **Hospital 1:** +919482936725

**Note:** For Twilio trial accounts, these numbers must be verified at:
https://console.twilio.com/us1/develop/phone-numbers/manage/verified

---

## 🎯 Testing Checklist

- [ ] Server started (`npm start`)
- [ ] Health check passes
- [ ] App runs without errors
- [ ] Location permission granted
- [ ] Emergency button pressed
- [ ] Android Logcat shows success
- [ ] Server console shows calls initiated
- [ ] **Phones actually ring!** ✅

---

## 📚 More Documentation

- **Complete Setup:** `TWILIO_CALL_SETUP_GUIDE.md`
- **What Changed:** `EMERGENCY_CALLS_FIXED.md`
- **Auto Script:** `START_SERVER_AND_TEST.ps1`
- **Server Guide:** `twilio-sms/README.md`

---

## 🎉 Success Indicators

### ✅ Android App

```
Creating emergency incident...
Emergency created! Broadcasted to 3 nearest ambulances
D/TwilioAPI: ✅ Emergency calls triggered successfully!
```

### ✅ Server Console

```
📞 Calling 3 ambulances...
✅ Called City Ambulance 1: SMxxx...
✅ Called City Ambulance 2: SMyyy...
✅ Called Hospital 1: SMzzz...
```

### ✅ Twilio Console

Visit https://console.twilio.com and check the **Calls** section to see call status.

---

## 💡 Tips

1. **Keep server running** while testing the app
2. **Check both logs** (Android + Server) for debugging
3. **Verify phone numbers** in Twilio console for trial accounts
4. **Check Twilio balance** at https://console.twilio.com
5. **Use PowerShell script** for quick testing: `.\START_SERVER_AND_TEST.ps1`

---

**Emergency call system is ready! Press that button! 🚨📞**
