# 🚑 Twilio Emergency Call System - Quick Setup

## What This Does:

When user presses **EMERGENCY** button → Makes **voice calls** to ambulances with custom message →
Ambulances can press 1 to accept or 2 to decline

---

## 🚀 Quick Setup (10 Minutes)

### **1. Configure Twilio (.env file)**

In `twilio-sms/.env`:

```env
TWILIO_ACCOUNT_SID=ACxxxxx...
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# Ambulance phones (will receive calls)
AMBULANCE_1_PHONE=+919876543210
AMBULANCE_2_PHONE=+919876543211

# Hospital phone
HOSPITAL_1_PHONE=+918765432109
```

### **2. Start Server**

```bash
cd twilio-sms
npm install
npm start
```

### **3. Expose with ngrok (for testing)**

```bash
ngrok http 3000
```

Copy the URL: `https://abc123.ngrok.io`

### **4. Update Android App**

See complete code in `ANDROID_INTEGRATION.md`

Quick version - update `getCurrentLocation()` in `UserActivity.kt`:

```kotlin
private fun triggerEmergencyCall(latitude: Double, longitude: Double) {
    lifecycleScope.launch {
        val request = EmergencyRequest(
            patientPhone = "+919876543210",
            patientName = "Emergency Patient",
            latitude = latitude,
            longitude = longitude,
            address = "Emergency location"
        )
        
        val response = RetrofitClient.twilioApi.triggerEmergency(request)
        
        if (response.isSuccessful) {
            binding.textViewStatus.text = "✅ Calls sent to ambulances!"
        }
    }
}
```

---

## 📱 **What Happens:**

1. User presses EMERGENCY button
2. Android app gets GPS location
3. Sends to server: `POST /emergency/trigger`
4. Server calls ambulances via Twilio
5. Voice message plays: "Emergency Alert! Press 1 to accept..."
6. Ambulance presses 1 → Accepts emergency
7. All other calls cancelled

---

## 🎙️ **Voice Message Options:**

### **Option A: Text-to-Speech (Default)**

```kotlin
audioUrl = null  // Uses Twilio's voice
```

Message spoken:
> "Emergency Alert! Medical emergency reported at latitude X, longitude Y. Press 1 to accept, 2 to
decline."

### **Option B: Custom MP3**

```kotlin
audioUrl = "https://yourserver.com/emergency.mp3"
```

Upload your MP3 file and provide the URL.

---

## 📋 **Files Created:**

✅ `twilio-sms/emergencyService.js` - Emergency call logic  
✅ `twilio-sms/index.js` - API endpoints  
✅ `ANDROID_INTEGRATION.md` - Complete Android code

---

## 🧪 **Test It:**

1. Start server: `npm start`
2. Run Android app
3. Press EMERGENCY
4. Your configured phones will ring!
5. Press 1 to accept

---

## 💰 **Cost:**

- ~$0.013/minute per call (India)
- 2 ambulances × 1 min = **$0.026** per emergency
- Very affordable!

---

## 📚 **Full Documentation:**

- `ANDROID_INTEGRATION.md` - Complete Android integration
- `EMERGENCY_GUIDE.md` - Detailed system guide
- `README.md` - Basic setup

---

**Ready to save lives! 🚑**
