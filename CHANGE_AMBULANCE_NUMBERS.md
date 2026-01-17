# 📞 HOW TO CHANGE AMBULANCE PHONE NUMBERS

## 📋 AMBULANCE NUMBERS ARE IN 2 PLACES

You need to update phone numbers in **TWO locations**:

1. **Server configuration** (for making calls)
2. **Android app database** (for finding ambulances)

---

## 📍 LOCATION 1: Server Configuration (.env file)

### **File Path:**

```
twilio-serverless/.env
```

### **Current Numbers:**

```env
AMBULANCE_1_PHONE=+919482936725
AMBULANCE_2_PHONE=+919740417391  ← CHANGE THIS!
```

### **How to Change:**

**Option A: Edit the file directly**

1. Open: `twilio-serverless/.env`
2. Change the numbers
3. Save the file
4. Restart server: `node server.js`

**Option B: Use this command** (I'll do it for you below)

---

## 📍 LOCATION 2: Android App Database

### **File Path:**

```
app/src/main/assets/ambulances.json
```

### **Current Numbers:**

```json
{
  "ambId": "ambulance_001",
  "name": "City Ambulance 1",
  "phoneNumber": "+91-9876543210"  ← CHANGE THESE!
}
```

### **How to Change:**

1. Open: `app/src/main/assets/ambulances.json`
2. Update all `phoneNumber` fields
3. Rebuild app: `.\gradlew assembleDebug`
4. Install: `adb install -r app/build/outputs/apk/debug/app-debug.apk`

---

## 🎯 WHAT NUMBERS TO USE?

### **Recommended:**

Use **VERIFIED** numbers from your Twilio account!

**Good options:**

- ✅ `+919482936725` (already verified, currently works!)
- ✅ Any number you verify in Twilio Console
- ✅ Use the SAME verified number for testing

**Bad options:**

- ❌ `+919740417391` (unverified, calls will fail!)
- ❌ Random numbers (won't work on trial account)

---

## 🚀 QUICK FIX (Use Verified Number for All)

Let me update BOTH files to use the working verified number:

### **Server (.env):**

```env
AMBULANCE_1_PHONE=+919482936725  ← Verified, works!
AMBULANCE_2_PHONE=+919482936725  ← Same number (for testing)
HOSPITAL_1_PHONE=+919482936725   ← Keep this
```

### **App (ambulances.json):**

```json
{
  "phoneNumber": "+919482936725"  ← All ambulances use verified number
}
```

**Result:** All calls will succeed! ✅

---

## 📝 STEP-BY-STEP INSTRUCTIONS

### **Step 1: Update Server Configuration**

```powershell
# Open the .env file in notepad
notepad twilio-serverless/.env

# Change these lines:
AMBULANCE_1_PHONE=+919482936725  # Your verified number
AMBULANCE_2_PHONE=+919482936725  # Same or another verified number

# Save and close
```

### **Step 2: Update App Database**

```powershell
# Open ambulances.json in notepad
notepad app/src/main/assets/ambulances.json

# Change all phoneNumber fields to verified numbers
# Example: "+919482936725"

# Save and close
```

### **Step 3: Restart Server**

```bash
cd twilio-serverless
# Stop server (Ctrl+C if running)
node server.js
```

### **Step 4: Rebuild & Install App**

```powershell
.\gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

---

## ✅ VERIFY IT WORKED

### **Test Server:**

```powershell
# Should now show updated numbers
$body = @{patientPhone="+919482936725";patientName="TEST";latitude=12.9236;longitude=77.4985;address="Test";incidentId="TEST-123"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://172.17.13.32:3000/emergency-alert" -Method Post -Body $body -ContentType "application/json"

# Should see SUCCESS for both ambulances now!
```

### **Test App:**

```
1. Open app → Hospital
2. Click "TEST CALL AMBULANCES"
3. Should show 2 successful calls now! ✅
```

---

## 🎯 RECOMMENDED PHONE NUMBERS

### **For Testing (Trial Account):**

Use **ONE verified number** for everything:

```
AMBULANCE_1_PHONE=+919482936725
AMBULANCE_2_PHONE=+919482936725
HOSPITAL_1_PHONE=+919482936725
```

**All calls will succeed!** ✅

### **For Production (Upgraded Account):**

Use **different numbers** for each:

```
AMBULANCE_1_PHONE=+919740417391
AMBULANCE_2_PHONE=+919876543210
HOSPITAL_1_PHONE=+919482936725
```

**All numbers must be verified first!**

---

## 💡 WANT ME TO UPDATE THEM FOR YOU?

Tell me what numbers you want to use, and I'll update both files!

**Example:**

- Ambulance 1: `+919482936725`
- Ambulance 2: `+919482936725`
- Hospital: `+919482936725`

Or provide your own verified numbers!

---

## 📊 CURRENT STATUS

**Server (.env):**

- Ambulance 1: `+919482936725` ✅ (verified)
- Ambulance 2: `+919740417391` ❌ (unverified)
- Hospital: `+919482936725` ✅ (verified)

**App (ambulances.json):**

- 5 ambulances with dummy numbers (`+91-98765432XX`)
- Need to be updated with real numbers

---

## 🔧 QUICK COMMANDS

```powershell
# Open server config
notepad twilio-serverless/.env

# Open app database
notepad app/src/main/assets/ambulances.json

# Restart server
cd twilio-serverless
node server.js

# Rebuild app
.\gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

---

**Tell me what numbers you want, and I'll update them for you!** 📞✅