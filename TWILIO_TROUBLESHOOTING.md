# 🔧 Twilio Emergency Calls - Troubleshooting

## 🔴 **Problem: No calls being made when pressing EMERGENCY button**

---

## ✅ **Solution Checklist:**

### **1. Get Correct Twilio Credentials**

#### **Go to:** [https://console.twilio.com/](https://console.twilio.com/)

You need **3 things**:

1. **Account SID** - Starts with `AC` (NOT `SK`)
    - Found on: Dashboard → Account Info
    - Example: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

2. **Auth Token** - Click "Show" to reveal
    - Found on: Dashboard → Account Info → Auth Token
    - Example: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

3. **Phone Number** - Your purchased Twilio number
    - Found on: Phone Numbers → Manage → Active numbers
    - Format: `+12345678900` (NO SPACES)

---

### **2. Update .env File**

Open `twilio-sms/.env` and update with YOUR credentials:

```env
# Get these from Twilio Console
TWILIO_ACCOUNT_SID=*******************************  # ← Starts with AC
TWILIO_AUTH_TOKEN=your_32_character_auth_token_here
TWILIO_PHONE_NUMBER=+YOUR_TWILIO_PHONE_NUMBER                       # ← NO spaces

# Phone numbers to call (must be verified if trial account)
AMBULANCE_1_PHONE=+YOUR_AMBULANCE_PHONE_NUMBER
AMBULANCE_2_PHONE=+YOUR_AMBULANCE_PHONE_NUMBER
HOSPITAL_1_PHONE=+YOUR_HOSPITAL_PHONE_NUMBER
```

---

### **3. Verify Phone Numbers (If Using Trial Account)**

Twilio **trial accounts** can ONLY call **verified numbers**.

#### **To verify a number:**

