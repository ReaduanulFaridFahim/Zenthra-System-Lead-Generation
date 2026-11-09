@echo off
title Zenthra Systems Operations Console (Port 3050)
cd /d "%~dp0"
if exist "ui\server.js" (
  echo [+] Starting Zenthra Systems Platform on http://localhost:3050 ...
  node ui\server.js
) else if exist "zenthra-systems\ui\server.js" (
  cd zenthra-systems
  echo [+] Starting Zenthra Systems Platform on http://localhost:3050 ...
  node ui\server.js
) else (
  echo [!] Could not locate ui\server.js
)
pause
