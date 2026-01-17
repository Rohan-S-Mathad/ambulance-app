# 📱 Twilio SMS for Ambulance Dispatch

Simple SMS/Call system using Twilio API - **No Firebase required!**

---

## 🚀 Quick Setup (2 Minutes)

### Step 1: Install Dependencies

```bash
cd twilio-sms
npm install
```

### Step 2: Configure Twilio Credentials

1. Go to https://console.twilio.com/
2. Get your credentials:
    - **Account SID**
    - **Auth Token**
    - **Twilio Phone Number**

3. Edit `.env` file:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### Step 3: Test SMS

```bash
# Edit test.js and add your phone number
# Then run:
node test.js
```

You should receive an SMS!

---

## 🔌 API Server

### Start Server

```bash
npm start
```

Server runs on **http://localhost:3000**

---

## 📡 API Endpoints

### 1. Send SMS

```bash
POST http://localhost:3000/sms/send
Content-Type: application/json

{
  "to": "+919876543210",
  "message": "Your emergency alert message"
}
```

### 2. Make Call

```bash
POST http://localhost:3000/call/make
Content-Type: application/json

{
  "to": "+919876543210",
  "message": "Emergency alert. Ambulance dispatched."
}
```

### 3. Ambulance Alerts

#### Alert User (Emergency Created)

```bash
POST http://localhost:3000/ambulance/alert/user
Content-Type: application/json

{
  "phoneNumber": "+919876543210",
  "incidentId": "INC123"
}
```

#### Ambulance Accepted Alert

```bash
POST http://localhost:3000/ambulance/alert/accepted
Content-Type: application/json

{
  "phoneNumber": "+919876543210",
  "ambulanceName": "City Ambulance 001",
  "eta": "10 minutes"
}
```

#### Hospital Confirmed Alert

```bash
POST http://localhost:3000/ambulance/alert/hospital
Content-Type: application/json

{
  "phoneNumber": "+919876543210",
  "hospitalName": "City General Hospital",
  "beds": 5
}
```

---

## 🧪 Test with cURL

### Windows PowerShell

```powershell
# Test SMS
$body = @{
    to = "+919876543210"
    message = "Test SMS"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:3000/sms/send" -Body $body -ContentType "application/json"
```

### Linux/Mac

```bash
curl -X POST http://localhost:3000/sms/send \
  -H "Content-Type: application/json" \
  -d '{"to":"+919876543210","message":"Test SMS"}'
```

---

## 📱 Integration with Android

### Using Retrofit

```kotlin
interface TwilioApiService {
    @POST("sms/send")
    suspend fun sendSMS(@Body request: SMSRequest): Response<SMSResponse>
    
    @POST("ambulance/alert/user")
    suspend fun alertUser(@Body request: AlertRequest): Response<SMSResponse>
}

data class SMSRequest(
    val to: String,
    val message: String
)

data class AlertRequest(
    val phoneNumber: String,
    val incidentId: String
)
```

### Example Usage

```kotlin
// Send SMS when incident created
lifecycleScope.launch {
    try {
        val response = twilioApi.alertUser(
            AlertRequest(
                phoneNumber = "+919876543210",
                incidentId = incidentId
            )
        )
        
        if (response.isSuccessful) {
            Log.d(TAG, "SMS sent successfully")
        }
    } catch (e: Exception) {
        Log.e(TAG, "Failed to send SMS", e)
    }
}
```

---

## 💰 Twilio Pricing

### SMS

- **India**: ₹0.50 - ₹1.00 per SMS
- **USA**: $0.0079 per SMS

### Voice Calls

- **India**: ₹1.00 - ₹2.00 per minute
- **USA**: $0.013 per minute

### Free Trial

- **$15.50 credit** when you sign up
- Can send ~500 SMS in India

---

## 🔐 Security Notes

1. **Never commit `.env`** to Git
2. Keep your Auth Token secret
3. Use environment variables in production
4. Add rate limiting for production use

---

## 📊 Response Format

### Success

```json
{
  "success": true,
  "sid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "status": "queued",
  "to": "+919876543210",
  "from": "+1234567890",
  "dateCreated": "2024-12-08T10:00:00Z"
}
```

### Error

```json
{
  "success": false,
  "error": "Unable to create record: The 'To' number is not a valid phone number.",
  "code": 21211
}
```

---

## 🎯 Use Cases

### 1. Emergency Alert

```javascript
await sendSMS(userPhone, "Emergency request received! Help is on the way.");
```

### 2. Ambulance Accepted

```javascript
await sendSMS(userPhone, "Ambulance #101 accepted. ETA: 10 minutes.");
```

### 3. Hospital Ready

```javascript
await sendSMS(userPhone, "City Hospital is ready. Emergency room prepared.");
```

### 4. Bulk Notification

```javascript
await sendBulkSMS(
  ["+919876543210", "+918765432109"],
  "System maintenance scheduled for tonight."
);
```

---

## 🐛 Troubleshooting

### Error: "Account not authorized"

- Verify Account SID and Auth Token
- Check if trial account restrictions apply

### Error: "Invalid phone number"

- Use E.164 format: `+[country code][number]`
- Example: `+919876543210` (India)

### Error: "Cannot send to this number"

- Trial accounts can only send to verified numbers
- Upgrade to paid account or verify the recipient

---

## 📚 Files

- `smsService.js` - Twilio integration logic
- `index.js` - Express API server
- `test.js` - Test script
- `.env` - Configuration (add your credentials here)
- `package.json` - Dependencies

---

## ✅ Advantages Over Firebase

✅ **No Blaze Plan Required**  
✅ **No Deployment Needed**  
✅ **Simple REST API**  
✅ **Works Anywhere**  
✅ **Direct Control**  
✅ **Easy to Debug**

---

## 🚀 Next Steps

1. **Test Locally** - Run test.js with your phone
2. **Start Server** - Run npm start
3. **Integrate with App** - Use API endpoints
4. **Deploy** - Deploy to Heroku/Vercel/AWS when ready

---

**Ready to use! 🎉**
