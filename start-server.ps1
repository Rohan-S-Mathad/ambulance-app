#!/usr/bin/env pwsh

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "STARTING AMBULANCE EMERGENCY SERVER" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to twilio-serverless directory
$serverPath = Join-Path $PSScriptRoot "twilio-serverless"

if (-not (Test-Path $serverPath)) {
    Write-Host "ERROR: twilio-serverless directory not found!" -ForegroundColor Red
    Write-Host "Expected path: $serverPath" -ForegroundColor Red
    exit 1
}

Write-Host "Navigating to: $serverPath" -ForegroundColor Green
Set-Location $serverPath

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "WARNING: .env file not found!" -ForegroundColor Yellow
    Write-Host "Server may not have proper configuration." -ForegroundColor Yellow
} else {
    Write-Host ".env file found" -ForegroundColor Green
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "Dependencies installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting server..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
node server.js
