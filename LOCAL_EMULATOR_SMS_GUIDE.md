# 🚀 Local Firebase Emulator Guide - SMS/Call Trigger

## Test External API Calls Without Deploying!

---

## ✅ **What You'll Achieve**

- ✅ Run Firebase Functions **100% locally** on your machine
- ✅ Make external API calls (Twilio, Fast2SMS, etc.) from local emulator
- ✅ Test SMS/Call triggers without upgrading to Blaze plan
- ✅ See real-time logs and debug easily
- ✅ No deployment, no cloud costs, no billing issues!

---

## 📦 **Step 1: Install Dependencies (2 minutes)**

Open terminal in your project root:

```bash
# Navigate to project root
cd C:\Users\ROHAN MATHAD\AndroidStudioProjects\ambulance

# Navigate to functions folder
cd functions

# Install all dependencies (including axios for external API calls)
npm install

# Go back to root
cd ..
```

This installs:

- `axios` - for making HTTP requests to external APIs
- `firebase-admin` - Firebase SDK
- `firebase-functions` - Cloud Functions SDK
- `express` - REST API framework
- `cors` - Cross-origin support

---

## 🔧 **Step 2: Start Firebase Emulators (1 minute)**

```bash
# Start emulators (Functions + Firestore)
firebase emulators:start
```

**What you'll see:**

```
┌─────────────────────────────────────────────────────────────┐
│ ✔  All emulators ready! It is now safe to connect your app. │
│ i  View Emulator UI at http://localhost:4000                │
└─────────────────────────────────────────────────────────────┘

┌────────────┬────────────────┬─────────────────────────────────┐
│ Emulator   │ Host:Port      │ View in Emulator UI             │
├────────────┼────────────────┼─────────────────────────────────┤
│ Functions  │ localhost:5001 │ http://localhost:4000/functions │
│ Firestore  │ localhost:8080 │ http://localhost:4000/firestore │
└────────────┴────────────────┴─────────────────────────────────┘

  Emulator Hub running at localhost:4400
  Other reserved ports: 4500

Issues? Report them at https://github.com/firebase/firebase-tools/issues
```

**🎉 Your emulators are running!**

---

## 🧪 **Step 3: Test the SMS Trigger**

### **Method 1: Using Firestore Emulator UI (Easiest)**

1. **Open Emulator UI**
    - Go to http://localhost:4000 in your browser

2. **Navigate to Firestore**
    - Click "Firestore" in the sidebar

3. **Create sms_queue Collection**
    - Click "Start collection"
    - Collection ID: `sms_queue`
    - Click "Next"

4. **Add Test Document**
    - Document ID: (auto-generate or type `test_sms_001`)
    - Add fields:

   | Field Name | Type | Value |
      |------------|------|-------|
   | phoneNumber | string | +91-9876543210 |
   | message | string | Emergency alert! Ambulance dispatched to your location. |
   | provider | string | mock |
   | createdAt | timestamp | (click "Add current time") |

5. **Click "Save"**

6. **Watch Your Terminal!**

You'll see:

```
============================================================
🔥 SMS TRIGGER FIRED!
   Document ID: test_sms_001
   Phone Number: +91-9876543210
   Message: Emergency alert! Ambulance dispatched to your location.
============================================================

📱 MOCK SMS SEND:
   To: +91-9876543210
   Message: Emergency alert! Ambulance dispatched to your location.
   Payload: {
  "to": "+91-9876543210",
  "message": "Emergency alert! Ambulance dispatched to your location.",
  "timestamp": "2024-12-08T10:45:30.000Z",
  "service": "mock-sms-service"
}

✅ MOCK SMS Response: 200 OK

✅ SMS SENT SUCCESSFULLY!
   Result: {
  "success": true,
  "provider": "mock",
  "result": {
    "success": true,
    "mockResponse": {...},
    "sentTo": "+91-9876543210",
    "message": "Emergency alert! Ambulance dispatched to your location."
  }
}
```

