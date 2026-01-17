# Detailed Emergency Call Test
# This will show you exactly what's happening

Write-Host "`n🚨 EMERGENCY CALL TEST - DETAILED`n" -ForegroundColor Yellow
Write-Host "=" * 70 -ForegroundColor Gray

# Step 1: Check server
Write-Host "`n[1/5] Checking if server is running..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get
    Write-Host "✅ Server is running!" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor White
} catch {
    Write-Host "❌ Server is NOT running!" -ForegroundColor Red
    Write-Host "   Start it with: cd twilio-sms; npm start" -ForegroundColor Yellow
    exit
}

# Step 2: Show configuration
Write-Host "`n[2/5] Checking Twilio configuration..." -ForegroundColor Cyan
$env = Get-Content "twilio-sms/.env" -Raw
if ($env -match "TWILIO_ACCOUNT_SID=(\w+)") {
    $sid = $matches[1]
    Write-Host "   Account SID: $sid" -ForegroundColor White
    if ($sid.StartsWith("AC")) {
        Write-Host "   ✅ Correct format (starts with AC)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Wrong format! Should start with AC, not SK" -ForegroundColor Red
    }
}
if ($env -match "TWILIO_PHONE_NUMBER=\+?(\d+)") {
    $twilioPhone = $matches[1]
    Write-Host "   Twilio Phone: +$twilioPhone" -ForegroundColor White
}
if ($env -match "AMBULANCE_1_PHONE=\+?(\d+)") {
    $targetPhone = "+$($matches[1])"
    Write-Host "   Target Phone: $targetPhone" -ForegroundColor White
}

# Step 3: Trigger emergency
Write-Host "`n[3/5] Triggering emergency call..." -ForegroundColor Cyan
$body = @{
    patientPhone = $targetPhone
    patientName = "Test Patient"
    latitude = 12.9716
    longitude = 77.5946
    address = "Test Location Bangalore"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/emergency/trigger" -Method Post -Body $body -Headers $headers
    
    Write-Host "   ✅ Server Response: SUCCESS" -ForegroundColor Green
    Write-Host "   Message: $($response.message)" -ForegroundColor White
    
    # Show call details
    if ($response.data.ambulanceCalls) {
        Write-Host "`n[4/5] Call Attempts:" -ForegroundColor Cyan
        foreach ($call in $response.data.ambulanceCalls) {
            if ($call.success) {
                Write-Host "   ✅ Call initiated to: $($call.to)" -ForegroundColor Green
                Write-Host "      Call SID: $($call.callSid)" -ForegroundColor White
                Write-Host "      Status: $($call.status)" -ForegroundColor White
            } else {
                Write-Host "   ❌ Call FAILED to: $($call.phoneNumber)" -ForegroundColor Red
                Write-Host "      Error: $($call.error)" -ForegroundColor Yellow
            }
        }
    }
    
} catch {
    Write-Host "   ❌ ERROR calling server!" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Yellow
    exit
}

# Step 4: Check Twilio logs
Write-Host "`n[5/5] What to do next:" -ForegroundColor Cyan
Write-Host "   1. Check your phone - it should ring within 10 seconds" -ForegroundColor White
Write-Host "   2. If no call, check Twilio logs:" -ForegroundColor White
Write-Host "      https://console.twilio.com/monitor/logs/calls" -ForegroundColor Blue
Write-Host "   3. If you see 'Unverified Callee', verify your number:" -ForegroundColor White
Write-Host "      https://console.twilio.com/us1/develop/phone-numbers/manage/verified" -ForegroundColor Blue

Write-Host "`n" + ("=" * 70) -ForegroundColor Gray
Write-Host "⏰ Waiting for call... Check your phone!" -ForegroundColor Yellow
Write-Host "=" * 70 -ForegroundColor Gray

# Keep window open
Start-Sleep -Seconds 15
Write-Host "`n✅ Test complete! Did your phone ring?" -ForegroundColor Green
