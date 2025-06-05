@echo off
echo ========================================
echo    رفع مشروع البسنديلي جيم على GitHub
echo ========================================
echo.

echo 🔧 تهيئة Git...
git init

echo 📂 إضافة المستودع البعيد...
git remote add origin https://github.com/midosalamh/elbsndely-gym.git

echo 📤 إضافة جميع الملفات...
git add .

echo 💬 إنشاء commit...
git commit -m "إضافة نظام إدارة الصالة الرياضية - البسنديلي جيم"

echo 🌿 تحديد الـ branch الرئيسي...
git branch -M main

echo 🚀 رفع الملفات إلى GitHub...
git push -u origin main

echo.
echo ✅ تم رفع المشروع بنجاح!
echo 🔗 رابط المستودع: https://github.com/midosalamh/elbsndely-gym
echo.
echo 📋 الخطوة التالية:
echo    1. اذهب إلى GitHub وتأكد من وجود الملفات
echo    2. ارجع إلى Netlify واختر المستودع الجديد
echo    3. اتبع دليل النشر
echo.
pause
