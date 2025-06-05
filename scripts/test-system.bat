@echo off
echo 🧪 بدء اختبار نظام البسنديلي جيم الشامل...

REM Check if Node.js is installed
echo [INFO] فحص Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js غير مثبت
    pause
    exit /b 1
)
echo [SUCCESS] Node.js متاح

REM Check if PostgreSQL is available
echo [INFO] فحص PostgreSQL...
pg_isready >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] PostgreSQL قد لا يكون متاحاً. تأكد من تشغيله
)

REM Setup Backend
echo [INFO] إعداد Backend...
cd backend

if not exist "node_modules" (
    echo [INFO] تثبيت backend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] فشل في تثبيت backend dependencies
        pause
        exit /b 1
    )
)

if not exist ".env" (
    echo [INFO] إنشاء ملف .env...
    copy .env.example .env
    echo [WARNING] يرجى تحديث ملف .env بالإعدادات الصحيحة
)

echo [INFO] تشغيل migrations و seed...
call npm run migrate
call npm run seed

cd ..

REM Setup Frontend
echo [INFO] إعداد Frontend...
cd frontend

if not exist "node_modules" (
    echo [INFO] تثبيت frontend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] فشل في تثبيت frontend dependencies
        pause
        exit /b 1
    )
)

cd ..

echo [SUCCESS] تم إعداد النظام بنجاح!
echo.
echo 🚀 لتشغيل النظام:
echo.
echo 1. تشغيل Backend:
echo    cd backend ^&^& npm run dev
echo.
echo 2. تشغيل Frontend (في terminal جديد):
echo    cd frontend ^&^& npm start
echo.
echo 3. اختبار API (في terminal جديد):
echo    cd backend ^&^& node test-api.js
echo.
echo 🌐 الروابط:
echo    Backend API: http://localhost:5000
echo    Frontend Dashboard: http://localhost:3000
echo.
echo 🔑 بيانات الدخول:
echo    المدير: admin / admin123456
echo    الموظف: receptionist / receptionist123

pause
