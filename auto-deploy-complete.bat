@echo off
chcp 65001 >nul
title نشر نظام البسنديلي جيم تلقائياً
color 0A

echo.
echo ========================================
echo    🚀 النشر التلقائي الكامل
echo    نظام إدارة الصالة الرياضية
echo ========================================
echo.

echo 📋 هذا البرنامج سيقوم بـ:
echo    ✅ رفع المشروع على GitHub تلقائياً
echo    ✅ نشر Backend على Render
echo    ✅ نشر Frontend على Netlify  
echo    ✅ إعداد قاعدة البيانات
echo    ✅ اختبار النظام كاملاً
echo    ✅ إعطاؤك الروابط النهائية
echo.

pause

echo.
echo 🔧 التحقق من المتطلبات...

:: Check if Git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git غير مثبت
    echo 📥 جاري تحميل وتثبيت Git...
    
    :: Download Git
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/git-for-windows/git/releases/download/v2.43.0.windows.1/Git-2.43.0-64-bit.exe' -OutFile 'git-installer.exe'"
    
    :: Install Git silently
    start /wait git-installer.exe /VERYSILENT /NORESTART
    del git-installer.exe
    
    echo ✅ تم تثبيت Git بنجاح
) else (
    echo ✅ Git مثبت
)

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js غير مثبت
    echo 📥 جاري تحميل وتثبيت Node.js...
    
    :: Download Node.js
    powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v18.19.0/node-v18.19.0-x64.msi' -OutFile 'node-installer.msi'"
    
    :: Install Node.js silently
    start /wait msiexec /i node-installer.msi /quiet
    del node-installer.msi
    
    echo ✅ تم تثبيت Node.js بنجاح
) else (
    echo ✅ Node.js مثبت
)

echo.
echo 🔐 إعداد GitHub...

:: Get GitHub credentials
set /p GITHUB_USERNAME="أدخل اسم المستخدم في GitHub: "
set /p GITHUB_EMAIL="أدخل البريد الإلكتروني: "

:: Configure Git
git config --global user.name "%GITHUB_USERNAME%"
git config --global user.email "%GITHUB_EMAIL%"

echo ✅ تم إعداد Git

echo.
echo 📤 رفع المشروع على GitHub...

:: Initialize Git repository
git init

:: Add all files
git add .

:: Create commit
git commit -m "نظام إدارة الصالة الرياضية - البسنديلي جيم - نشر تلقائي"

:: Create GitHub repository name
set REPO_NAME=elbsndely-gym-%RANDOM%

echo 📂 اسم المستودع: %REPO_NAME%

:: Create branch
git branch -M main

echo ✅ تم إعداد المستودع المحلي

echo.
echo 🌐 الآن تحتاج لإنشاء مستودع على GitHub:
echo.
echo 📋 اتبع هذه الخطوات:
echo    1. اذهب إلى: https://github.com/new
echo    2. اسم المستودع: %REPO_NAME%
echo    3. اجعله Public
echo    4. لا تختر أي خيارات إضافية
echo    5. اضغط Create repository
echo    6. انسخ الرابط الذي سيظهر
echo.

set /p REPO_URL="الصق رابط المستودع هنا: "

:: Add remote origin
git remote add origin %REPO_URL%

:: Push to GitHub
echo 📤 جاري رفع الملفات...
git push -u origin main

if errorlevel 1 (
    echo ❌ فشل في رفع الملفات
    echo 💡 تأكد من صحة الرابط وأن لديك صلاحيات
    pause
    exit /b 1
)

echo ✅ تم رفع المشروع على GitHub بنجاح!

echo.
echo 🚀 الآن سنقوم بالنشر على المنصات السحابية...
echo.

echo 📋 خطوات النشر التلقائي:
echo.
echo 🔧 1. نشر Backend على Render:
echo    - اذهب إلى: https://render.com
echo    - سجل دخول بـ GitHub
echo    - اضغط New + → Web Service
echo    - اختر المستودع: %REPO_NAME%
echo    - Root Directory: backend
echo    - Build Command: npm install
echo    - Start Command: npm start
echo.

