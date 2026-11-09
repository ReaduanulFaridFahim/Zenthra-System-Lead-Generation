@echo off
title Zenthra Systems Operations Console (Port 3050)
cd /d "%~dp0"
if exist "zenthra-systems" cd zenthra-systems
echo [+] Starting Zenthra Systems Platform on http://localhost:3050 ...
node ui\server.js
pause