7. **Check Document Status**
    - Refresh Firestore UI
    - The document now has new fields:
        - `status`: "sent"
        - `sentAt`: (timestamp)
        - `processedAt`: (timestamp)
        - `result`: (full response)

---

### **Method 2: Using Firebase SDK (From Your App)**

In your Android app (or any Firebase client):

```kotlin
// Add document to sms_queue
val smsData = hashMapOf(
    "phoneNumber" to "+91-9876543210",
    "message" to "Emergency alert! Ambulance dispatched.",
    "provider" to "mock",
    "createdAt" to FieldValue.serverTimestamp()
)

db.collection("sms_queue")
    .add(smsData)
    .addOnSuccessListener { documentReference ->
        Log.d(TAG, "SMS queued with ID: ${documentReference.id}")
        // Trigger will fire automatically!
    }
```

---

### **Method 3: Using REST API (cURL)**

If you want to add via HTTP:

```bash
# This won't work directly with emulator, but you can create an API endpoint
# Or use Firebase Admin SDK from a Node script

# Create test_trigger.js in functions folder:
```

Create `functions/test_trigger.js`:

```javascript
const admin = require('firebase-admin');

// Initialize with emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
admin.initializeApp({ projectId: 'demo-project' });

const db = admin.firestore();

async function triggerSMS() {
  const smsData = {
    phoneNumber: '+91-9876543210',
    message: 'Test SMS from script',
    provider: 'mock',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };

  const docRef = await db.collection('sms_queue').add(smsData);
  console.log('✅ Document added:', docRef.id);
  console.log('🔥 Trigger should fire now! Check emulator logs.');
}

triggerSMS().then(() => process.exit(0));
```

Run it:

```bash
cd functions
node test_trigger.js
```

---

## 🔌 **Step 4: Test with Real APIs**

### **Using Twilio**

1. Get Twilio credentials from https://twilio.com/console
2. Set environment variables:

```bash
# Windows PowerShell
$env:TWILIO_ACCOUNT_SID="your_account_sid"
$env:TWILIO_AUTH_TOKEN="your_auth_token"
$env:TWILIO_FROM_NUMBER="+1234567890"
```

3. Add document with provider = "twilio":

```json
{
  "phoneNumber": "+919876543210",
  "message": "Real SMS via Twilio!",
  "provider": "twilio"
}
```

4. **SMS will be sent for real!** (charges apply)

---

### **Using Fast2SMS (India)**

1. Get API key from https://fast2sms.com/
2. Set environment variable:

```bash
$env:FAST2SMS_API_KEY="your_api_key"
```

3. Add document with provider = "fast2sms":

```json
{
  "phoneNumber": "9876543210",
  "message": "Real SMS via Fast2SMS!",
  "provider": "fast2sms"
}
```

---

## 📊 **Document Status Flow**

```
Created (pending)
   ↓
Processing (trigger fired)
   ↓
   ├─ Success → status: "sent", result: {...}
   └─ Failure → status: "failed", error: "..."
```

**Fields Added Automatically:**

- `status`: "sent" | "failed" | "error"
- `sentAt`: timestamp (when sent)
- `processedAt`: timestamp (when processed)
- `result`: full API response
- `error`: error message (if failed)

---

## 🐛 **Troubleshooting**

### **Issue: Trigger not firing**

**Check:**

