# 🚀 Twilio Serverless Deployment Guide

## ✅ NEW ARCHITECTURE: No Local Server Needed!

Your emergency call system now uses **Twilio Serverless Functions** - no need to run a local Node.js
server!

### Benefits:

- ✅ **No server maintenance** - Twilio hosts everything
- ✅ **Secure** - API keys never exposed to clients
- ✅ **Always available** - Works from anywhere with internet
- ✅ **Free tier available** - No hosting costs
- ✅ **Scalable** - Handles multiple requests automatically

---

## 📋 Prerequisites

1. **Twilio Account** (you already have this)
2. **Node.js and npm** installed
3. **Twilio CLI** (we'll install this)

---

## 🔧 Step 1: Install Twilio CLI

Open PowerShell and run:

```powershell
npm install -g twilio-cli
```

Verify installation:

```powershell
twilio --version
```

---

## 🔑 Step 2: Login to Twilio

```powershell
twilio login
```

You'll be prompted to enter:

- **Account SID:** YOUR_TWILIO_ACCOUNT_SID
- **Auth Token:** YOUR_TWILIO_AUTH_TOKEN

---

## 📦 Step 3: Install Serverless Plugin

```powershell
twilio plugins:install @twilio-labs/plugin-serverless
```

---

## 🚀 Step 4: Deploy Your Function

Navigate to the serverless directory and deploy:

```powershell
cd twilio-serverless

# Install dependencies
npm install

# Deploy to Twilio
twilio serverless:deploy
```

**Expected output:**

```
Deploying functions & assets to the Twilio Runtime

✔ Serverless project successfully deployed

Deployment Details
Domain: https://ambulance-emergency-system-XXXX-dev.twil.io
Service:
   ambulance-emergency-system (ZSxxxxx)
Environment:
   dev (ZExxxxx)
Functions:
   https://ambulance-emergency-system-XXXX-dev.twil.io/emergency-alert
```

**🎯 IMPORTANT:** Copy the Function URL! You'll need it in the next step.

---

## 📱 Step 5: Update Android App

Open `app/src/main/java/com/example/ambulance/data/RetrofitClient.kt`

Replace this line:

```kotlin
private const val BASE_URL = "https://YOUR-SERVICE-NAME-XXXX.twil.io/"
```

With your actual Twilio Function URL (from Step 4):

```kotlin
private const val BASE_URL = "https://ambulance-emergency-system-XXXX-dev.twil.io/"
```

---

## 🔐 Step 6: Configure Environment Variables

Your phone numbers are already configured in `twilio-serverless/.env`:

```env
TWILIO_PHONE_NUMBER=YOUR_TWILIO_PHONE_NUMBER
AMBULANCE_1_PHONE=YOUR_AMBULANCE_1_PHONE
AMBULANCE_2_PHONE=YOUR_AMBULANCE_2_PHONE
HOSPITAL_1_PHONE=YOUR_HOSPITAL_1_PHONE
```

These are automatically uploaded to Twilio when you deploy!

---

## ✅ Step 7: Test the Deployment

Test directly from PowerShell:

```powershell
$url = " http://localhost:3000/private-message"  # Replace with your URL

$body = @{
    patientPhone = "YOUR_PATIENT_PHONE"
    patientName = "Test Patient"
    latitude = 12.9716
    longitude = 77.5946
    address = "Test Location, Bangalore"
    incidentId = "TEST-001"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri $url -Body $body -ContentType "application/json"
```

**Expected response:**

```json
{
  "success": true,
  "message": "Emergency alerts sent",
  "incidentId": "TEST-001",
  "results": [
    {
      "contact": "Ambulance 1",
      "phone": "YOUR_AMBULANCE_1_PHONE",
      "callSid": "CAxxxx",
      "smsSid": "SMxxxx",
      "status": "success"
    },
    ...
  ]
}
```

**If this works, PHONES WILL RING!** 📞

---

## 🏗️ Step 8: Rebuild Android App

In Android Studio:

1. **Sync Gradle** (File → Sync Project with Gradle Files)
2. **Rebuild** (Build → Rebuild Project)
3. **Run** the app

---

## 🎯 Step 9: Test End-to-End

1. Run the Android app
2. Select "User" role
3. Press Emergency Button
4. Watch for logs in Android Studio Logcat (filter: `TwilioAPI`)

**Success logs:**

```
D/TwilioAPI: ✅ Emergency calls triggered successfully!
D/TwilioAPI:   Ambulance 1: success
D/TwilioAPI:   Ambulance 2: success
D/TwilioAPI:   Hospital 1: success
```

---

## 🔄 How It Works Now

```
┌─────────────────┐
│ User Presses    │
│ Emergency Button│
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Android App             │
│ - Gets location         │
│ - Creates Firestore doc │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Calls Twilio Serverless │◄─── HTTPS Request
│ Function (Cloud)        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Twilio API              │
│ - Makes voice calls     │
│ - Sends SMS backup      │
└─────────────────────────┘
         │
         ▼
📞 PHONES RING!
```

**Key differences from before:**

- ❌ No local `npm start` needed
- ✅ Function runs on Twilio's servers
- ✅ Works from any device with internet
- ✅ API keys secure on Twilio's servers

---

## 🛠️ Managing Your Deployment

### View Deployed Functions

```powershell
twilio serverless:list
```

### View Function Logs (Real-time)

```powershell
twilio serverless:logs --tail
```

### Update Environment Variables

Edit `twilio-serverless/.env` and redeploy:

```powershell
cd twilio-serverless
twilio serverless:deploy
```

### Delete Deployment

```powershell
twilio serverless:remove --service-sid ZSxxxxx  # Get SID from deploy output
```

---

## 🔧 Troubleshooting

### Error: "Twilio CLI not found"

**Solution:** Install Twilio CLI

```powershell
npm install -g twilio-cli
```

### Error: "Not logged in"

**Solution:**

```powershell
twilio login
```

### Error: "Function returns 404"

**Cause:** Wrong URL or function not deployed

**Solution:** Verify function URL:

```powershell
twilio serverless:list
```

### Error: "No phone numbers configured"

**Solution:** Check `.env` file and redeploy:

```powershell
cd twilio-serverless
twilio serverless:deploy
```

### Error: "Calls not going through"

**Possible causes:**

1. **Unverified numbers** (for trial accounts)
2. **Insufficient balance**
3. **Wrong phone number format**

**Solution:**

- Verify numbers: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
- Check balance: https://console.twilio.com
- Use E.164 format: `+919740417391`

---

## 📊 Monitoring Calls

### View Call Logs

https://console.twilio.com/us1/monitor/logs/calls

### View SMS Logs

https://console.twilio.com/us1/monitor/logs/sms

### View Function Logs

```powershell
twilio serverless:logs --tail
```

---

## 💰 Pricing

### Twilio Serverless

- **First 10,000 invocations/month:** FREE
- **After that:** $0.0001 per invocation

### Calls & SMS

- **Voice calls (India):** ~₹1-2 per minute
- **SMS (India):** ~₹0.50-1 per message
- **Trial account:** $15.50 credit

Your emergency system should cost **less than $1/month** for typical usage!

---

## 🔄 Updating Your Code

When you make changes to the function:

1. Edit `twilio-serverless/functions/emergency-alert.js`
2. Deploy changes:
   ```powershell
   cd twilio-serverless
   twilio serverless:deploy
   ```
3. Function automatically updates (same URL)

---

## 📝 Current Configuration

### Phone Numbers (from .env)

- **Twilio Number:** YOUR_TWILIO_PHONE_NUMBER
- **Ambulance 1:** YOUR_AMBULANCE_1_PHONE
- **Ambulance 2:** YOUR_AMBULANCE_2_PHONE
- **Hospital 1:** YOUR_HOSPITAL_1_PHONE

### Twilio Account

- **Account SID:** YOUR_TWILIO_ACCOUNT_SID

---

## ✅ Deployment Checklist

- [ ] Twilio CLI installed
- [ ] Logged into Twilio
- [ ] Serverless plugin installed
- [ ] Function deployed successfully
- [ ] Function URL copied
- [ ] Android app updated with URL
- [ ] App rebuilt
- [ ] Test call successful
- [ ] Phones ring! 📞

---

## 🎉 Success!

Your emergency system is now **fully serverless**:

- ✅ No local server to maintain
- ✅ Works from anywhere
- ✅ Secure and scalable
- ✅ Easy to update
- ✅ Low cost

**Just press that emergency button!** 🚨📞

---

## 📚 Additional Resources

- **Twilio Serverless Docs:** https://www.twilio.com/docs/serverless
- **Twilio Functions Quickstart:
  ** https://www.twilio.com/docs/serverless/functions-assets/quickstart
- **Twilio CLI Docs:** https://www.twilio.com/docs/twilio-cli/quickstart

---

**Questions?** Check the logs or Twilio Console for details!
