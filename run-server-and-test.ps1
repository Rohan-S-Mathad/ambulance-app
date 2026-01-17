#!/usr/bin/env pwsh

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "STARTING SERVER AND MAKING TEST CALL" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to twilio-serverless directory
$serverPath = Join-Path $PSScriptRoot "twilio-serverless"

if (-not (Test-Path $serverPath)) {
    Write-Host "ERROR: twilio-serverless directory not found!" -ForegroundColor Red
    exit 1
}

# Start server in background
Write-Host "Starting server in background..." -ForegroundColor Yellow
$serverJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    node server.js
} -ArgumentList $serverPath

Write-Host "Server job started (Job ID: $($serverJob.Id))" -ForegroundColor Green
Write-Host "Waiting for server to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if server is running
Write-Host "Checking server status..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/" -Method Get -TimeoutSec 5
    Write-Host "✅ Server is running!" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Cyan
    Write-Host "   Message: $($response.message)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Server failed to start!" -ForegroundColor Red
    Stop-Job -Id $serverJob.Id
    Remove-Job -Id $serverJob.Id
    exit 1
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "MAKING TEST EMERGENCY CALL" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Prepare test call data
$testData = @{
    patientPhone = "+919482936725"
    patientName = "Test Patient - Emergency Call"
    latitude = 12.9249
    longitude = 77.4989
    address = "RV College of Engineering, Bengaluru"
    incidentId = "TEST-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "📋 Test Call Details:" -ForegroundColor Cyan
Write-Host "   Patient: Test Patient - Emergency Call" -ForegroundColor White
Write-Host "   Phone: +919482936725" -ForegroundColor White
Write-Host "   Location: RV College of Engineering" -ForegroundColor White
Write-Host "   Lat/Lon: 12.9249, 77.4989" -ForegroundColor White
Write-Host ""

Write-Host "🚨 Sending emergency alert..." -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/emergency-alert" -Method Post -Body $testData -Headers $headers -TimeoutSec 30
    
    Write-Host "✅ SUCCESS! Emergency alert sent!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Response Details:" -ForegroundColor Cyan
    Write-Host "   Success: $($response.success)" -ForegroundColor Green
    Write-Host "   Message: $($response.message)" -ForegroundColor White
    Write-Host "   Incident ID: $($response.incidentId)" -ForegroundColor White
    Write-Host "   Timestamp: $($response.timestamp)" -ForegroundColor White
    Write-Host ""
    
    if ($response.results) {
        Write-Host "📞 Call Results:" -ForegroundColor Cyan
        foreach ($result in $response.results) {
            if ($result.status -eq "success") {
                Write-Host "   ✅ $($result.contact) ($($result.phone))" -ForegroundColor Green
                Write-Host "      Call SID: $($result.callSid)" -ForegroundColor Gray
                Write-Host "      SMS SID: $($result.smsSid)" -ForegroundColor Gray
            } else {
                Write-Host "   ❌ $($result.contact) ($($result.phone))" -ForegroundColor Red
                Write-Host "      Error: $($result.error)" -ForegroundColor Red
            }
        }
    }
    
    Write-Host ""
    Write-Host "📱 CHECK YOUR PHONE!" -ForegroundColor Yellow
    Write-Host "   You should receive:" -ForegroundColor White
    Write-Host "   1. Voice call with emergency message" -ForegroundColor White
    Write-Host "   2. SMS with emergency details" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "❌ Error making test call!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Server Response: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Press any key to stop the server..." -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Stop server
Write-Host ""
Write-Host "Stopping server..." -ForegroundColor Yellow
Stop-Job -Id $serverJob.Id
Remove-Job -Id $serverJob.Id
Write-Host "✅ Server stopped" -ForegroundColor Green
Write-Host ""
