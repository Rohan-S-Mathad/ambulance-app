# ⚡ QUICK TEST - Do This NOW!

## 🚀 Install App (30 seconds)

```powershell
cd "C:\Users\ROHAN MATHAD\AndroidStudioProjects\ambulance"
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

**OR** in Android Studio: Click green **▶ Run** button

---

## 🧪 Test Ambulance Map (1 minute)

### Steps:

1. **Open app** → Select **"Ambulance"**
2. **Login** (any ID like "AMB001")
3. **Switch to User app** → Press Emergency button
4. **Back to Ambulance** → See alert
5. **Press "Accept"** button
6. **Press "View Live Location"** (green button)

### ✅ What You Should See:

- 🗺️ Google Map appears
- 🔴 RED marker (patient)
- 🔵 BLUE marker (ambulance)
- **Markers move every 2 seconds!**
- Distance and ETA update
- Coordinates change
- Timestamp updates

---

## 🧪 Test Hospital Map (1 minute)

### Steps:

1. **Open app** → Select **"Hospital"**
2. **Login** (any ID like "HOSP001")
3. **Switch to User app** → Press Emergency button
4. **Back to Hospital** → See alert
5. **Press "Accept"** button
6. **Press "🗺️ View Patient on Map"** button (appears after accept)

### ✅ What You Should See:

- 🗺️ Google Map appears (zoomed in)
- 🔴 RED marker (patient)
- **Marker moves every 2 seconds!**
- Coordinates update
- Timestamp changes

---

## ❌ If Map Doesn't Load

### Quick Fixes:

1. **Enable Location**
    - Phone Settings → Location → Turn ON

2. **Check Internet**
    - Map needs internet for tiles

3. **Wait 5 seconds**
    - Map takes time to load

4. **Press Refresh button**
    - 🔄 button in the app

---

## 🎯 Key Points

- ✅ Patient moves **within 10 meters** randomly
- ✅ Updates **every 2 seconds**
- ✅ Ambulance marker **moves towards** patient
- ✅ Works **without real GPS** (simulation)
- ✅ **DEMO mode** - perfect for testing!

---

## 📱 What "Not Working" Means?

Tell me:

- [ ] Map not loading? (blank screen?)
- [ ] Markers not showing?
- [ ] Markers not moving?
- [ ] Button not appearing?
- [ ] App crashing?
- [ ] Something else?

---

## 🔥 Emergency Commands

```powershell
# Reinstall app
adb install -r app/build/outputs/apk/debug/app-debug.apk

# Check if phone connected
adb devices

# View app logs
adb logcat | Select-String "ambulance"
```

---

**Try it now and tell me what you see!** 🚀
