@echo off
echo ========================================
echo   Smart Collect - Starting Server...
echo ========================================
echo.
cd /d "%~dp0"
echo Current directory: %CD%
echo.
echo Installing dependencies (if needed)...
call npm install
echo.
echo Starting development server...
echo.
echo ========================================
echo   Server will start at:
echo   http://localhost:9002
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.
call npm run dev
pause
