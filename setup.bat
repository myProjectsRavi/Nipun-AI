@echo off
setlocal EnableExtensions EnableDelayedExpansion
REM ─────────────────────────────────────────────────────────────────
REM 🧠 Nipun AI — One-Command Local Setup (Windows)
REM
REM Usage: Double-click this file or run in Command Prompt:
REM   setup.bat
REM ─────────────────────────────────────────────────────────────────
title Nipun AI Setup
echo.
echo ============================================================
echo   Nipun AI — The Open-Source Bloomberg Alternative
echo ============================================================
echo.

REM ─── 1. Check prerequisites ──────────────────────────────────────
echo [1/4] Checking prerequisites...

where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Node.js 22 or newer is required but not installed.
    echo        Download from: https://nodejs.org
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -p "process.versions.node.split('.')[0]"') do set NODE_MAJOR=%%v
if !NODE_MAJOR! LSS 22 (
    echo.
    echo ERROR: Node.js 22+ is required. Current version:
    node -v
    echo        Update from: https://nodejs.org
    echo.
    pause
    exit /b 1
)

where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: npm is required but not installed.
    echo        It comes with Node.js: https://nodejs.org
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do echo    Node.js %%v detected.

REM ─── 2. Clone if needed ──────────────────────────────────────────
echo.
if exist "package.json" (
    findstr /c:"nipun-ai" package.json >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        echo [2/4] Already in Nipun AI directory - skipping clone.
        goto :install
    )
)

echo [2/4] Cloning Nipun AI...
where git >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Git is required. Install from: https://git-scm.com
    echo.
    pause
    exit /b 1
)
git clone https://github.com/myProjectsRavi/Nipun-AI.git
if %ERRORLEVEL% neq 0 (
    echo ERROR: Git clone failed.
    pause
    exit /b 1
)
cd Nipun-AI

:install
REM ─── 3. Install dependencies ─────────────────────────────────────
echo.
echo [3/4] Installing dependencies from lockfiles...

echo    Installing Worker dependencies...
cd worker
call npm ci --no-fund
if %ERRORLEVEL% neq 0 (
    echo ERROR: Worker install failed.
    pause
    exit /b 1
)
cd ..

echo    Installing Frontend dependencies...
cd frontend
call npm ci --no-fund
if %ERRORLEVEL% neq 0 (
    echo ERROR: Frontend install failed.
    pause
    exit /b 1
)
cd ..

echo    All dependencies installed.

REM ─── 4. Start both services ──────────────────────────────────────
echo.
echo [4/4] Starting Nipun AI...
echo.
echo    This script never terminates processes already using ports 8787 or 5173.
echo    If a default port is busy, use the recommended launcher: npx nipun-ai@latest

REM Start worker in a new window
start "Nipun AI Worker" cmd /k "cd worker && npx wrangler dev --port 8787"

REM Give worker a moment to start
timeout /t 3 /nobreak >nul

REM Start frontend in a new window
start "Nipun AI Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ============================================================
echo   Nipun AI startup commands launched.
echo.
echo   Frontend: http://localhost:5173
echo   Worker:   http://localhost:8787
echo.
echo   Next steps:
echo   1. Open http://localhost:5173 in your browser
echo   2. Click 'Demo Mode' to try instantly (no API keys needed)
echo   3. Or enter your free API keys for live data
echo.
echo   Get free API keys (2 minutes):
echo     Finnhub:  https://finnhub.io
echo     Gemini:   https://aistudio.google.com
echo     Groq:     https://console.groq.com
echo     Cohere:   https://dashboard.cohere.com
echo     Cerebras: https://cloud.cerebras.ai (optional)
echo.
echo   Close the Worker and Frontend windows to stop.
echo ============================================================
echo.
pause
endlocal
