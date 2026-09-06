# ===================================================
# Little Learners - Full-Stack Application Launcher (PowerShell)
# ===================================================

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "    Starting Little Learners Full-Stack App        " -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

$workspace = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/2] Launching Flask Backend Server (Port 5000)..." -ForegroundColor Green
$backendCmd = "Set-Location '$workspace\backend'; if (Get-Command py -ErrorAction SilentlyContinue) { py app.py } elseif (Get-Command python.exe -ErrorAction SilentlyContinue) { python.exe app.py } else { py app.py }"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

Write-Host "[2/2] Launching Vite React Frontend (Port 5173)..." -ForegroundColor Green
$frontendCmd = "Set-Location '$workspace\frontend'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host " Both servers launched in separate terminal windows!" -ForegroundColor Yellow
Write-Host " Backend API: http://127.0.0.1:5000/api" -ForegroundColor White
Write-Host " Frontend:    http://localhost:5173" -ForegroundColor White
Write-Host "===================================================" -ForegroundColor Cyan
