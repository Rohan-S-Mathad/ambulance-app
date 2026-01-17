# 📞 TEST CALL BUTTON - MANUAL TESTING GUIDE

## ✅ NEW FEATURE: Manual Call Testing!

I've added a **big green "TEST CALL AMBULANCES" button** that lets you **manually trigger calls** to
test if Twilio is working!

---

## 🎯 What It Does

When you click the **"📞 TEST CALL AMBULANCES"** button:

1. ✅ **Creates test emergency data** automatically
2. ✅ **Calls the Twilio API** (your server at 172.17.13.32:3000)
3. ✅ **Makes real phone calls** to ambulances and hospitals
4. ✅ **Shows detailed results** in a popup dialog
5. ✅ **Checks if server is reachable** with helpful error messages
6. ✅ **No emergency needed** - works anytime!

---

## 🚀 Quick Test (30 Seconds)

### Step 1: Make Sure Server is Running

```bash
# Terminal 1: Start the server
cd twilio-serverless
node server.js

# You should see:
# Server running on http://0.0.0.0:3000
```

### Step 2: Install App

```powershell
# Terminal 2: Install app
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### Step 3: Test Calls!

```
1. Open "Smart Ambulance" app
2. Select "Hospital"
3. Login: HOSP001 / password123
4. You'll see TWO big buttons:
   - 🗺️ View Patient Live Location (pink)
   - 📞 TEST CALL AMBULANCES (green) ← Click this!
5. Click the green "TEST CALL AMBULANCES" button
6. Wait 2-3 seconds...
7. ✅ See popup with results!
8. 🔔 Hospital phone (+919482936725) should RING!
```

---

## 📱 What You'll See

### **On Hospital Dashboard:**

```
┌────────────────────────────────────┐
│   🏥 Hospital Dashboard        [←] │
├────────────────────────────────────┤
│ 🏥 Hospital Information            │
│ Hospital: HOSP001                  │
├────────────────────────────────────┤
│                                    │
│  🗺️ View Patient Live Location    │ ← Pink button
│                                    │
├────────────────────────────────────┤
│                                    │
│  📞 TEST CALL AMBULANCES           │ ← GREEN BUTTON (NEW!)
│          Click to test!            │
│                                    │
├────────────────────────────────────┤
│ Waiting for emergency alerts...    │
└────────────────────────────────────┘
```

### **When You Click TEST CALL:**

**Step 1: Toast Message**

```
📞 Testing Twilio API - Making test calls...
```

**Step 2: Connecting Toast**

```
⏳ Calling server at 172.17.13.32:3000...
```

**Step 3: Results Popup (Success)**

```
╔═══════════════════════════════════╗
║  📞 Test Call Results             ║
╠═══════════════════════════════════╣
║  ✅ TEST SUCCESSFUL!              ║
║                                   ║
║  📞 Calls made: 2                 ║
║  ✅ Success: 1                    ║
║  ❌ Failed: 1                     ║
║                                   ║
║  ✅ Hospital 1: +919482936725     ║
║  ❌ Ambulance 1: +919740417391    ║
║     Error: Phone number is        ║
║     unverified                    ║
║                                   ║
║  🔔 Check if hospital phone is    ║
║     ringing!                      ║
╠═══════════════════════════════════╣
║              [ OK ]               ║
╚═══════════════════════════════════╝
```

**Step 4: Your Phone Rings!**

```
📱 +919482936725 receives:
   - 📞 Voice call (emergency message)
   - 📱 SMS with emergency details
```

---

## ✅ Success Scenarios

### **Scenario 1: All Working!**

**What you see:**

```
✅ TEST SUCCESSFUL!
📞 Calls made: 2
✅ Success: 1
❌ Failed: 1 (unverified number)

✅ Hospital 1: +919482936725
❌ Ambulance 1: +919740417391
   Error: Phone number is unverified

🔔 Check if hospital phone is ringing!
```

**What it means:**

- ✅ Server is reachable
- ✅ Twilio API is working
- ✅ Verified number (+919482936725) will ring
- ⚠️ Unverified number (+919740417391) blocked by Twilio

**Action:** Check if hospital phone (+919482936725) is ringing!

---

### **Scenario 2: All Calls Successful!**

**What you see:**

```
✅ TEST SUCCESSFUL!
📞 Calls made: 2
✅ Success: 2
❌ Failed: 0

✅ Hospital 1: +919482936725
✅ Ambulance 1: +919740417391

🔔 Check if hospital phone is ringing!
```

**What it means:**

- ✅ Both numbers are verified!
- ✅ Both phones will ring!

---

## ❌ Error Scenarios

### **Error 1: Server Not Running**

**What you see:**

```
╔═══════════════════════════════════╗
║  ❌ Connection Failed             ║
╠═══════════════════════════════════╣
║  Cannot reach server!             ║
║                                   ║
║  Checklist:                       ║
║  1. Is server running?            ║
║     → cd twilio-serverless        ║
║     → node server.js              ║
║                                   ║
║  2. Same WiFi network?            ║
║     → Phone: Check WiFi           ║
║     → Computer: 172.17.13.32      ║
║                                   ║
║  3. Turn OFF mobile data!         ║
╚═══════════════════════════════════╝
```

**Solution:**

1. Open terminal
2. `cd twilio-serverless`
3. `node server.js`
4. Try again!

---

### **Error 2: Wrong WiFi Network**

**What you see:**

```
❌ Connection Failed
Cannot reach server!
Error: Connection refused
```

**Solution:**

1. Check phone WiFi settings
2. Make sure phone is on SAME network as computer
3. Turn OFF mobile data
4. Computer IP should be 172.17.13.32
5. Try again!

---

### **Error 3: Twilio Credentials Missing**

**What you see:**

```
❌ API Error: Twilio authentication failed
```

**Solution:**

1. Check `twilio-serverless/.env` file
2. Make sure these are set:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxx
   TWILIO_AUTH_TOKEN=xxxxx
   TWILIO_PHONE_NUMBER=+1234567890
   ```