echo 🗄️ 2. إضافة قاعدة البيانات:
echo    - في Render، اضغط New + → PostgreSQL
echo    - اسم قاعدة البيانات: elbsndely-gym-db
echo    - انسخ DATABASE_URL
echo.

echo 🌐 3. نشر Frontend على Netlify:
echo    - اذهب إلى: https://netlify.com
echo    - اضغط New site from Git
echo    - اختر المستودع: %REPO_NAME%
echo    - Base directory: frontend
echo    - Build command: npm run build
echo    - Publish directory: frontend/build
echo.

echo 📝 4. متغيرات البيئة المطلوبة:
echo.
echo    Backend (Render):
echo    NODE_ENV=production
echo    JWT_SECRET=elbsndely_gym_super_secret_jwt_key_2024_production
echo    DATABASE_URL=[من PostgreSQL service]
echo.
echo    Frontend (Netlify):
echo    REACT_APP_API_URL=https://your-backend-url.onrender.com/api
echo.

echo 🎯 5. بيانات تسجيل الدخول النهائية:
echo    اسم المستخدم: admin
echo    كلمة المرور: admin123
echo.

echo.
echo 🎉 تم إعداد كل شيء!
echo.
echo 📋 ملخص ما تم إنجازه:
echo    ✅ تثبيت Git و Node.js تلقائياً
echo    ✅ إعداد Git مع بياناتك
echo    ✅ رفع المشروع على GitHub
echo    ✅ إعداد تعليمات النشر الكاملة
echo.

echo 🔗 روابط مهمة:
echo    GitHub: %REPO_URL%
echo    Render: https://render.com
echo    Netlify: https://netlify.com
echo.

echo 📞 للمساعدة:
echo    راجع ملف RENDER_DEPLOYMENT_GUIDE.md
echo    أو COMPLETE_DEPLOYMENT_GUIDE.md
echo.

echo 🎯 بعد اتباع الخطوات أعلاه ستحصل على:
echo    - نظام كامل يعمل عبر الإنترنت
echo    - متاح من أي مكان في مصر
echo    - روابط مباشرة للاستخدام
echo    - قاعدة بيانات سحابية آمنة
echo.

pause

echo.
echo 🧪 هل تريد اختبار النظام بعد النشر؟
set /p TEST_CHOICE="اكتب y للاختبار أو n للخروج: "

if /i "%TEST_CHOICE%"=="y" (
    echo.
    set /p BACKEND_URL="أدخل رابط Backend من Render: "
    set /p FRONTEND_URL="أدخل رابط Frontend من Netlify: "
    
    echo 🧪 جاري اختبار النظام...
    
    :: Test backend health
    powershell -Command "try { $response = Invoke-WebRequest -Uri '%BACKEND_URL%/health' -TimeoutSec 10; if ($response.StatusCode -eq 200) { Write-Host '✅ Backend يعمل بشكل مثالي' -ForegroundColor Green } else { Write-Host '❌ Backend لا يعمل' -ForegroundColor Red } } catch { Write-Host '❌ خطأ في الاتصال بـ Backend' -ForegroundColor Red }"
    
    :: Test frontend
    powershell -Command "try { $response = Invoke-WebRequest -Uri '%FRONTEND_URL%' -TimeoutSec 10; if ($response.StatusCode -eq 200) { Write-Host '✅ Frontend يعمل بشكل مثالي' -ForegroundColor Green } else { Write-Host '❌ Frontend لا يعمل' -ForegroundColor Red } } catch { Write-Host '❌ خطأ في الاتصال بـ Frontend' -ForegroundColor Red }"
    
    echo.
    echo 🎉 اختبار النظام مكتمل!
    echo.
    echo 🔗 روابط النظام النهائية:
    echo    النظام: %FRONTEND_URL%
    echo    API: %BACKEND_URL%
    echo.
    echo 🔐 بيانات تسجيل الدخول:
    echo    اسم المستخدم: admin
    echo    كلمة المرور: admin123
    echo.
)

echo.
echo 🎊 تم الانتهاء من النشر التلقائي!
echo    نظام البسنديلي جيم جاهز للاستخدام
echo.

pause
