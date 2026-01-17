# 📋 JSON Configuration Guide

## Overview

Your Smart Ambulance Dispatch app now uses **JSON configuration files** to manage ambulances and
hospitals! This makes it easy to add, edit, or remove units without touching the code.

---

## 📁 **Configuration Files**

### **Location:**

```
app/src/main/assets/
├── ambulances.json    (5 ambulances configured)
└── hospitals.json     (5 hospitals configured)
```

---

## 🚑 **Adding/Editing Ambulances**

### **File:** `app/src/main/assets/ambulances.json`

### **Format:**

```json
{
  "ambId": "ambulance_001",
  "name": "City Ambulance 1",
  "driver": "John Smith",
  "vehicleNumber": "EMR-1234",
  "lat": 12.9700,
  "lon": 77.5900,
  "status": "available",
  "phoneNumber": "+91-78922 80875",
  "vehicleType": "Advanced Life Support"
}
```

### **Field Descriptions:**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `ambId` | String | Unique ID for ambulance | `"ambulance_001"` |
| `name` | String | Ambulance name/identifier | `"City Ambulance 1"` |
| `driver` | String | Driver's name | `"John Smith"` |
| `vehicleNumber` | String | Vehicle registration number | `"EMR-1234"` |
| `lat` | Number | Latitude coordinate | `12.9700` |
| `lon` | Number | Longitude coordinate | `77.5900` |
| `status` | String | Availability status | `"available"` or `"busy"` |
| `phoneNumber` | String | Contact number | `"+91-9876543210"` |
| `vehicleType` | String | Type of ambulance | `"Advanced Life Support"` |

### **Vehicle Types:**

- `"Advanced Life Support"` - Full medical equipment
- `"Basic Life Support"` - Standard ambulance
- `"Neonatal"` - For newborns
- `"Air Ambulance"` - Helicopter/plane
- `"Patient Transport"` - Non-emergency

---

## 🏥 **Adding/Editing Hospitals**

### **File:** `app/src/main/assets/hospitals.json`

### **Format:**

```json
{
  "hospId": "hospital_001",
  "name": "City General Hospital",
  "address": "123 Main Street, City Center",
  "lat": 12.9750,
  "lon": 77.5950,
  "status": "available",
  "phoneNumber": "+91-78922 80875",
  "emergencyNumber": "108",
  "totalBeds": 200,
  "availableBeds": 45,
  "specialties": ["Emergency", "Trauma", "Cardiology"],
  "hasICU": true,
  "hasEmergencyRoom": true
}
```

### **Field Descriptions:**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `hospId` | String | Unique ID for hospital | `"hospital_001"` |
| `name` | String | Hospital name | `"City General Hospital"` |
| `address` | String | Full address | `"123 Main Street"` |
| `lat` | Number | Latitude coordinate | `12.9750` |
| `lon` | Number | Longitude coordinate | `77.5950` |
| `status` | String | Availability status | `"available"` or `"full"` |
| `phoneNumber` | String | Main phone number | `"+91-080-12345678"` |
| `emergencyNumber` | String | Emergency hotline | `"108"` |
| `totalBeds` | Number | Total bed capacity | `200` |
| `availableBeds` | Number | Currently available beds | `45` |
| `specialties` | Array | Medical specialties | `["Emergency", "Trauma"]` |
| `hasICU` | Boolean | Has ICU facility | `true` or `false` |
| `hasEmergencyRoom` | Boolean | Has ER facility | `true` or `false` |

### **Common Specialties:**

- `"Emergency"`
- `"Trauma"`
- `"Cardiology"`
- `"Neurology"`
- `"Pediatrics"`
- `"Orthopedics"`
- `"General Surgery"`
- `"Critical Care"`
- `"Burns"`
- `"Intensive Care"`

---

## ➕ **How to Add New Ambulance**

### **Step 1:** Open `ambulances.json`

### **Step 2:** Add a new entry (copy existing format):

```json
{
  "ambId": "ambulance_006",
  "name": "North District Ambulance 1",
  "driver": "David Martinez",
  "vehicleNumber": "EMR-1111",
  "lat": 13.0100,
  "lon": 77.6300,
  "status": "available",
  "phoneNumber": "+91-9876543215",
  "vehicleType": "Basic Life Support"
}
```

### **Step 3:** Make sure to add a comma after the previous entry!

```json
[
  {
    "ambId": "ambulance_005",
    "name": "North District Ambulance 1",
    "driver": "David Martinez",
    "vehicleNumber": "EMR-1111",
    "lat": 13.0100,
    "lon": 77.6300,
    "status": "available",
    "phoneNumber": "+91-6361219920",
    "vehicleType": "Basic Life Support"
    ...
  },  ← Don't forget this comma!
  {
    "ambId": "ambulance_006",
    ...
  }
]
```

### **Step 4:** Run the app - data loads automatically!

---

## ➕ **How to Add New Hospital**

### **Step 1:** Open `hospitals.json`

### **Step 2:** Add a new entry:

```json
{
  "hospId": "hospital_006",
  "name": "North Zone Emergency Hospital",
  "address": "999 Emergency Lane, North Zone",
  "lat": 13.0200,
  "lon": 77.6400,
  "status": "available",
  "phoneNumber": "+91-9482936725",
  "emergencyNumber": "108",
  "totalBeds": 120,
  "availableBeds": 38,
  "specialties": ["Emergency", "Trauma", "Critical Care"],
  "hasICU": true,
  "hasEmergencyRoom": true
}
```

### **Step 3:** Save and run the app!

---

## 🗺️ **How to Get GPS Coordinates**

### **Method 1: Google Maps**

