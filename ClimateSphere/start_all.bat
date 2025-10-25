@echo off
echo 🌍 Starting ClimateSphere Platform...
echo.

echo 📡 Starting Backend API...
cd backend
start "ClimateSphere Backend" cmd /k "npm run dev"
cd ..

echo 🤖 Starting ML API...
cd backend\ml
start "ClimateSphere ML API" cmd /k "python prediction_api.py"
cd ..\..

echo 🌐 Starting Frontend Server...
cd frontend
start "ClimateSphere Frontend" cmd /k "python serve.py"
cd ..

echo.
echo ✅ All services starting...
echo.
echo 🚀 Access ClimateSphere at: http://localhost:8000
echo 📊 Backend API: http://localhost:3000
echo 🤖 ML API: http://localhost:5000
echo.
echo Press any key to continue...
pause > nul