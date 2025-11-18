# Quick Public Access Script
# This script helps you get a public URL using ngrok

Write-Host "=== Family Website Public Access ===" -ForegroundColor Cyan
Write-Host ""

# Check if server is running
$serverRunning = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if (-not $serverRunning) {
    Write-Host "Starting server..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\naguj\Automation Metrics\family-website\server'; `$env:PATH = 'C:\Program Files\nodejs;' + `$env:PATH; node server.js"
    Start-Sleep -Seconds 3
}

# Check for ngrok
$ngrokPath = "C:\ngrok\ngrok.exe"
if (-not (Test-Path $ngrokPath)) {
    Write-Host "ngrok not found at $ngrokPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "To get a public URL:" -ForegroundColor Yellow
    Write-Host "1. Download ngrok from: https://ngrok.com/download" -ForegroundColor White
    Write-Host "2. Extract to C:\ngrok\" -ForegroundColor White
    Write-Host "3. Run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "OR use Railway/Render for permanent hosting (see DEPLOYMENT.md)" -ForegroundColor Cyan
    exit
}

Write-Host "Starting ngrok tunnel..." -ForegroundColor Green
Write-Host "Your public URL will appear below:" -ForegroundColor Yellow
Write-Host ""

# Start ngrok
Start-Process $ngrokPath -ArgumentList "http", "3000"

Write-Host ""
Write-Host "ngrok is running! Check the ngrok window for your public URL." -ForegroundColor Green
Write-Host "It will look like: https://abc123.ngrok.io" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: Free ngrok URLs expire after 2 hours" -ForegroundColor Yellow

