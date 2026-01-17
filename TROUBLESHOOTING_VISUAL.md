# 🔍 Visual Troubleshooting Guide

## 📱 Step-by-Step Visual Guide

---

## 🚑 AMBULANCE TEST

### Step 1: Select Ambulance

```
┌────────────────────────┐
│   Smart Ambulance      │
├────────────────────────┤
│                        │
│   [ 🚑 Ambulance ]    │ ← CLICK THIS
│   [ 🏥 Hospital  ]    │
│   [ 👤 User      ]    │
│                        │
└────────────────────────┘
```

### Step 2: Login Screen

```
┌────────────────────────┐
│   Ambulance Login      │
├────────────────────────┤
│   Enter ID:            │
│   [AMB001_____]        │ ← Type any ID
│                        │
│   [  LOGIN  ]          │ ← CLICK
└────────────────────────┘
```

### Step 3: Waiting Screen

```
┌────────────────────────┐
│   Ambulance Dashboard  │
├────────────────────────┤
│                        │
│   ✓ Ready for Service  │
│                        │
│   Waiting for          │
│   emergency alerts...  │
│                        │
│   [ Reject ] [Accept]  │ ← Disabled
│                        │
└────────────────────────┘
```

### Step 4: Alert Received!

```
┌────────────────────────┐
│   Ambulance Dashboard  │
├────────────────────────┤
│                        │
│ 🚨 NEW EMERGENCY ALERT │
│                        │
│ Incident ID: INC-001   │
│ Patient waiting...     │
│ Accept to view         │
│ location               │
│                        │
│ [ Reject ] [✓ Accept]  │ ← CLICK Accept
│                        │
└────────────────────────┘
```

### Step 5: Accepted - New Button Appears!

```
┌────────────────────────┐
│   Ambulance Dashboard  │
├────────────────────────┤
│                        │
│ ✓ INCIDENT ASSIGNED!   │
│                        │
│ Incident ID: INC-001   │
│ Patient Location:      │
│ Lat: 12.971600         │
│ Lon: 77.594600         │
│                        │
│ [ 📍 View Live Location ] ← CLICK THIS!
│         (green)        │
│                        │
└────────────────────────┘
```

### Step 6: MAP APPEARS! ✅

```
┌────────────────────────┐
│ Live Patient (DEMO) ←  │
├────────────────────────┤
│ Distance: 0.05 km      │
│ ETA: < 1 min           │
│ Updated: 14:23:47      │
├────────────────────────┤
│                        │
│    🗺️ GOOGLE MAP      │
│                        │
│        🔴 ← Patient    │
│         (RED MARKER)   │
│     (moves every 2s!)  │
│                        │
│     🔵 ← Ambulance     │
│      (BLUE MARKER)     │
│   (moves to patient)   │
│                        │
├────────────────────────┤
│ Lat: 12.971653         │
│ Lon: 77.594589         │
│ [🔄] [📍] [🗺️ Nav]   │
└────────────────────────┘
```

---

## 🏥 HOSPITAL TEST

### Step 1: Select Hospital

```
┌────────────────────────┐
│   Smart Ambulance      │
├────────────────────────┤
│                        │
│   [ 🚑 Ambulance ]    │
│   [ 🏥 Hospital  ]    │ ← CLICK THIS
│   [ 👤 User      ]    │
│                        │
└────────────────────────┘
```

### Step 2: Login

```
┌────────────────────────┐
│   Hospital Login       │
├────────────────────────┤
│   Enter ID:            │
│   [HOSP001____]        │ ← Type any ID
│                        │
│   [  LOGIN  ]          │ ← CLICK
└────────────────────────┘
```

### Step 3: Alert Received

```
┌────────────────────────┐
│   Hospital Dashboard   │
├────────────────────────┤
│ 🚨 INCOMING EMERGENCY  │
│                        │
│ Incident: INC-001      │
│ Patient ID: USER-001   │
│                        │
│ 📍 Patient Location    │
│ Lat: 12.971600         │
│ Lon: 77.594600         │
│                        │
│ [ Reject ] [✓ Accept]  │ ← CLICK Accept
│                        │
└────────────────────────┘
```

