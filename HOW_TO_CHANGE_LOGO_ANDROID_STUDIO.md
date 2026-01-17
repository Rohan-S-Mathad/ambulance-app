# 📱 How to Change App Logo in Android Studio

## Method 1: Using Image Asset Studio (Recommended)

### **Step 1: Open Image Asset Studio**

1. In Android Studio, locate the **Project** panel (left side)
2. **Right-click** on the `app` folder
3. Navigate: **New → Image Asset**

```
app (right-click)
  └── New
       └── Image Asset  ← Click this
```

---

### **Step 2: Configure Launcher Icon**

You'll see the **Asset Studio** window with three tabs:

- **Launcher Icons (Adaptive and Legacy)** ← Select this
- Notification Icons
- Action Bar and Tab Icons

---

### **Step 3: Choose Foreground Layer**

In the **Foreground Layer** section:

#### **Option A: Use Your Own Image**

1. **Source Asset:** Select **Image**
2. **Path:** Click the folder icon
3. **Browse** to your logo file (PNG, JPG, SVG)
4. **Trim:** Check "Yes" to remove transparent padding
5. **Resize:** Adjust slider (0-100%) to fit properly

**Best Practices:**

- Use PNG with transparent background
- Recommended size: 512x512 pixels minimum
- Simple design works best
- Avoid too much detail

---

#### **Option B: Use Built-in Clipart**

1. **Source Asset:** Select **Clip Art**
2. Click the **Clip Art** icon button
3. Choose from hundreds of icons:
    - Search: "ambulance" 🚑
    - Search: "medical" ➕
    - Search: "hospital" 🏥
    - Search: "emergency" 🚨
4. Select your preferred icon
5. Adjust size with slider

---

#### **Option C: Use Text**

1. **Source Asset:** Select **Text**
2. Enter your text (e.g., "911", "Aid", "EMS")
3. Choose font family
4. Adjust size and position

---

### **Step 4: Configure Background Layer**

In the **Background Layer** section:

#### **Option A: Solid Color (Recommended)**

1. **Source Asset:** Select **Color**
2. Click the **Color** box
3. Choose your color:
    - **Healthcare Pink:** `#E91E63`
    - **Medical Blue:** `#2196F3`
    - **Emergency Red:** `#F44336`
    - **Health Green:** `#4CAF50`
    - **Professional Purple:** `#9C27B0`

---

#### **Option B: Custom Image**

1. **Source Asset:** Select **Image**
2. **Path:** Browse to background image
3. Choose pattern or gradient image
4. Adjust resize/trim settings

---

### **Step 5: Preview**

On the right side, you'll see **live previews**:

```
┌─────────────────────────────────┐
│  Preview Panel                  │
│                                 │
│  ○ Circle (Samsung)             │
│  □ Rounded Square (Pixel)       │
│  ⬡ Squircle (OnePlus)          │
│  ◇ Other shapes                 │
│                                 │
│  Shows how icon looks on        │
│  different Android devices      │
└─────────────────────────────────┘
```

**Check:**

- ✅ Icon looks clear and recognizable
- ✅ Colors contrast well
- ✅ Not too detailed or cluttered
- ✅ Works in all shapes

---

### **Step 6: Configure Options**

#### **Name:**

- Default: `ic_launcher`
- Usually, keep default name

#### **Trim:**

- **Trim Surrounding Blank Space:** Yes (recommended)

#### **Resize:**

- Adjust if icon is too large/small
- Usually 75-100% works well

#### **Shape:**

- Legacy Icon: None (adaptive icons adjust automatically)

#### **Background Color:**

- Choose solid color for your icon background

---

### **Step 7: Generate Icons**

1. Review your settings
2. Click **Next** button (bottom right)
3. Review the files that will be generated:

```
Confirm Icon Path:

The following files will be created or overwritten:

✓ res/mipmap-anydpi-v26/ic_launcher.xml
✓ res/mipmap-anydpi-v26/ic_launcher_round.xml
✓ res/mipmap-hdpi/ic_launcher.png
✓ res/mipmap-hdpi/ic_launcher_foreground.png
✓ res/mipmap-hdpi/ic_launcher_round.png
✓ res/mipmap-mdpi/ic_launcher.png
✓ res/mipmap-mdpi/ic_launcher_foreground.png
... (and more)
```

4. Click **Finish**

---

### **Step 8: Clean & Rebuild**

After generating icons:

1. **Clean Project:**
    - Menu: **Build → Clean Project**
    - Wait for completion

2. **Rebuild Project:**
    - Menu: **Build → Rebuild Project**
    - Wait for completion

3. **Uninstall old app** from device (if already installed)

4. **Run app:**
    - Click the green **Run** button
    - Or: **Run → Run 'app'**

---

### **Step 9: Check Result**

1. App installs on device/emulator
2. Go to home screen
3. **See your new icon!** 🎉

---

## Method 2: Edit XML Files Directly (Advanced)

### **Change Background Color**

Edit: `app/src/main/res/drawable/ic_launcher_background.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    
    <!-- Change this color -->
    <path
        android:fillColor="#E91E63"  ← Your color here
        android:pathData="M0,0h108v108h-108z" />
</vector>
```

