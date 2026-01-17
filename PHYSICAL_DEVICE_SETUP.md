# 📱 Physical Device Setup - READY!

## ✅ Configuration Complete!

Your app is now configured to work with your physical device!

---

## 🔧 Current Configuration

- **Your Computer's IP:** `172.17.13.32`
- **Server URL:** `http://172.17.13.32:3000/`
- **Server Status:** ✅ Running and accessible
- **App Status:** ✅ Built and ready to install

---

## 🚀 Steps to Test

### 1. Make Sure Phone and Computer are on the SAME WiFi

**IMPORTANT:** Both devices must be connected to the **same WiFi network**!

- Computer WiFi: Check Windows WiFi settings
- Phone WiFi: Check phone WiFi settings
- **They must match!**

### 2. Install the App on Your Phone

In Android Studio:

1. Connect your phone via USB
2. Enable **Developer Mode** on phone (Settings → About Phone → Tap "Build Number" 7 times)
3. Enable **USB Debugging** (Settings → Developer Options → USB Debugging)
4. Click the green **▶ Run** button in Android Studio
5. Select your device from the list

**OR** manually install:

```powershell
adb devices  # Check phone is connected
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### 3. Disable Mobile Data on Phone (Important!)

Make sure your phone uses WiFi, not mobile data:

- Turn OFF mobile data
- Keep WiFi ON
- This ensures the phone talks to the server via WiFi

### 4. Grant Permissions

When you first open the app:

1. Allow **Location** permission
2. Make sure **GPS** is enabled

### 5. Test the Emergency Button!

1. Open the app
2. Select **"User"** role
3. Press the **Emergency** button
4. **Watch the server logs in PowerShell!**

---

## 📊 What You Should See

### On Phone Screen:

```
Getting location...
Location found. Creating incident...
Emergency created! Broadcasted to X nearest ambulances
```

### In Server Logs (PowerShell):

```
📞 Emergency alert received! { 
  patientPhone: '+919482936725',
  patientName: 'Emergency Patient',
  latitude: XX.XXXX,
  longitude: XX.XXXX,
  ...
}
📞 Calling 2 contacts...
  ☎️  Calling Ambulance 1: +919740417391
  ❌ Error: The number +919740417391 is unverified
  ☎️  Calling Hospital 1: +919482936725
  ✅ Call SID: CAxxxxxxxxxxxxxxxxxx
  ✅ SMS SID: SMxxxxxxxxxxxxxxxxxx
```

### Hospital Phone (+919482936725):

- 📞 **Phone rings!** (Emergency alert voice call)
- 📱 **SMS received!** (Emergency alert text message)

---

## 🔍 Troubleshooting

### ❌ Problem: "Connection refused" or "Network error"

**Check:**

1. ✅ Server is running (`http://localhost:3000` in browser)
2. ✅ Phone and computer on **same WiFi**
3. ✅ Mobile data is **OFF** on phone
4. ✅ Windows Firewall allows Node.js connections

**Test server from phone's browser:**

- Open phone's browser
- Go to: `http://172.17.13.32:3000`
- You should see: `{"status":"running","message":"Ambulance Emergency System - Twilio Server"...}`

### ❌ Problem: Firewall blocking connection

**Quick fix:**

1. Search "Windows Defender Firewall"
2. Click "Allow an app through firewall"
3. Find **"Node.js"**
4. Check both **Private** and **Public** boxes
5. Click OK

**OR temporarily disable firewall for testing:**

```powershell
# Turn off firewall (for testing only!)
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False

# Turn it back on after testing
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

### ❌ Problem: "No location available"

**Solutions:**

- Enable GPS/Location on phone
- Go outside or near a window (better GPS signal)
- Grant location permission to the app
- Try pressing the button again

---

## 🧪 Test Server Manually

Test the server from your phone's browser or from PowerShell:

```powershell
$body = @{
    patientPhone = "+919482936725"
    patientName = "Physical Device Test"
    latitude = 12.9716
    longitude = 77.5946
    address = "Test Location"
    incidentId = "PHYSICAL-TEST-001"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://172.17.13.32:3000/emergency-alert" -Body $body -ContentType "application/json"
```

**⚠️ THIS WILL CALL THE PHONES!**

---

## ✅ Pre-Flight Checklist

Before testing:

- [ ] Server is running (PowerShell window open with server logs)
- [ ] Phone connected to **same WiFi** as computer
- [ ] Mobile data **OFF** on phone
- [ ] WiFi **ON** on phone
- [ ] App installed on phone (latest build)
- [ ] Location permission granted
- [ ] GPS enabled
- [ ] Windows Firewall allows Node.js
- [ ] Can access `http://172.17.13.32:3000` from phone's browser

---

## 🎯 Success Flow

```
1. User presses Emergency button on phone
   ↓
2. App gets GPS location
   ↓
3. App saves incident to Firestore
   ↓
4. App calls: http://172.17.13.32:3000/emergency-alert
   ↓
5. Server receives request (you see logs!)
   ↓
6. Server calls Twilio API
   ↓
7. Twilio makes voice calls + SMS
   ↓
8. Hospital phone (+919482936725) RINGS! 📞
```

---

## 📝 Important Notes

### Server Must Stay Running

Keep the PowerShell window with the server **open and visible** while testing!

### Same WiFi Network

This is critical! If your phone uses mobile data or a different WiFi, it won't reach the server.

### Ambulance Numbers Need Verification

Only the hospital number (+919482936725) will receive calls until you verify the ambulance numbers
in Twilio Console.

**Verify at:** https://console.twilio.com/us1/develop/phone-numbers/manage/verified

---

## 🔄 Quick Commands

### Check if server is running:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/"
```

### Start server if stopped:

```powershell
cd "C:\Users\ROHAN MATHAD\AndroidStudioProjects\ambulance\twilio-serverless"
npm start
```

### Check phone connection:

```powershell
adb devices
```

### Install app:

```powershell
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### View server logs:

```powershell
Get-Job | Receive-Job -Keep
```

---

## 🎉 Ready to Test!

**Everything is configured!** Just:

1. ✅ Connect phone to same WiFi
2. ✅ Turn off mobile data
3. ✅ Install app (press Run in Android Studio)
4. ✅ Press Emergency button
5. ✅ Watch server logs
6. ✅ Hospital phone will ring! 📞

---

**If you see the emergency alert in server logs when you press the button, IT'S WORKING!** 🚑
