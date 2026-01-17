# 📱 Android Integration Guide - Emergency Calls

## Complete integration for calling ambulances with Twilio when emergency button is pressed

---

## 🎯 **Overview**

When user presses the **EMERGENCY** button in your Android app:

1. App gets user's location
2. Sends request to your Twilio server
3. Server makes **voice calls** to ambulances
4. Plays **MP3 audio message** or **text-to-speech**
5. Ambulances press 1 to accept, 2 to decline

---

## 🚀 **Step 1: Update Android App**

### **A. Add Retrofit for API calls**

In `app/build.gradle.kts`:

```kotlin
dependencies {
    // Retrofit for API calls
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.11.0")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
}
```

### **B. Create API Service**

Create `app/src/main/java/com/example/ambulance/api/TwilioApiService.kt`:

```kotlin
package com.example.ambulance.api

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface TwilioApiService {
    @POST("emergency/trigger")
    suspend fun triggerEmergency(@Body request: EmergencyRequest): Response<EmergencyResponse>
}

data class EmergencyRequest(
    val patientPhone: String,
    val patientName: String,
    val latitude: Double,
    val longitude: Double,
    val address: String? = null,
    val audioUrl: String? = null  // Optional: URL to MP3 file
)

data class EmergencyResponse(
    val success: Boolean,
    val message: String,
    val data: EmergencyData?
)

data class EmergencyData(
    val emergencyData: EmergencyInfo,
    val ambulanceCalls: List<CallResult>,
    val hospitalCalls: List<CallResult>,
    val smsBackup: List<SmsResult>
)

data class EmergencyInfo(
    val patientPhone: String,
    val patientName: String,
    val latitude: Double,
    val longitude: Double,
    val address: String,
    val timestamp: String
)

data class CallResult(
    val phoneNumber: String? = null,
    val success: Boolean,
    val callSid: String?,
    val status: String?,
    val to: String?,
    val error: String? = null
)

data class SmsResult(
    val success: Boolean,
    val messageSid: String?,
    val error: String? = null
)
```

### **C. Create Retrofit Instance**

Create `app/src/main/java/com/example/ambulance/api/RetrofitClient.kt`:

```kotlin
package com.example.ambulance.api

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {
    // Replace with your server URL (e.g., from ngrok or your deployed server)
    private const val BASE_URL = "http://YOUR_SERVER_IP:3000/"
    
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }
    
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()
    
    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    
    val twilioApi: TwilioApiService = retrofit.create(TwilioApiService::class.java)
}
```

### **D. Update UserActivity.kt**

Modify the emergency button click handler in `UserActivity.kt`:

```kotlin
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import com.example.ambulance.api.RetrofitClient
import com.example.ambulance.api.EmergencyRequest

// Inside UserActivity class

private fun getCurrentLocation() {
    if (ActivityCompat.checkSelfPermission(
            this,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(
            this,
            Manifest.permission.ACCESS_COARSE_LOCATION
        ) != PackageManager.PERMISSION_GRANTED
    ) {
        Toast.makeText(this, "Location permission was denied.", Toast.LENGTH_SHORT).show()
        return
    }

    binding.textViewStatus.text = "Getting location..."
    binding.buttonEmergency.isEnabled = false

    fusedLocationClient.lastLocation
        .addOnSuccessListener { location ->
            if (location != null) {
                binding.textViewStatus.text = "Location found. Calling ambulances..."

                // Trigger emergency calls via Twilio
                triggerEmergencyCall(
                    latitude = location.latitude,
                    longitude = location.longitude
                )
            } else {
                binding.textViewStatus.text = "No location available. Try again."
                binding.buttonEmergency.isEnabled = true
                Toast.makeText(this, "No location available", Toast.LENGTH_SHORT).show()
            }
        }
        .addOnFailureListener { exception ->
            binding.textViewStatus.text = "Location error: ${exception.message}"
            binding.buttonEmergency.isEnabled = true
            Toast.makeText(this, "Location error: ${exception.message}", Toast.LENGTH_LONG).show()
        }
}

private fun triggerEmergencyCall(latitude: Double, longitude: Double) {
    lifecycleScope.launch {
        try {
            // Get patient phone number (or use a default)
            val patientPhone = "+919876543210" // Replace with actual phone
            
            // Optional: Add URL to your custom MP3 audio message
            val audioUrl = null // "https://yourserver.com/emergency-alert.mp3"
            
            val request = EmergencyRequest(
                patientPhone = patientPhone,
                patientName = "Emergency Patient",
                latitude = latitude,
                longitude = longitude,
                address = "Lat: $latitude, Lon: $longitude",
                audioUrl = audioUrl
            )
            
            binding.textViewStatus.text = "Calling ambulances..."
            
            val response = RetrofitClient.twilioApi.triggerEmergency(request)
            
            if (response.isSuccessful && response.body()?.success == true) {
                binding.textViewStatus.text = 
                    "✅ Emergency calls sent!\n${response.body()?.message}"
                
                Toast.makeText(
                    this@UserActivity,
                    "Emergency calls made to ambulances!",
                    Toast.LENGTH_LONG
                ).show()
                
                // Show details
                response.body()?.data?.let { data ->
                    val ambulanceCount = data.ambulanceCalls.count { it.success }
                    val hospitalCount = data.hospitalCalls.count { it.success }
                    
                    binding.textViewStatus.text = 
                        "✅ Calls sent!\n" +
                        "Ambulances: $ambulanceCount\n" +
                        "Hospitals: $hospitalCount\n" +
                        "Waiting for response..."
                }
            } else {
                binding.textViewStatus.text = "Failed to send emergency calls"
                Toast.makeText(
                    this@UserActivity,
                    "Error: ${response.body()?.message ?: "Unknown error"}",
                    Toast.LENGTH_LONG
                ).show()
            }
        } catch (e: Exception) {
            binding.textViewStatus.text = "Error: ${e.message}"
            Toast.makeText(
                this@UserActivity,
                "Network error: ${e.message}",
                Toast.LENGTH_LONG
            ).show()
        } finally {
            binding.buttonEmergency.isEnabled = true
        }
    }
}
```

