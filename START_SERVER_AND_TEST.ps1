#!/usr/bin/env pwsh
# Emergency Call System - Quick Start Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚨 TWILIO EMERGENCY CALL SYSTEM" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Start server
Write-Host "📋 Step 1: Starting Twilio Server..." -ForegroundColor Green
Write-Host ""

cd twilio-sms

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start server in background
Write-Host "🚀 Starting server on http://localhost:3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm start"

# Wait for server to start
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Step 2: Test server
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📋 Step 2: Testing Server..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -ErrorAction Stop
    Write-Host "✅ Server is running!" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor White
    Write-Host "   Service: $($health.service)" -ForegroundColor White
} catch {
    Write-Host "❌ Server failed to start!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Show configuration
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📋 Step 3: Configuration" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "   🔒 API keys and phone numbers are hidden for security" -ForegroundColor Yellow

# Step 4: Test emergency call
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📋 Step 4: Test Emergency Call?" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will trigger REAL CALLS to the configured phone numbers." -ForegroundColor Yellow
Write-Host ""
$test = Read-Host "Do you want to test emergency call now? (y/N)"

if ($test -eq "y" -or $test -eq "Y") {
    Write-Host ""
    Write-Host "🚨 Triggering emergency call..." -ForegroundColor Red
    
    $body = @{
        patientPhone = "+919482936725"
        patientName = "Test Patient"
        latitude = 12.9716
        longitude = 77.5946
        address = "Test Location, Bangalore"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/emergency/trigger" -Body $body -ContentType "application/json"
        
        Write-Host ""
        Write-Host "✅ Emergency call triggered successfully!" -ForegroundColor Green
        Write-Host "   Ambulance calls: $($response.data.ambulanceCalls.Count)" -ForegroundColor White
        Write-Host "   Hospital calls: $($response.data.hospitalCalls.Count)" -ForegroundColor White
        Write-Host ""
        Write-Host "📞 Calls are being made to:" -ForegroundColor Yellow
        foreach ($call in $response.data.ambulanceCalls) {
            Write-Host "   - $($call.to): $($call.status)" -ForegroundColor White
        }
        
    } catch {
        Write-Host "❌ Emergency call failed!" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Step 5: Instructions
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📋 Next Steps" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open Android Studio" -ForegroundColor White
Write-Host "2. Sync Gradle: File → Sync Project with Gradle Files" -ForegroundColor White
Write-Host "3. Rebuild: Build → Rebuild Project" -ForegroundColor White
Write-Host "4. Run the app in emulator" -ForegroundColor White
Write-Host "5. Press the Emergency Button" -ForegroundColor White
Write-Host "6. Watch the server console for call logs!" -ForegroundColor White
Write-Host ""
Write-Host "📚 Full guide: TWILIO_CALL_SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Server is running! Keep this window open." -ForegroundColor Green
Write-Host ""

# Keep script running
Read-Host "Press Enter to exit"