1. Go
   to: [https://console.twilio.com/us1/develop/phone-numbers/manage/verified](https://console.twilio.com/us1/develop/phone-numbers/manage/verified)
2. Click **"+ Add a new number"**
3. Enter the phone number (e.g., `+YOUR_AMBULANCE_PHONE_NUMBER`)
4. Verify with SMS code
5. Repeat for all ambulance/hospital numbers

---

### **4. Install Dependencies**

```powershell
cd twilio-sms
npm install
```

---

### **5. Start the Server**

```powershell
npm start
```

You should see:

```
╔════════════════════════════════════════════════╗
║   🚑 EMERGENCY CALL SERVICE RUNNING           ║
║                                                ║
║   Server: http://localhost:3000                ║
╚════════════════════════════════════════════════╝
```

**Leave this terminal window open!**

---

### **6. Update Android App**

Your Android app needs to call the server. For now, let's test if the server works first.

---

## 🧪 **Test the Server (Before Android)**

### **Option A: Test with cURL (Recommended)**

Open a **new terminal** and run:

```powershell
curl -X POST http://localhost:3000/emergency/trigger -H "Content-Type: application/json" -d '{\"patientPhone\":\"+YOUR_TEST_PHONE_NUMBER\",\"patientName\":\"Test Patient\",\"latitude\":12.9716,\"longitude\":77.5946,\"address\":\"Test Location\"}'
```

### **Option B: Test with Postman**

1. Open Postman
2. Create **POST** request to: `http://localhost:3000/emergency/trigger`
3. Set Headers: `Content-Type: application/json`
4. Set Body (raw JSON):

```json
{
  "patientPhone": "+YOUR_TEST_PHONE_NUMBER",
  "patientName": "Test Patient",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "address": "Test Location"
}
```

5. Click **Send**

### **Expected Result:**

- Your configured phones should ring!
- Voice message plays
- Press 1 to accept, 2 to decline

---

## 🔍 **Common Errors:**

### **Error 1: "Authentication Error"**

```
Error: 20003 - Authenticate
```

**Cause:** Wrong Account SID or Auth Token

**Fix:**

- Make sure Account SID starts with `AC` (not `SK`)
- Copy Auth Token correctly from Twilio Console
- No extra spaces in `.env` file

---

### **Error 2: "Phone number not verified"**

```
Error: 21608 - Unverified Phone Number
```

**Cause:** Trial account can only call verified numbers

**Fix:**

- Verify all phone numbers at: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
- OR upgrade to paid account (add $20 credit)

---

### **Error 3: "Invalid From Number"**

```
Error: 21606 - Invalid From Phone Number
```

**Cause:** Wrong Twilio phone number format

**Fix:**

- Remove spaces: `+YOUR_TWILIO_PHONE_NUMBER` → `+YOUR_TWILIO_PHONE_NUMBER`
- Must start with `+` and country code
- Must be a number you own in Twilio

---

### **Error 4: "Connection refused"**

```
Error: connect ECONNREFUSED
```

**Cause:** Server not running

**Fix:**

```powershell
cd twilio-sms
npm start
```

---

### **Error 5: Android app shows network error**

**Causes:**

1. Server not running
2. Wrong BASE_URL in Android
3. Phone and computer on different networks

**Fix:**

- Make sure server is running
- If testing on real phone, use your computer's IP:
  ```kotlin
  private const val BASE_URL = "http://192.168.1.10:3000/"  // Your computer's IP
  ```
- Or use ngrok:
  ```powershell
  ngrok http 3000
  ```
  Then use ngrok URL in Android: `https://abc123.ngrok.io/`

---

## 📋 **Quick Checklist:**

- [ ] Account SID starts with `AC`
- [ ] Auth Token is correct
- [ ] Phone number format: `+1234567890` (no spaces)
- [ ] All numbers verified (if trial account)
- [ ] Dependencies installed (`npm install`)
- [ ] Server running (`npm start`)
- [ ] Server shows "RUNNING" message
- [ ] Test with curl/Postman first
- [ ] Phone rings when testing

---

## 💰 **Trial Account Limits:**

Twilio **trial accounts** have restrictions:

- ✅ FREE: 1 phone number
- ✅ FREE: $15.50 credit
- ❌ Can only call **verified numbers**
- ❌ Plays "trial account" message before your message

### **To Remove Restrictions:**

1. Go to: https://console.twilio.com/us1/billing
2. Add credit (minimum $20)
3. Account automatically upgraded
4. No more verification required
5. No "trial" message

---

## 🎯 **Step-by-Step Testing:**

### **Step 1: Verify Credentials**

Run this test:

```powershell
cd twilio-sms
node -e "const twilio = require('twilio'); const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN); console.log('Credentials OK');"
```

Should show: `Credentials OK`

### **Step 2: Start Server**

```powershell
npm start
```

Should show server running message.

### **Step 3: Test Endpoint**

```powershell
curl http://localhost:3000/health
```

Should show: `{"status":"ok"}`

### **Step 4: Test Emergency Call**

Use the curl command from above. Your phone should ring!

### **Step 5: Test from Android**

Only after above tests pass, try from Android app.

---

## 🆘 **Still Not Working?**

### **Check Server Logs:**

When you press emergency button, check the terminal where server is running. You should see:

```
📞 Making emergency call to +YOUR_AMBULANCE_PHONE_NUMBER
✅ Call initiated: CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

If you see errors in logs, share them for help.

### **Check Android Logs:**

In Android Studio → Logcat, filter by "Emergency" or "Twilio". Share any errors you see.

---

## 📞 **Test Server is Working:**

Run this from command line (server must be running):

```powershell
curl -X POST http://localhost:3000/call/make -H "Content-Type: application/json" -d '{\"to\":\"+YOUR_AMBULANCE_PHONE_NUMBER\",\"message\":\"This is a test call from Twilio\"}'
```

If this works, your setup is correct!

---

**Once server works with curl, then integrate with Android app!**
