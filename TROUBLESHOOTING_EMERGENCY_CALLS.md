# 🔧 Emergency Calls Troubleshooting Guide

## ❌ Problem: "Emergency button doesn't trigger calls"

---

## ✅ Current Status

- ✅ **Server is RUNNING** on `http://localhost:3000`
- ✅ **App has been rebuilt** with correct URL
- ✅ **Hospital number verified** (+919482936725)

---

## 🎯 Step-by-Step Debugging

### Step 1: Verify Server is Running

Run this in PowerShell:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/" -Method Get
```

**Expected Output:**

```
status  message
------  -------
running Ambulance Emergency System - Twilio Server
```

**If it fails:**

```powershell
cd "C:\Users\ROHAN MATHAD\AndroidStudioProjects\ambulance\twilio-serverless"
npm start
```

---

### Step 2: Check Which Device You're Using

#### **If using EMULATOR:**

✅ App is now configured correctly with `http://10.0.2.2:3000/`

#### **If using PHYSICAL DEVICE:**

⚠️ You need to change the URL!

1. Find your computer's IP address:
   ```powershell
   ipconfig | Select-String "IPv4"
   ```

2. Look for something like: `192.168.1.XXX` or `10.0.0.XXX`

3. Update `RetrofitClient.kt`:
   ```kotlin
   private const val BASE_URL = "http://192.168.1.XXX:3000/"  // Use your actual IP
   ```

4. Rebuild app:
   ```powershell
   ./gradlew assembleDebug
   ```

5. Make sure your phone and computer are on the **same WiFi network**!

---

### Step 3: Install and Run the Latest APK

1. In Android Studio, click **Run** (green play button)
2. Or manually install:
   ```powershell
   adb install -r app/build/outputs/apk/debug/app-debug.apk
   ```

---

### Step 4: Grant Location Permission

When you first open the app:

1. The app will ask for location permission
2. Click **"Allow"** or **"While using the app"**
3. Make sure GPS is enabled on your device

---

### Step 5: Test the Emergency Button

1. Open the app
2. Select **"User"** role
3. Press the **"Emergency"** button
4. Watch the status messages on screen

**Expected behavior:**

- "Getting location..."
- "Location found. Creating incident..."
- "Emergency created! Broadcasted to X nearest ambulances"

---

### Step 6: Check Android Studio Logcat

1. Open **Logcat** in Android Studio
2. Filter by: `TwilioAPI`
3. Press the emergency button

**Expected logs:**

```
D/TwilioAPI: ✅ Emergency calls triggered successfully!
D/TwilioAPI: Response: {success=true, message=Emergency alerts sent, ...}
D/TwilioAPI:   Hospital 1: success
```

**If you see errors:**

- "Connection refused" → Server not running or wrong URL
- "Network error" → Check internet/WiFi connection
- "Timeout" → Server too slow or not responding

---

### Step 7: Check Server Logs

Watch the PowerShell window where server is running. You should see:

```
📞 Emergency alert received! { patientPhone: '+919482936725', ... }
📞 Calling 2 contacts...
  ☎️  Calling Ambulance 1: +919740417391
  ❌ Error contacting Ambulance 1: The number +919740417391 is unverified
  ☎️  Calling Hospital 1: +919482936725
  ✅ Call SID: CA1753b57bc46b10e88ad5a16725fcd77f
  ✅ SMS SID: SM46ca0aea63393c2a5d041ca0e6805ea4
```

**If you see nothing:**

- App is not reaching the server (check URL)
- App is not making the API call (check Logcat)

---

## 🧪 Manual Test

Test the server directly from PowerShell to confirm it works:

```powershell
$body = @{
    patientPhone = "+919482936725"
    patientName = "Manual Test"
    latitude = 12.9716
    longitude = 77.5946
    address = "Test Location"
    incidentId = "MANUAL-TEST-001"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:3000/emergency-alert" -Body $body -ContentType "application/json"
```

**⚠️ THIS WILL ACTUALLY CALL THE PHONES!**

**Expected output:**

```json
{
  "success": true,
  "message": "Emergency alerts sent",
  "results": [...]
}
```

If this works but the app doesn't, the problem is with the Android app configuration.

---

## 🔍 Common Issues & Solutions

### Issue 1: "Connection refused" in Logcat

**Cause:** App can't reach the server

**Solutions:**

- ✅ Make sure server is running
- ✅ Use `10.0.2.2:3000` for emulator
- ✅ Use your computer's IP for physical device
- ✅ Turn off Windows Firewall temporarily (for testing)

