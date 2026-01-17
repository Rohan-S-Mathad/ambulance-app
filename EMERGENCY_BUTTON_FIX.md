# 🚨 EMERGENCY BUTTON FIX - COMPLETE SOLUTION

## ✅ ISSUES FOUND & FIXED

### 1. ❌ **Server Was Not Running**

The Node.js server was not running, so the app couldn't connect to make emergency calls.

### 2. ❌ **IP Address Changed**

- **Old IP (in app):** `172.17.13.32`
- **Current IP:** `10.251.87.24` ✅ **UPDATED!**
- WiFi IP addresses can change when you reconnect to the network

### ✅ **What Was Fixed:**

1. ✅ Updated `RetrofitClient.kt` with new IP: `10.251.87.24`
2. ✅ Updated `server.js` startup message with correct IP
3. 📋 Instructions below to start the server and test

---

## 🚀 STEP-BY-STEP FIX

### **STEP 1: Start the Server** ⭐ **DO THIS FIRST!**

Open PowerShell and run:

```powershell
cd "C:\Users\ROHAN MATHAD\AndroidStudioProjects\ambulance\twilio-serverless"
node server.js
```

**Expected Output:**

```
🚑 ========================================
🚑 Ambulance Emergency System - RUNNING!
🚑 ========================================
🚑 Server: http://localhost:3000
🚑 Network: http://10.251.87.24:3000
🚑 Emergency endpoint: /emergency-alert
🚑 ========================================

📱 Configured contacts:
  Twilio Number: +18585332666
  Ambulance 1: +919482936725
  Ambulance 2: +919482936725
  Hospital 1: +919482936725

✅ Ready to handle emergencies!
✅ Accepting connections from network!
```

**Keep this PowerShell window open!** You'll see logs when emergency button is pressed.

---

### **STEP 2: Rebuild the App**

The app needs to be rebuilt with the new IP address.

**Option A: Using Android Studio (Recommended)**

1. Click **Build** → **Rebuild Project**
2. Wait for build to complete
3. Click the green **▶ RUN** button
4. App will install on your phone

**Option B: Using Command Line**

```powershell
cd "C:\Users\ROHAN MATHAD\AndroidStudioProjects\ambulance"
.\gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

---

### **STEP 3: Verify Network Setup** ⚠️ **CRITICAL!**

**Your phone and computer MUST be on the same WiFi network!**

#### Check Computer's WiFi:

```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" }
```

Should show: `10.251.87.24`

#### Check Phone's WiFi:

1. Open **Settings** → **WiFi**
2. Check the connected network name
3. **Turn OFF mobile data** (important!)
4. Make sure it's the SAME network as your computer

---

### **STEP 4: Test Server from Phone Browser** 🔍

**Before testing the app, verify your phone can reach the server:**

1. Open **Chrome** or **Safari** on your phone
2. Navigate to: `http://10.251.87.24:3000`
3. You should see:

```json
{
  "status": "running",
  "message": "Ambulance Emergency System - Twilio Server",
  "endpoints": ["/emergency-alert"]
}
```

**If you DON'T see this:**

- ❌ Phone and computer are on different WiFi networks
- ❌ Mobile data is ON (turn it OFF)
- ❌ Server is not running (go back to Step 1)
- ❌ Firewall might be blocking (see troubleshooting below)

---

### **STEP 5: Test the Emergency Button** 🚨

1. Open the **Smart Ambulance** app on your phone
2. Select **User** role
3. Grant **Location Permission** when prompted
4. Press the big red **Emergency** button

---

## 📊 WHAT YOU SHOULD SEE

### ✅ On Phone Screen:

```
Getting location...
Location found. Creating incident...
Emergency created! Broadcasted to X nearest ambulances
```

### ✅ In Server PowerShell Window:

```
📞 Emergency alert received! { 
  patientPhone: '+919482936725',
  patientName: 'Emergency Patient',
  latitude: XX.XXXX,
  longitude: XX.XXXX,
  ...
}
📞 Calling 2 contacts...
  ☎️  Calling Ambulance 1: +919482936725
  ✅ Call SID: CAxxxxxxxxxxxxxxxxxx
  ✅ SMS SID: SMxxxxxxxxxxxxxxxxxx
  ☎️  Calling Hospital 1: +919482936725
  ✅ Call SID: CAxxxxxxxxxxxxxxxxxx
  ✅ SMS SID: SMxxxxxxxxxxxxxxxxxx
```

### ✅ On Hospital Phone (+919482936725):

- 📞 **Phone RINGS!** (Voice call from Twilio)
- 📱 **SMS arrives!** (Emergency alert text with location)

---

## 🧪 MANUAL TEST (To Verify Server Works)

You can test the server directly from PowerShell to verify it's working:

```powershell
$body = @{
    patientPhone = "+919482936725"
    patientName = "Manual Test"
    latitude = 12.9716
    longitude = 77.5946
    address = "Test Location"
    incidentId = "MANUAL-TEST-$(Get-Date -Format 'yyyyMMddHHmmss')"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://10.251.87.24:3000/emergency-alert" -Body $body -ContentType "application/json"
```

**Expected Result:**

```json
{
  "success": true,
  "message": "Emergency alerts sent",
  "results": [...]
}
```

And the phone `+919482936725` should receive a call and SMS!

---

## 🔧 TROUBLESHOOTING

### ❌ Problem: "Connection refused" or "Network Error" in App

**Diagnose:**

```powershell
# Test from computer (should work)
curl http://localhost:3000

# Test from phone browser
# Open: http://10.251.87.24:3000
```

**Solutions:**

**1. Server Not Running**

```powershell
# Check if server is running
Get-Process -Name node -ErrorAction SilentlyContinue

# If nothing shows, start the server:
cd "C:\Users\ROHAN MATHAD\AndroidStudioProjects\ambulance\twilio-serverless"
node server.js
```

**2. Firewall Blocking**

```powershell
# Allow Node.js through Windows Firewall
New-NetFirewallRule -DisplayName "Node.js Server" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow
```

**3. Wrong WiFi Network**

- Check both devices are on SAME network
- Turn OFF mobile data on phone
- Restart WiFi on both devices

---

### ❌ Problem: IP Address Changed Again

WiFi IP addresses can change. Check current IP:

```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.PrefixOrigin -eq "Dhcp" } | Select-Object IPAddress
```

If different from `10.251.87.24`:

1. Update `app/src/main/java/com/example/ambulance/data/RetrofitClient.kt`
2. Change `BASE_URL = "http://NEW_IP:3000/"`
3. Rebuild app in Android Studio
4. Reinstall on phone

---

### ❌ Problem: App Shows "Location Error"

**Solutions:**

1. Enable **GPS/Location** on phone
2. Go outside or near a window (better GPS signal)
3. Grant **Location Permission** when app asks
4. Try tapping **Allow all the time** or **While using the app**

---

### ❌ Problem: No Calls Received (But Server Says Success)

**Check Twilio Trial Account Limitations:**

1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. Verify the number `+919482936725` is listed as "Verified"
3. If not verified, click "Add a new number" and verify it

**Trial accounts can only call verified numbers!**

---

### ❌ Problem: Build Failed in Android Studio

**Solution:**

```powershell
# Clean and rebuild
cd "C:\Users\ROHAN MATHAD\AndroidStudioProjects\ambulance"
.\gradlew clean
.\gradlew assembleDebug
```

---

## ✅ PRE-FLIGHT CHECKLIST

Before testing, verify:

- [ ] Server is running (`node server.js` in PowerShell)
- [ ] Server shows correct IP: `10.251.87.24`
- [ ] App rebuilt with new IP
- [ ] Phone on SAME WiFi as computer
- [ ] Mobile data OFF on phone
- [ ] Can access `http://10.251.87.24:3000` from phone browser ⭐
- [ ] App installed (latest version)
- [ ] Location permission granted
- [ ] GPS enabled on phone

---

## 🎯 UNDERSTANDING THE FLOW

Here's what happens when you press the Emergency button:

```
1. User presses Emergency button
   ↓
2. UserActivity.kt gets GPS location
   ↓
3. IncidentViewModel.kt creates incident
   ↓
4. FirestoreRepository.kt saves to Firestore
   ↓
5. FirestoreRepository.kt calls triggerEmergencyCall()
   ↓
6. Retrofit sends POST to: http://10.251.87.24:3000/emergency-alert
   ↓
7. server.js (on your computer) receives request
   ↓
8. server.js calls Twilio API with emergency details
   ↓
9. Twilio makes voice calls + sends SMS to all configured numbers
   ↓
10. Hospital phone RINGS! 📞
```

---

## 🎉 SUCCESS INDICATORS

### ✅ Everything is Working When:

1. **Phone Browser Test:**
    - Can access `http://10.251.87.24:3000`
    - Shows JSON response with "status": "running"

2. **App Test:**
    - No "Connection refused" errors
    - Shows "Emergency created!" message
    - No red error toasts

3. **Server Logs:**
    - Shows "📞 Emergency alert received!"
    - Shows "✅ Call SID: CA..."
    - Shows "✅ SMS SID: SM..."

4. **Hospital Phone:**
    - Receives voice call from Twilio number
    - Receives SMS with emergency details

---

## 📞 QUICK COMMANDS REFERENCE

### Check if server is running:

```powershell
Get-Process -Name node -ErrorAction SilentlyContinue
```

### Start server:

```powershell
cd "C:\Users\ROHAN MATHAD\AndroidStudioProjects\ambulance\twilio-serverless"
node server.js
```

### Check current IP:

```powershell
ipconfig | Select-String "IPv4"
```

### Test server from computer:

```powershell
curl http://localhost:3000
```

### Rebuild app:

```powershell
cd "C:\Users\ROHAN MATHAD\AndroidStudioProjects\ambulance"
.\gradlew assembleDebug
```

### Install app on phone:

```powershell
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

---

## 💡 PRO TIPS

### 1. Keep Server Window Visible

Always keep the PowerShell window with server logs visible while testing. You'll see real-time logs
when the emergency button is pressed!

### 2. Test Browser First

Always test `http://10.251.87.24:3000` in your phone's browser BEFORE testing the app. If the
browser can't reach it, the app won't either!

### 3. Watch Android Logcat

Open Android Studio's Logcat and filter by `TwilioAPI` to see detailed network logs from the app.

### 4. Mobile Data is the Enemy

Mobile data will prevent your phone from using WiFi to reach your computer. **Always turn it OFF**
during testing!

### 5. Use Mobile Hotspot as Alternative

If WiFi issues persist, you can:

1. Enable mobile hotspot on your phone
2. Connect computer to phone's hotspot
3. Get computer's new IP
4. Update RetrofitClient.kt
5. Rebuild and test

---

## 📱 NEXT STEPS

1. ✅ **Start the server** (Step 1)
2. ✅ **Rebuild the app** (Step 2)
3. ✅ **Test from phone browser** (Step 4)
4. ✅ **Press emergency button** (Step 5)
5. 🎉 **Watch it work!**

---

**Last Updated:** December 9, 2025
**Current IP:** 10.251.87.24
**Server Status:** ⚠️ Not Running (Need to start)
**App Status:** ✅ Updated & Ready to Build
**Phone Numbers:** ✅ All set to +919482936725 (Verified)

---

## 🆘 STILL NOT WORKING?

If you've followed all steps and it's still not working:

1. **Restart everything:**
    - Stop server (Ctrl+C)
    - Close app on phone
    - Reconnect to WiFi on both devices
    - Start server again
    - Launch app again

2. **Check Logcat in Android Studio:**
    - Look for network errors
    - Look for "TwilioAPI" logs
    - Share the error messages

3. **Verify Twilio Account:**
    - Login to https://console.twilio.com
    - Check if account is active
    - Check if phone numbers are verified
    - Check if you have trial credits remaining

4. **Test each component separately:**
    - Test server: `curl http://localhost:3000`
    - Test from phone browser: `http://10.251.87.24:3000`
    - Test manual API call: (see Manual Test section)
    - Test app with logs

---

Good luck! 🚀 The emergency button should work after following these steps!