### Step 4: New Button Appears!

```
┌────────────────────────┐
│   Hospital Dashboard   │
├────────────────────────┤
│                        │
│ ✓ PATIENT ASSIGNED     │
│                        │
│ Lat: 12.971600         │
│ Lon: 77.594600         │
│                        │
│ [🗺️ View Patient      │ ← CLICK THIS!
│     on Map    ]        │
│     (green)            │
│                        │
└────────────────────────┘
```

### Step 5: MAP APPEARS! ✅

```
┌────────────────────────┐
│ Patient Location (DEMO)│
├────────────────────────┤
│ Updated: 14:25:33      │
│ Incident: INC-001      │
├────────────────────────┤
│                        │
│    🗺️ GOOGLE MAP      │
│     (zoomed in)        │
│                        │
│        🔴              │
│    (RED MARKER)        │
│      Patient           │
│  (moves every 2s!)     │
│                        │
│                        │
├────────────────────────┤
│ Lat: 12.971608         │
│ Lon: 77.594612         │
│                        │
│ [🔄 Refresh] [📍 Center]
└────────────────────────┘
```

---

## ❌ COMMON PROBLEMS & SOLUTIONS

### Problem 1: "Button Not Appearing"

**Check:**

```
Did you press ACCEPT? ←
  ↓
YES → Button should appear
NO → Press Accept first!
```

**Where to look:**

```
After accepting, scroll down!
The button is BELOW the coordinates.
```

### Problem 2: "Blank Map"

**Causes & Fixes:**

```
1. No Internet
   → Turn on WiFi/Data
   
2. Loading...
   → Wait 5-10 seconds
   
3. Google Play Services
   → Update from Play Store
   
4. Location Off
   → Settings → Location → ON
```

### Problem 3: "Markers Not Moving"

**Check:**

```
1. Wait 2 seconds
   (First update happens after 2s)
   
2. Look at timestamp
   Does it change? →
   YES = Working!
   NO = Check logs
   
3. Press Refresh (🔄)
```

### Problem 4: "App Crashes"

**Fix:**

```
1. Reinstall app:
   adb install -r app/build/outputs/apk/debug/app-debug.apk
   
2. Clear app data:
   Settings → Apps → Smart Ambulance → Clear Data
   
3. Check phone has space
   (Needs ~50 MB free)
```

---

## 🎯 WHAT SUCCESS LOOKS LIKE

### Ambulance Success ✅

```
✓ Map loads
✓ See 2 markers (red + blue)
✓ RED moves randomly
✓ BLUE moves towards RED
✓ Numbers update (distance/ETA)
✓ Timestamp changes every 2s
```

### Hospital Success ✅

```
✓ Map loads
✓ See 1 marker (red)
✓ RED moves randomly
✓ Coordinates update
✓ Timestamp changes every 2s
```

---

## 🔥 ULTRA QUICK TEST

**60 Second Test:**

```
1. Install app         (10s)
2. Open as Ambulance   (5s)
3. Login              (5s)
4. Trigger emergency  (10s)
5. Accept             (5s)
6. Open map           (5s)
7. Watch markers move (20s)
```

**If markers move → ✅ SUCCESS!**
**If not → Tell me what you see!**

---

## 📞 Debug Info to Share

When reporting "not working", share:

```
1. Which role? (Ambulance/Hospital)
2. What step? (Login/Accept/Map)
3. What you see? (Blank/Error/Nothing)
4. Screenshot? (Very helpful!)
5. Phone model?
6. Android version?
```

---

## ⚡ FASTEST FIX

**Just reinstall:**

```powershell
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

**Then test again!**

---

**Still not working? Tell me EXACTLY what you see on screen!** 📱
