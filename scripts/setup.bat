@echo off
echo 🚀 إعداد مشروع البسنديلي جيم...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js غير مثبت. يرجى تثبيت Node.js أولاً
    pause
    exit /b 1
)

echo 📦 تثبيت dependencies للـ Backend...
cd backend
call npm install

echo 🗄️ إعداد قاعدة البيانات...
echo يرجى التأكد من تشغيل PostgreSQL وإنشاء قاعدة بيانات باسم elbsndely_gym

echo 🌱 تشغيل seed script...
call npm run seed

echo 📦 تثبيت dependencies للـ Frontend...
cd ..\frontend
call npm install

echo 📱 تثبيت dependencies للـ Mobile App...
cd ..\mobile
call npm install

echo ✅ تم إعداد المشروع بنجاح!
echo.
echo 🎯 لتشغيل المشروع:
echo Backend: cd backend ^&^& npm run dev
echo Frontend: cd frontend ^&^& npm start
echo Mobile: cd mobile ^&^& npm run android
echo.
echo 🔑 بيانات تسجيل الدخول الافتراضية:
echo المدير: admin / admin123456
echo الموظف: receptionist / receptionist123

pause
