@echo off
title Little Learners Launcher
echo ===================================================
echo     Starting Little Learners Full-Stack App
echo ===================================================
echo.

echo [1/2] Launching Flask Backend Server (Port 5000)...
start "Little Learners Backend [Port 5000]" cmd /k "cd /d ""%~dp0backend"" && py app.py"

echo [2/2] Launching Vite React Frontend (Port 5173)...
start "Little Learners Frontend [Port 5173]" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo.
echo ===================================================
echo  Both servers started in separate terminal windows!
echo  Backend:  http://127.0.0.1:5000
echo  Frontend: http://localhost:5173
echo ===================================================
echo.
pause