1. Emulators are running: `firebase emulators:start`
2. Functions emulator is active (check http://localhost:4000/functions)
3. Document is in correct collection: `sms_queue`
4. Check terminal logs for errors

### **Issue: "Cannot find module 'axios'"**

```bash
cd functions
npm install axios
cd ..
firebase emulators:start
```

### **Issue: "FIRESTORE_EMULATOR_HOST not set"**

The emulator automatically sets this. But if needed:

```bash
$env:FIRESTORE_EMULATOR_HOST="localhost:8080"
```

### **Issue: External API call fails**

**For Twilio/Fast2SMS:**

- Check API credentials are correct
- Ensure environment variables are set
- Check your internet connection

**For Mock API:**

- Should always work (uses httpbin.org)
- If httpbin is down, change URL to another test API

---

## 🎯 **Testing Different Scenarios**

### **Test 1: Valid SMS**

```json
{
  "phoneNumber": "+91-9876543210",
  "message": "Test message",
  "provider": "mock"
}
```

**Expected:** Status = "sent", document updated with result

---

### **Test 2: Missing Phone Number**

```json
{
  "message": "Test message",
  "provider": "mock"
}
```

**Expected:** Status = "error", error = "Missing phoneNumber or message"

---

### **Test 3: Invalid Provider**

```json
{
  "phoneNumber": "+91-9876543210",
  "message": "Test message",
  "provider": "unknown"
}
```

**Expected:** Uses "mock" as fallback, status = "sent"

---

### **Test 4: Real API Call**

```json
{
  "phoneNumber": "+919876543210",
  "message": "Real SMS test",
  "provider": "twilio"
}
```

**Expected:** Real SMS sent (if credentials configured)

---

## 📝 **Integration with Your Ambulance App**

### **When to Send SMS:**

#### **1. When Incident Created**

Add to `onIncidentCreated` trigger in `functions/index.js`:

```javascript
exports.onIncidentCreated = functions.firestore
  .document('incidents/{incidentId}')
  .onCreate(async (snap, context) => {
    const incidentData = snap.data();
    const incidentId = context.params.incidentId;
    
    // Queue SMS to user
    await db.collection('sms_queue').add({
      phoneNumber: incidentData.userPhone, // Add this field to incident
      message: `Emergency request received. Help is on the way! Incident ID: ${incidentId}`,
      provider: 'fast2sms',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });
```

#### **2. When Ambulance Accepts**

```javascript
// After ambulance accepts
await db.collection('sms_queue').add({
  phoneNumber: userData.phone,
  message: `Ambulance ${ambulanceData.name} has accepted your request. ETA: 10 minutes.`,
  provider: 'fast2sms',
  createdAt: admin.firestore.FieldValue.serverTimestamp()
});
```

#### **3. When Hospital Confirms**

```javascript
// After hospital accepts
await db.collection('sms_queue').add({
  phoneNumber: userData.phone,
  message: `${hospitalData.name} is ready to receive you. Emergency room prepared.`,
  provider: 'fast2sms',
  createdAt: admin.firestore.FieldValue.serverTimestamp()
});
```

---

## 🚀 **Advantages of This Approach**

✅ **No Cloud Deployment** - Everything runs locally  
✅ **No Billing Issues** - No need for Blaze plan  
✅ **Fast Development** - Instant feedback  
✅ **Easy Debugging** - See logs in terminal  
✅ **Real API Calls** - Actually calls external APIs  
✅ **Production-Ready Code** - Same code works when deployed  
✅ **Safe Testing** - Won't affect production data

---

## 📚 **Next Steps**

1. **Test Locally** - Use this guide to test SMS triggers
2. **Integrate with App** - Add SMS queue writes in your Android app
3. **When Ready** - Deploy to cloud when you solve billing issue:
   ```bash
   firebase deploy --only functions:onSMSQueueCreate
   ```

---

## 🎓 **Key Takeaway**

**You CAN make external API calls from local emulators!**

The Spark plan restriction only applies to **deployed functions in the cloud**. When running locally
with `firebase emulators:start`, your functions run on your own computer and can call any external
API!

---

## 📞 **Summary Commands**

```bash
# Setup
cd functions
npm install
cd ..

# Start emulators
firebase emulators:start

# Open UI
# Go to http://localhost:4000

# Add document to sms_queue collection
# Watch terminal for logs!

# Stop emulators
# Press Ctrl+C
```

---

**Happy Local Testing! 🎉**
