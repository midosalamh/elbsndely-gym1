@echo off
chcp 65001 >nul
title إصلاح مشكلة النشر على Netlify
color 0A

echo.
echo ========================================
echo    🔧 إصلاح مشكلة النشر على Netlify
echo    نظام إدارة الصالة الرياضية
echo ========================================
echo.

echo 📋 المشكلة التي تم حلها:
echo    ❌ خطأ TypeScript: MuiDataGrid غير موجود في Material-UI theme
echo    ✅ تم حذف MuiDataGrid من theme configuration
echo    ✅ تم الاعتماد على CSS styling بدلاً من theme
echo.

echo 🔧 التغييرات المطبقة:
echo    📄 تم تعديل frontend/src/index.tsx
echo    📄 تم حذف MuiDataGrid من components theme
echo    📄 تم الاحتفاظ بالأنماط في index.css
echo.

echo 📤 رفع التحديثات على GitHub...

:: Add the fixed files
git add frontend/src/index.tsx
git add fix-netlify-deployment.bat

:: Create commit
git commit -m "إصلاح مشكلة MuiDataGrid في theme - حل مشكلة النشر على Netlify"

:: Push to GitHub
git push origin main

if errorlevel 1 (
    echo ❌ فشل في رفع التحديثات
    echo 💡 تأكد من أن Git مُعد بشكل صحيح
    pause
    exit /b 1
)

echo ✅ تم رفع التحديثات بنجاح!

echo.
echo 🚀 الآن يمكنك إعادة النشر على Netlify:
echo.
echo 📋 خطوات إعادة النشر:
echo    1. اذهب إلى: https://app.netlify.com
echo    2. اختر مشروعك: charming-dasik-c37ebb
echo    3. اضغط "Trigger deploy" → "Deploy site"
echo    4. أو انتظر النشر التلقائي (سيحدث خلال دقائق)
echo.

echo 🔍 أو أنشئ مشروع جديد:
echo    1. اذهب إلى: https://netlify.com
echo    2. اضغط "Add new site" → "Import an existing project"
echo    3. اختر GitHub → elbsndely-gym1
echo    4. الإعدادات:
echo       Base directory: frontend
echo       Build command: npm run build
echo       Publish directory: frontend/build
echo.

echo 🌐 متغيرات البيئة المطلوبة:
echo    REACT_APP_API_URL=https://your-backend-url.onrender.com/api
echo.

echo 🎯 بعد النشر الناجح ستحصل على:
echo    ✅ Frontend يعمل بدون أخطاء TypeScript
echo    ✅ DataGrid يعمل بشكل طبيعي
echo    ✅ جميع الأنماط محفوظة
echo    ✅ رابط مباشر للنظام
echo.

echo 🔐 بيانات تسجيل الدخول:
echo    اسم المستخدم: admin
echo    كلمة المرور: admin123
echo.

echo 📞 في حالة استمرار المشاكل:
echo    📄 راجع ملف TROUBLESHOOTING_GUIDE.md
echo    📄 أو استخدم RENDER_DEPLOYMENT_GUIDE.md للنشر على Render
echo.

echo 🎉 تم إصلاح المشكلة بنجاح!
echo    الآن يمكن نشر Frontend على Netlify بدون مشاكل
echo.

pause
