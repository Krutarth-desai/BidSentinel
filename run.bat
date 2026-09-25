@echo off
REM run.bat — Windows batch launcher for BidSentinel
setlocal

cd /d "%~dp0"

IF EXIST "backend\.venv\Scripts\python.exe" (
    "backend\.venv\Scripts\python.exe" run.py %*
) ELSE (
    python run.py %*
)

endlocal
