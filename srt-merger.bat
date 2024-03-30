@echo off
start "Node Server" cmd /c node server.js
timeout /t 5 /nobreak > NUL
start http://localhost:3000
