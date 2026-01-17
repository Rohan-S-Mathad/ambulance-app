@echo off
echo.
echo ========================================
echo   Starting Twilio Emergency Server
echo ========================================
echo.

cd "twilio-serverless"
start "Twilio Emergency Server" cmd /k "npm start"

echo.
echo Server is starting in a new window...
echo Keep that window open while using the app!
echo.
echo Press any key to close this window...
pause >nul