1. Open Google Maps
2. Right-click on location
3. Click first option (coordinates)
4. Copy: `12.9716, 77.5946`
5. Use in JSON:
   ```json
   "lat": 12.9716,
   "lon": 77.5946
   ```

### **Method 2: Google Maps URL**

1. Share location from Google Maps
2. Look at URL: `@12.9716,77.5946,15z`
3. First number = latitude
4. Second number = longitude

### **Method 3: GPS Apps**

- Use any GPS coordinate app
- Copy decimal degrees format

---

## ⚙️ **How Data Loading Works**

### **Automatic Loading:**

1. App starts (Role Selection screen)
2. Automatically reads JSON files
3. Uploads to Firestore
4. Shows toast: "✅ Loaded 5 ambulances" and "✅ Loaded 5 hospitals"
5. Data is now available for dispatch system

### **Manual Reload:**

- Just restart the app
- Data will sync again

---

## 📝 **Example: Complete ambulances.json**

```json
[
  {
    "ambId": "ambulance_001",
    "name": "City Ambulance 1",
    "driver": "John Smith",
    "vehicleNumber": "EMR-1234",
    "lat": 12.9700,
    "lon": 77.5900,
    "status": "available",
    "phoneNumber": "+91-9876543210",
    "vehicleType": "Advanced Life Support"
  },
  {
    "ambId": "ambulance_002",
    "name": "City Ambulance 2",
    "driver": "Sarah Johnson",
    "vehicleNumber": "EMR-5678",
    "lat": 12.9800,
    "lon": 77.6000,
    "status": "available",
    "phoneNumber": "+91-9876543211",
    "vehicleType": "Basic Life Support"
  }
]
```

---

## ✅ **JSON Validation Tips**

### **Common Mistakes to Avoid:**

1. **Missing Commas:**

```json
// ❌ Wrong
{
  "ambId": "001"
  "name": "Ambulance"
}

// ✅ Correct
{
  "ambId": "001",
  "name": "Ambulance"
}
```

2. **Extra Comma at End:**

```json
// ❌ Wrong
[
  {"ambId": "001"},
  {"ambId": "002"},  ← Remove this comma
]

// ✅ Correct
[
  {"ambId": "001"},
  {"ambId": "002"}
]
```

3. **Missing Quotes:**

```json
// ❌ Wrong
{
  ambId: "001"
}

// ✅ Correct
{
  "ambId": "001"
}
```

4. **Wrong Number Format:**

```json
// ❌ Wrong
{
  "lat": "12.9700"  ← String, not number
}

// ✅ Correct
{
  "lat": 12.9700  ← Number without quotes
}
```

---

## 🔧 **Troubleshooting**

### **Problem: Data not loading**

**Solution:**

1. Check JSON syntax (use JSONLint.com)
2. Verify file is in `app/src/main/assets/`
3. Rebuild project in Android Studio
4. Check Logcat for errors

### **Problem: App crashes on start**

**Solution:**

1. Validate JSON format
2. Check all required fields present
3. Ensure numbers don't have quotes
4. Verify boolean values are lowercase (`true`, not `"true"`)

### **Problem: Ambulances not appearing**

**Solution:**

1. Check `status` is `"available"`
2. Verify coordinates are valid
3. Check Firebase Console for data
4. Restart app to reload

---

## 📊 **Current Configuration**

### **Ambulances:** 5 units configured

- ambulance_001 to ambulance_005
- Locations spread across city
- Mix of ALS, BLS, and Neonatal units

### **Hospitals:** 5 facilities configured

- hospital_001 to hospital_005
- All with emergency rooms
- ICU facilities available
- Total: 850 beds, 254 available

---

## 🎯 **Best Practices**

1. **Use Sequential IDs:** `ambulance_001`, `ambulance_002`, etc.
2. **Keep Status Updated:** Change to `"busy"` when occupied
3. **Accurate Coordinates:** Use precise GPS locations
4. **Update Bed Count:** Keep `availableBeds` current
5. **Phone Numbers:** Include country/area code
6. **Test After Changes:** Always test after editing JSON

---

## 🚀 **Quick Start**

1. **Open:** `app/src/main/assets/ambulances.json`
2. **Edit:** Add your ambulances with real data
3. **Open:** `app/src/main/assets/hospitals.json`
4. **Edit:** Add your hospitals with real data
5. **Save:** Both files
6. **Run:** App automatically loads data
7. **Verify:** Check toast messages
8. **Test:** Create emergency and see nearest units

---

## 📱 **Testing Your Configuration**

1. **Run the app**
2. **Watch for toast:** "Loading ambulances and hospitals..."
3. **Check success:** "✅ Loaded X ambulances" and "✅ Loaded X hospitals"
4. **Open Firebase Console** → Firestore
5. **Verify collections:**
    - `ambulances` collection has your data
    - `hospitals` collection has your data
6. **Test dispatch:**
    - Click User role
    - Press Emergency button
    - Check if nearest units are notified

---

## 💡 **Pro Tips**

- **Backup JSON files** before major changes
- **Use JSON validator** (JSONLint.com) before testing
- **Group ambulances by district** for easy management
- **Keep vehicle types consistent** for reporting
- **Update locations** when ambulances relocate
- **Monitor bed availability** in real-time

---

## ✅ **Summary**

**You can now:**

- ✅ Add ambulances by editing JSON
- ✅ Add hospitals by editing JSON
- ✅ Update locations easily
- ✅ Manage fleet without code changes
- ✅ Scale to hundreds of units
- ✅ Auto-sync with Firestore
- ✅ Quick configuration updates

**No coding required - just edit the JSON files!** 📝🚑🏥
