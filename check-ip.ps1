# Quick IP Check Script for Ambulance Emergency System

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Ambulance Emergency System - IP Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get current IP
$currentIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.IPAddress -notlike "127.*" -and $_.PrefixOrigin -eq "Dhcp" 
}).IPAddress | Select-Object -First 1

# Expected IP (what's currently in the code)
$expectedIP = "172.17.13.32"

Write-Host "Current Computer IP:  " -NoNewline -ForegroundColor White
Write-Host "$currentIP" -ForegroundColor Yellow
Write-Host "Expected IP in Code:  " -NoNewline -ForegroundColor White
Write-Host "$expectedIP" -ForegroundColor Green
Write-Host ""

if ($currentIP -eq $expectedIP) {
    Write-Host "[OK] IP ADDRESS MATCHES! No changes needed." -ForegroundColor Green
    Write-Host ""
    Write-Host "Testing Instructions:" -ForegroundColor Cyan
    Write-Host "   1. Connect phone to same WiFi" -ForegroundColor White
    Write-Host "   2. Turn OFF mobile data on phone" -ForegroundColor White
    Write-Host "   3. Test in phone browser: http://$currentIP:3000" -ForegroundColor Yellow
    Write-Host "   4. Install app: adb install -r app/build/outputs/apk/debug/app-debug.apk" -ForegroundColor White
    Write-Host "   5. Press Emergency button!" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "[WARNING] IP ADDRESS CHANGED!" -ForegroundColor Red
    Write-Host ""
    Write-Host "You need to update the app with the new IP:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "STEP 1: Open this file:" -ForegroundColor Cyan
    Write-Host "   app/src/main/java/com/example/ambulance/data/RetrofitClient.kt" -ForegroundColor White
    Write-Host ""
    Write-Host "STEP 2: Change this line:" -ForegroundColor Cyan
    Write-Host "   OLD: " -NoNewline -ForegroundColor White
    Write-Host ('private const val BASE_URL = "http://' + $expectedIP + ':3000/"') -ForegroundColor Red
    Write-Host "   NEW: " -NoNewline -ForegroundColor White
    Write-Host ('private const val BASE_URL = "http://' + $currentIP + ':3000/"') -ForegroundColor Green
    Write-Host ""
    Write-Host "STEP 3: Rebuild the app:" -ForegroundColor Cyan
    Write-Host "   .\gradlew assembleDebug" -ForegroundColor White
    Write-Host ""
    Write-Host "STEP 4: Install on phone:" -ForegroundColor Cyan
    Write-Host "   adb install -r app/build/outputs/apk/debug/app-debug.apk" -ForegroundColor White
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Quick Test Command:" -ForegroundColor Cyan
Write-Host ""
Write-Host 'Copy and paste this to test:' -ForegroundColor Yellow
Write-Host ""
Write-Host '$body = @{ patientPhone = "+919482936725"; patientName = "Quick Test"; latitude = 12.9716; longitude = 77.5946; address = "Test Location"; incidentId = "QUICK-TEST" } | ConvertTo-Json' -ForegroundColor Gray
Write-Host ""
$testUrl = "http://$currentIP:3000/emergency-alert"
Write-Host "Invoke-RestMethod -Method Post -Uri `"$testUrl`" -Body `$body -ContentType `"application/json`"" -ForegroundColor Gray
Write-Host ""
Write-Host "[WARNING] This will actually CALL the hospital phone!" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "   - QUICK_FIX_SUMMARY.md       (Quick start)" -ForegroundColor White
Write-Host "   - EMERGENCY_BUTTON_DEBUG.md  (Full guide)" -ForegroundColor White
Write-Host "   - PHYSICAL_DEVICE_SETUP.md   (Setup info)" -ForegroundColor White
Write-Host ""
