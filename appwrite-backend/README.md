# 🚑 Ambulance App - Appwrite Backend

Backend server that connects your Android app to Appwrite using API keys.

## 🔧 Setup

### 1. Install Dependencies

```bash
cd appwrite-backend
npm install
```

### 2. Configure Environment

Edit `.env` file and add your **Appwrite API key**:

```env
APPWRITE_API_KEY=your_actual_api_key_here
```

**Where to find your API key:**

1. Go to: https://sgp.cloud.appwrite.io/
2. Open your project: **ambulance**
3. Click **Settings** → **API Keys**
4. Create a new API key with these scopes:
    - `databases.read`
    - `databases.write`
    - `users.read`
    - `users.write`
5. Copy the API key and paste it in `.env`

### 3. Create Database in Appwrite Console

1. Go to **Databases** in Appwrite Console
2. Create a new database: `emergencies_db`
3. Create a collection: `requests`
4. Add these attributes:
    - `patientName` (String, 255)
    - `patientPhone` (String, 50)
    - `latitude` (Float)
    - `longitude` (Float)
    - `address` (String, 500)
    - `status` (String, 50)
    - `createdAt` (String, 100)
    - `updatedAt` (String, 100)
5. Set permissions to allow create/read/update/delete

### 4. Start the Server

```bash
npm start
```

Server will run on: `http://localhost:4000`

---

## 📡 API Endpoints

### Health Check

```bash
GET http://localhost:4000/
```

### Create Emergency

```bash
POST http://localhost:4000/api/emergency
Content-Type: application/json

{
  "patientName": "John Doe",
  "patientPhone": "+919482936725",
  "latitude": 12.9236,
  "longitude": 77.4985,
  "address": "MG Road, Bangalore"
}
```

### Get Emergency

```bash
GET http://localhost:4000/api/emergency/{id}
```

### List Emergencies

```bash
GET http://localhost:4000/api/emergencies?status=pending
```

### Update Emergency

```bash
PUT http://localhost:4000/api/emergency/{id}
Content-Type: application/json

{
  "status": "accepted",
  "ambulanceId": "AMB-001"
}
```

### Delete Emergency

```bash
DELETE http://localhost:4000/api/emergency/{id}
```

---

## 🔗 Connect Android App to Backend

Update your Android app's `RetrofitClient.kt`:

```kotlin
private const val BASE_URL = "http://YOUR_IP:4000/"
```

Replace `YOUR_IP` with your computer's IP address (run `ipconfig` to find it).

---

## 🧪 Test the Backend

```powershell
# Create emergency
Invoke-RestMethod -Uri "http://localhost:4000/api/emergency" -Method Post -Body (@{
    patientName="Test Patient"
    patientPhone="+919482936725"
    latitude=12.9236
    longitude=77.4985
    address="Test Address"
} | ConvertTo-Json) -ContentType "application/json"

# List emergencies
Invoke-RestMethod -Uri "http://localhost:4000/api/emergencies" -Method Get
```

---

## ✅ What This Gives You

- ✅ Secure API key storage (never exposed to client)
- ✅ Server-side Appwrite operations
- ✅ RESTful API for your Android app
- ✅ Full control over data access
- ✅ Easy to extend with more features

---

## 🚀 Next Steps

1. Add your API key to `.env`
2. Create database and collection in Appwrite Console
3. Start the server
4. Update Android app to use this backend
5. Test the connection!
