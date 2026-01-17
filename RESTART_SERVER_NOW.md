# ⚠️ RESTART SERVER NOW - URGENT!

## 🔴 THE PROBLEM

Your server is **still running with OLD ambulance numbers!**

The `.env` file was updated, but **servers only read `.env` at startup**.

Your running server still has the OLD number in memory:

- ❌ `AMBULANCE_2_PHONE=+919740417391` (old, unverified)

---

## ✅ THE SOLUTION: RESTART THE SERVER!

### **Step 1: Stop the Current Server**

In the terminal where `node server.js` is running:

```bash
Press: Ctrl + C
```

You should see the server stop.

### **Step 2: Restart the Server**

```bash
cd twilio-serverless
node server.js
```

### **Step 3: Verify New Numbers Loaded**

When the server starts, you should see:

```
📱 Configured contacts:
  Twilio Number: +18585332666
  Ambulance 1: +919482936725  ← Should be verified number!
  Ambulance 2: +919482936725  ← Should be verified number!
  Hospital 1: +919482936725
```

**If you see** `+919740417391` **anywhere, the .env file wasn't saved correctly!**

---

## 🧪 TEST AFTER RESTART

After restarting, run this test:

```powershell
$body = @{patientPhone="+919482936725";patientName="RESTART TEST";latitude=12.9236;longitude=77.4985;address="Test";incidentId="RESTART-TEST"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://172.17.13.32:3000/emergency-alert" -Method Post -Body $body -ContentType "application/json"
```

**Expected Result:**

```
✅ Success: 2 (Both Ambulance 1 AND Ambulance 2!)
❌ Failed: 0
```

---

## 📋 QUICK CHECKLIST

- [ ] Stop server (Ctrl+C)
- [ ] Restart server (`node server.js`)
- [ ] Check startup message shows `+919482936725` for both ambulances
- [ ] Run test call
- [ ] See 2 successful calls

---

## ⚡ DO IT NOW!

**In your server terminal:**

```bash
# 1. Press Ctrl+C to stop
^C

# 2. Restart
cd twilio-serverless
node server.js

# 3. Look for these lines:
  Ambulance 1: +919482936725
  Ambulance 2: +919482936725
```

**Then test again!** 📞✅