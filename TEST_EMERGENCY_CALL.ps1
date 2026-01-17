# Test Emergency Call - PowerShell Script
# This will trigger an emergency call to the configured phone numbers

$body = @{
    patientPhone = "+919482936725"
    patientName = "Test Patient"
    latitude = 12.9716
    longitude = 77.5946
    address = "Test Location Bangalore"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "🚨 Triggering Emergency Call..." -ForegroundColor Yellow
Write-Host "Calling: +919482936725" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/emergency/trigger" -Method Post -Body $body -Headers $headers
    
    Write-Host ""
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
    Write-Host ""
    Write-Host "📞 Check your phone - it should be ringing!" -ForegroundColor Yellow
    
} catch {
    Write-Host ""
    Write-Host "❌ Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $responseBody = $reader.ReadToEnd()
        Write-Host "Server Response:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor White
    }
}