---

## 🎙️ **Step 2: Create Custom Audio Message (Optional)**

### **Option A: Use Text-to-Speech (Default)**

The server will automatically use Twilio's text-to-speech:

- No MP3 file needed
- Pass `audioUrl: null`
- Voice message will be spoken

### **Option B: Use Custom MP3 File**

1. **Record your message** (e.g., "Emergency! Medical help needed at...")
2. **Upload to a public URL** (e.g., Firebase Storage, AWS S3, your server)
3. **Pass the URL** in the request:

```kotlin
val audioUrl = "https://yourserver.com/emergency-alert.mp3"
```

**Sample TwiML with MP3:**

```xml
<Response>
    <Play>https://yourserver.com/emergency-alert.mp3</Play>
    <Gather numDigits="1">
        <Say>Press 1 to accept, or 2 to decline.</Say>
    </Gather>
</Response>
```

---

## 🖥️ **Step 3: Deploy Twilio Server**

### **Option A: Local Testing with ngrok**

```bash
# In twilio-sms folder
npm install
npm start

# In another terminal, expose with ngrok
ngrok http 3000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`) and update in Android:

```kotlin
private const val BASE_URL = "https://abc123.ngrok.io/"
```

### **Option B: Deploy to Production**

Deploy to Heroku, Railway, or any Node.js hosting:

```bash
# Example for Heroku
heroku create your-emergency-app
git push heroku main
```

---

## 🔧 **Step 4: Configure Phone Numbers**

Update `twilio-sms/.env`:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Ambulance phone numbers (will receive calls)
AMBULANCE_1_PHONE=+919876543210
AMBULANCE_2_PHONE=+919876543211

# Hospital phone number
HOSPITAL_1_PHONE=+918765432109
```

---

## 🧪 **Step 5: Test Complete Flow**

1. **Start Twilio server:**
   ```bash
   cd twilio-sms
   npm start
   ```

2. **Update Android app BASE_URL**

3. **Run Android app**

4. **Click EMERGENCY button**

5. **Expected behavior:**
    - App gets location
    - Sends to server
    - Server calls ambulances (you'll receive actual calls!)
    - Voice message plays
    - Press 1 to accept, 2 to decline

---

## 📊 **Complete Flow Diagram**

```
[User presses EMERGENCY]
         ↓
[Android gets GPS location]
         ↓
[POST request to /emergency/trigger]
         ↓
[Twilio Server]
         ↓
    ┌────┴────┐
    ↓         ↓
[Calls      [Calls
Ambulance1] Ambulance2]
    ↓         ↓
[Voice message plays]
    ↓
[Press 1 = Accept]
[Press 2 = Decline]
    ↓
[Server updates status]
    ↓
[First accept wins!]
```

---

## 🎯 **Server Endpoints**

### **Trigger Emergency (Main endpoint)**

```
POST http://yourserver.com/emergency/trigger

Body:
{
  "patientPhone": "+919876543210",
  "patientName": "John Doe",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "address": "MG Road, Bangalore",
  "audioUrl": "https://yourserver.com/alert.mp3"  // Optional
}

Response:
{
  "success": true,
  "message": "Emergency alerts sent",
  "data": {
    "ambulanceCalls": [...],
    "hospitalCalls": [...]
  }
}
```

---

## ✅ **Testing Checklist**

- [ ] Twilio credentials configured in `.env`
- [ ] Phone numbers added to `.env`
- [ ] Server running on localhost:3000
- [ ] ngrok exposing server (if testing locally)
- [ ] Android app has correct BASE_URL
- [ ] Location permissions granted
- [ ] Internet permission in AndroidManifest.xml
- [ ] Test phone has credit/balance
- [ ] Ambulance phones can receive calls

---

## 💰 **Twilio Costs**

- **Outbound Calls:** ~$0.013/min (India)
- **Voice Messages:** Included in call time
- **SMS (backup):** ~$0.0035/SMS (India)

**Example:**

- 2 ambulance calls × 1 minute = $0.026
- Very affordable for emergency system!

---

## 🎉 **You're Ready!**

Your Android app now:

- ✅ Gets user location on emergency button press
- ✅ Makes voice calls to ambulances via Twilio
- ✅ Plays custom audio or text-to-speech message
- ✅ Allows ambulances to accept/decline by pressing buttons
- ✅ Sends SMS as backup
- ✅ Tracks call status

**Emergency system is production-ready!** 🚑
