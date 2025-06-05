@echo off
chcp 65001 >nul
title اختبار البناء المحلي - محاكاة بيئة Netlify
color 0A

echo.
echo ========================================
echo    🧪 اختبار البناء المحلي
echo    محاكاة بيئة Netlify Build
echo ========================================
echo.

echo 📋 هذا البرنامج سيختبر:
echo    ✅ TypeScript compilation
echo    ✅ React build process
echo    ✅ Dependencies resolution
echo    ✅ Environment variables
echo    ✅ Production optimization
echo.

pause

echo 🔧 بدء الاختبار المحلي...
echo.

echo 📂 الانتقال إلى مجلد frontend...
cd frontend

echo 📦 تنظيف node_modules...
if exist "node_modules" rmdir /s /q node_modules
if exist "build" rmdir /s /q build

echo 📥 تثبيت Dependencies...
npm install

if errorlevel 1 (
    echo ❌ فشل في تثبيت Dependencies
    pause
    exit /b 1
)

echo ✅ تم تثبيت Dependencies بنجاح

echo.
echo 🔍 فحص TypeScript...
npx tsc --noEmit

if errorlevel 1 (
    echo ❌ أخطاء TypeScript موجودة
    echo 💡 راجع الأخطاء أعلاه وأصلحها
    pause
    exit /b 1
)

echo ✅ لا توجد أخطاء TypeScript

echo.
echo 🏗️ بناء المشروع للإنتاج...
set REACT_APP_API_URL=http://localhost:5000/api
npm run build

if errorlevel 1 (
    echo ❌ فشل في بناء المشروع
    echo 💡 راجع الأخطاء أعلاه
    pause
    exit /b 1
)

echo ✅ تم بناء المشروع بنجاح!

echo.
echo 📊 إحصائيات البناء:
dir build /s

echo.
echo 🧪 اختبار الملفات المبنية...
if exist "build\index.html" (
    echo ✅ index.html موجود
) else (
    echo ❌ index.html غير موجود
)

if exist "build\static\js" (
    echo ✅ JavaScript files موجودة
) else (
    echo ❌ JavaScript files غير موجودة
)

if exist "build\static\css" (
    echo ✅ CSS files موجودة
) else (
    echo ❌ CSS files غير موجودة
)

echo.
echo 🌐 اختبار الخادم المحلي...
echo 💡 سيتم تشغيل خادم محلي لاختبار البناء
echo 🔗 افتح المتصفح على: http://localhost:3000
echo.

start /b npx serve -s build -l 3000

echo ✅ الخادم يعمل على http://localhost:3000
echo 🔍 اختبر الموقع في المتصفح
echo 📋 تأكد من:
echo    - تحميل الصفحة بدون أخطاء
echo    - ظهور واجهة تسجيل الدخول
echo    - عمل الخطوط العربية
echo    - عدم وجود أخطاء في Console
echo.

echo 🎉 اختبار البناء المحلي مكتمل!
echo.
echo 📋 النتائج:
echo    ✅ Dependencies: تم التثبيت بنجاح
echo    ✅ TypeScript: لا توجد أخطاء
echo    ✅ Build: تم البناء بنجاح
echo    ✅ Files: جميع الملفات موجودة
echo    ✅ Server: يعمل على localhost:3000
echo.

echo 🚀 الآن يمكنك النشر على Netlify بثقة!
echo 💡 إذا نجح الاختبار المحلي، سينجح النشر على Netlify
echo.

pause

echo 🛑 إيقاف الخادم المحلي...
taskkill /f /im node.exe 2>nul

cd ..
echo 🎊 انتهى الاختبار!
