@echo off
REM Smart Agriculture Assistant - Quick Start Script for Windows

echo.
echo 🌾 Smart Agriculture Assistant - Setup Script
echo =============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 14+ from nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js found: %NODE_VERSION%
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✅ npm found: %NPM_VERSION%
echo.

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed
cd ..
echo.

REM Create backend .env if it doesn't exist
if not exist "backend\.env" (
    echo 📝 Creating backend\.env from template...
    copy backend\.env.example backend\.env
    echo ⚠️  Please edit backend\.env with your MongoDB URI and API keys
)
echo.

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed
cd ..
echo.

echo ✅ Setup complete!
echo.
echo 📝 Next steps:
echo 1. Edit backend\.env file with your credentials:
echo    - MONGO_URI (MongoDB Atlas connection string)
echo    - WEATHER_API_KEY (OpenWeatherMap API key)
echo.
echo 2. Start the backend:
echo    cd backend && npm start
echo.
echo 3. In a new command prompt, start the frontend:
echo    cd frontend && npm start
echo.
echo 4. Open http://localhost:3000 in your browser
echo.
echo 📖 For detailed instructions, see SETUP.md
echo.
pause
