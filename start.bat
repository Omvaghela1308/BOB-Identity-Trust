@echo off
echo =========================================================
echo 🛡️  BOB Identity Trust Framework Launcher 🛡️
echo =========================================================
echo.
echo Starting Backend Server (Django on port 5000)...
start cmd /k "echo 🔒 Starting Django server... && cd backend && .\venv\Scripts\activate && python manage.py runserver 5000"
echo Starting Frontend Server (Vite React)...
start cmd /k "echo ⚡ Starting Vite dev server... && cd frontend && npm run dev"
echo.
echo Both servers are launching in separate windows.
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:5173
echo.
pause