3. Restart server
4. Try again!

---

## 🔧 Technical Details

### **What the Button Does:**

```kotlin
1. Creates test data:
   - Patient: "TEST PATIENT"
   - Location: RV College (12.9236, 77.4985)
   - Phone: +919482936725 (verified)
   - Incident ID: TEST-<timestamp>

2. Calls Twilio API:
   POST http://172.17.13.32:3000/emergency-alert
   {
     "patientPhone": "+919482936725",
     "patientName": "TEST PATIENT",
     "latitude": 12.9236,
     "longitude": 77.4985,
     "address": "RV College - TEST CALL",
     "incidentId": "TEST-1234567890"
   }

3. Server processes:
   - Calls ambulances from database
   - Calls hospitals from database
   - Returns results

4. App shows results:
   - Success count
   - Failed count
   - Details for each call
   - Error messages if any
```

### **Server Response Format:**

```json
{
  "success": true,
  "message": "Emergency alert sent",
  "results": [
    {
      "contact": "Hospital 1",
      "phone": "+919482936725",
      "callSid": "CAxxxxx",
      "smsSid": "SMxxxxx",
      "status": "success"
    },
    {
      "contact": "Ambulance 1",
      "phone": "+919740417391",
      "status": "error",
      "error": "Phone number is unverified"
    }
  ]
}
```

---

## 🎮 Testing Checklist

Before testing, make sure:

- [ ] Server is running (`node server.js`)
- [ ] Server shows: "Server running on http://0.0.0.0:3000"
- [ ] Phone connected to same WiFi as computer
- [ ] Mobile data is OFF on phone
- [ ] Computer IP is 172.17.13.32
- [ ] App is installed (latest version)
- [ ] Twilio credentials in `.env` file
- [ ] At least one number is verified in Twilio

---

## 📞 Expected Behavior

### **First Test:**

- Hospital phone (+919482936725) should RING
- Ambulance phone (+919740417391) will likely fail (unverified)
- You'll see 1 success, 1 failure
- **This is normal!**

### **To Make Both Work:**

1. Go to Twilio Console: https://console.twilio.com
2. Navigate to: Phone Numbers → Verified Caller IDs
3. Click "Add Verified Number"
4. Verify +919740417391
5. Try test call again
6. Both phones will ring!

---

## 🎯 Quick Commands

### **Start Server:**

```bash
cd twilio-serverless
node server.js
```

### **Install App:**

```powershell
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### **Check Server from Phone Browser:**

```
Open phone browser → http://172.17.13.32:3000
Should see: {"status":"running",...}
```

### **Check Server Logs:**

```bash
# Server terminal will show:
📞 Emergency alert received!
☎️  Calling Hospital 1: +919482936725
✅ Call SID: CAxxxxx
☎️  Calling Ambulance 1: +919740417391
❌ Error: Phone number is unverified
```

---

## 🐛 Troubleshooting

### **Button doesn't appear?**

- Scroll up on hospital dashboard
- It's right below the pink "View Patient" button
- Green color, says "TEST CALL AMBULANCES"

### **Nothing happens when clicked?**

- Check if server is running
- Check server logs for errors
- Try clicking again after 5 seconds

### **"Connection Failed" error?**

- Server not running → Start it
- Wrong WiFi → Connect to same network
- Mobile data ON → Turn it off
- Firewall → Allow port 3000

### **"API Error" message?**

- Check .env file has Twilio credentials
- Restart server after changing .env
- Check Twilio account is active

### **Calls partially sent?**

- This is expected!
- Only verified numbers will ring
- Unverified numbers will fail (Twilio restriction)
- At least hospital number should work

---

## ✅ Success Confirmation

**You know it's working when:**

1. ✅ Button appears (green, below pink button)
2. ✅ Click shows toast: "Testing Twilio API..."
3. ✅ Toast shows: "Calling server at 172.17.13.32:3000..."
4. ✅ Popup appears with results
5. ✅ Popup shows at least 1 success
6. ✅ **Hospital phone RINGS!** 📞
7. ✅ Server logs show call attempts

---

## 🎉 Summary

### **What You Got:**

✅ **Big green TEST CALL button** on hospital dashboard  
✅ **Manual call triggering** - no emergency needed  
✅ **Detailed result popup** with success/failure breakdown  
✅ **Helpful error messages** with troubleshooting steps  
✅ **Connection checking** - tells you if server is down  
✅ **Real phone calls** via Twilio API  
✅ **Works anytime** - just click and test!

### **How to Use:**

1. Start server: `node server.js`
2. Install app
3. Login as Hospital (HOSP001)
4. Click green "TEST CALL AMBULANCES" button
5. Wait for results
6. Check if phone rings!

---

**Install now and test the Twilio API with one click!** 📞✅