---

### Issue 2: "Unverified number" errors

**Cause:** Twilio trial account restriction

**Solution:** Verify numbers at:
https://console.twilio.com/us1/develop/phone-numbers/manage/verified

**Current status:**

- ✅ Hospital (+919482936725) - Verified
- ❌ Ambulances (+919740417391) - Need verification

---

### Issue 3: "No location available"

**Cause:** GPS not enabled or permission denied

**Solutions:**

- Enable GPS/Location on device
- Grant location permission to app
- If using emulator, set a location in emulator settings

---

### Issue 4: Server stops randomly

**Cause:** PowerShell window closed or job stopped

**Solution:**

```powershell
# Check if server job is running:
Get-Job

# If not running:
cd twilio-serverless
npm start
```

---

### Issue 5: Firewall blocking connections

**Cause:** Windows Firewall blocking Node.js

**Solution:**

1. Search "Windows Defender Firewall"
2. Click "Allow an app through firewall"
3. Find "Node.js" and check both Private and Public
4. Or temporarily disable firewall for testing

---

## 📱 Quick Device Setup Guide

### For Emulator:

1. ✅ URL already set: `http://10.0.2.2:3000/`
2. Run app from Android Studio
3. Set fake GPS location in emulator

### For Physical Device:

1. Find computer IP: `ipconfig`
2. Update `RetrofitClient.kt` with IP
3. Rebuild: `./gradlew assembleDebug`
4. Connect phone and computer to **same WiFi**
5. Turn off mobile data on phone
6. Run app

---

## 🎯 Verification Checklist

Before testing, confirm:

- [ ] Server is running (`http://localhost:3000` works in browser)
- [ ] Correct URL in `RetrofitClient.kt` (emulator vs physical device)
- [ ] App rebuilt and installed (green play button in Android Studio)
- [ ] Location permission granted
- [ ] GPS enabled on device
- [ ] WiFi connected (for physical device)
- [ ] Same WiFi network (for physical device)
- [ ] Server logs visible (PowerShell window open)

---

## 📞 Success Indicators

When it works, you'll see:

1. **On Phone Screen:**
    - "Getting location..."
    - "Location found. Creating incident..."
    - "Emergency created! Broadcasted to X nearest ambulances"

2. **In Logcat:**
   ```
   D/TwilioAPI: ✅ Emergency calls triggered successfully!
   ```

3. **In Server Logs:**
   ```
   📞 Emergency alert received!
   📞 Calling 2 contacts...
   ✅ Call SID: CAxxxx
   ✅ SMS SID: SMxxxx
   ```

4. **Phone rings!** 📞 (Hospital number: +919482936725)

---

## 🆘 Still Not Working?

### Last Resort Debugging:

1. **Check server is accessible from emulator:**
   ```powershell
   # In PowerShell
   Test-NetConnection -ComputerName localhost -Port 3000
   ```

2. **View complete Logcat:**
   ```
   Filter: "ambulance" (show all app logs)
   ```

3. **Test server with curl:**
   ```powershell
   curl http://localhost:3000/
   ```

4. **Restart everything:**
    - Stop server (Ctrl+C)
    - Close Android Studio
    - Restart server: `npm start`
    - Rebuild app: `./gradlew clean assembleDebug`
    - Run app again

---

## 📊 Expected Flow

```
1. User presses button
   ↓
2. App gets GPS location
   ↓
3. App saves to Firestore
   ↓
4. App calls: POST http://10.0.2.2:3000/emergency-alert
   ↓
5. Server receives request
   ↓
6. Server calls Twilio API
   ↓
7. Twilio makes calls/SMS
   ↓
8. Phones ring! 📞
```

**Find where it breaks and fix that step!**

---

## 💡 Pro Tips

1. **Keep server window visible** - Watch for errors in real-time
2. **Use Logcat filters** - `TwilioAPI`, `FirestoreRepository`, `UserActivity`
3. **Test server separately** - Use PowerShell test command
4. **Check Twilio Console** - View actual call logs
5. **Verify phone numbers** - Trial account limitation

---

## 🔗 Useful Links

- **Twilio Console (Calls):** https://console.twilio.com/us1/monitor/logs/calls
- **Twilio Console (SMS):** https://console.twilio.com/us1/monitor/logs/sms
- **Verify Numbers:** https://console.twilio.com/us1/develop/phone-numbers/manage/verified

---

**Need more help? Check the server logs and Logcat - they'll tell you exactly what's wrong!** 🔍