---

### **Change Foreground Design**

Edit: `app/src/main/res/drawable/ic_launcher_foreground.xml`

This is more complex - contains vector paths for the ambulance design.

**Easier alternative:** Use Image Asset Studio instead.

---

## Method 3: Use Online Icon Generator

### **Popular Tools:**

1. **Android Asset Studio**
    - URL: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
    - Free, no signup required
    - Official Google tool

2. **Icon Kitchen**
    - URL: https://icon.kitchen/
    - Modern interface
    - More customization options

3. **App Icon Generator**
    - URL: https://appicon.co/
    - Supports multiple platforms

---

### **Steps for Online Tools:**

1. **Upload your logo** (PNG recommended, 512x512px+)
2. **Configure:**
    - Choose background color
    - Select shape
    - Adjust padding
    - Preview on devices
3. **Generate**
4. **Download ZIP file**
5. **Extract files**
6. **Copy to project:**
    - Extract all `mipmap-*` folders
    - Copy to: `app/src/main/res/`
    - Replace existing files
7. **Rebuild app**

---

## 🎨 Color Palette Suggestions

### **Healthcare/Medical Theme:**

```
Pink:   #E91E63  (Care, compassion)
Red:    #F44336  (Emergency)
Blue:   #2196F3  (Trust, medical)
Green:  #4CAF50  (Health, wellness)
Purple: #9C27B0  (Premium care)
```

### **Gradient Combinations:**

```
Pink Gradient:   #FCE4EC → #F48FB1 → #E91E63
Blue Gradient:   #E3F2FD → #64B5F6 → #2196F3
Green Gradient:  #E8F5E9 → #81C784 → #4CAF50
Red Gradient:    #FFEBEE → #EF5350 → #F44336
```

---

## 🖼️ Logo Design Tips

### **What Makes a Good App Icon:**

✅ **Simple** - Recognizable at small sizes  
✅ **Clear** - Not too much detail  
✅ **Memorable** - Unique and distinctive  
✅ **Scalable** - Looks good at all sizes  
✅ **Consistent** - Matches your app theme  
✅ **Professional** - High-quality design

### **Avoid:**

❌ Text in the icon (hard to read)  
❌ Too many colors (looks cluttered)  
❌ Complex details (blur at small size)  
❌ Low-resolution images  
❌ Copying other apps' icons

---

## 📊 Icon Sizes Reference

Android generates icons in multiple sizes:

| Density | Size (px) | Folder |
|---------|-----------|--------|
| LDPI | 36x36 | mipmap-ldpi |
| MDPI | 48x48 | mipmap-mdpi |
| HDPI | 72x72 | mipmap-hdpi |
| XHDPI | 96x96 | mipmap-xhdpi |
| XXHDPI | 144x144 | mipmap-xxhdpi |
| XXXHDPI | 192x192 | mipmap-xxxhdpi |

**Your source image should be at least 512x512 pixels!**

---

## 🔍 Troubleshooting

### **Problem: Icon doesn't change after rebuild**

**Solution:**

1. Uninstall app from device completely
2. Clean project: `Build → Clean Project`
3. Rebuild: `Build → Rebuild Project`
4. Reinstall app

---

### **Problem: Icon looks blurry**

**Solution:**

- Use higher resolution source image (1024x1024)
- Use vector graphics (SVG) instead of PNG
- Or use XML vector drawables (current approach)

---

### **Problem: Icon has wrong colors**

**Solution:**

- Check `ic_launcher_background.xml` color values
- Ensure hex colors start with `#`
- Use 6-digit hex format: `#RRGGBB`

---

### **Problem: Icon too small/large**

**Solution:**

- In Image Asset Studio: Adjust **Resize** slider
- Or: Adjust **Trim** settings
- Or: Manually edit XML `viewportWidth/Height`

---

## ✅ Checklist

Before publishing, ensure:

- [ ] Icon displays correctly on home screen
- [ ] Icon looks good in all shapes (circle, square, etc.)
- [ ] Icon is recognizable at small sizes
- [ ] Colors match your app theme
- [ ] Icon is unique (not copying others)
- [ ] All density sizes generated (mdpi to xxxhdpi)
- [ ] App name is correct in `strings.xml`

---

## 🎉 Quick Summary

### **Easiest Method: Android Studio Image Asset Studio**

1. Right-click `app` → **New → Image Asset**
2. Upload your logo or choose clipart
3. Select background color
4. Preview on different shapes
5. Click **Next → Finish**
6. Clean & Rebuild
7. Run app
8. **Done!** 🎊

**Time required: 2-3 minutes**

---

## 🚀 Your Current Icon

Your app currently has:

- ✅ Pink healthcare-themed gradient background
- ✅ White ambulance with red medical cross
- ✅ Professional medical appearance
- ✅ Vector graphics (scales perfectly)
- ✅ Adaptive icon (works on all devices)

**Want to change it? Use Method 1 above!**

---

**Need help? Check the full documentation: `HOW_TO_CHANGE_APP_ICON.md`**
