# Twilio Serverless - Emergency Alert System

## What is this?

This directory contains a **Twilio Serverless Function** that makes emergency calls without needing
a local server.

## Files

- `functions/emergency-alert.js` - Main function that makes calls
- `.env` - Environment variables (phone numbers)
- `package.json` - Dependencies
- `.twilioserverlessrc` - Configuration

## Quick Deploy

```powershell
# First time only
npm install -g twilio-cli
twilio login
twilio plugins:install @twilio-labs/plugin-serverless

# Deploy
npm install
twilio serverless:deploy
```

## Configuration

Phone numbers are in `.env`:

```env
TWILIO_PHONE_NUMBER=+18585332666
AMBULANCE_1_PHONE=+919740417391
AMBULANCE_2_PHONE=+919740417391
HOSPITAL_1_PHONE=+919482936725
```

## Test

After deploying, test with:

```powershell
$url = "YOUR-FUNCTION-URL/emergency-alert"

$body = @{
    latitude = 12.9716
    longitude = 77.5946
    patientName = "Test"
    address = "Test Location"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri $url -Body $body -ContentType "application/json"
```

## Update

1. Edit `functions/emergency-alert.js` or `.env`
2. Run `twilio serverless:deploy`

## Logs

```powershell
twilio serverless:logs --tail
```

## More Info

See `../TWILIO_SERVERLESS_DEPLOYMENT.md` for complete guide.
