@echo off
title Capsule Wardrobe Closet Launcher
echo ===================================================
echo   LAUNCHING CAPSULE WARDROBE STUDIO
echo ===================================================
echo.
echo [1/2] Launching local Node application server...
echo.
start /b cmd /c npm run dev
echo.
echo [2/2] Opening Capsule Wardrobe interface in your browser...
echo.
timeout /t 3 > nul
start "" "http://localhost:3000"
echo.
echo System operates offline. Minimize this terminal window to keep closet active!
echo To shut down, simply close this terminal window.
echo ===================================================
pause
