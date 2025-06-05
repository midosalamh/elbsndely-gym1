#!/bin/bash

echo "🚀 إعداد مشروع البسنديلي جيم..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت. يرجى تثبيت Node.js أولاً"
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL غير مثبت. يرجى تثبيت PostgreSQL أولاً"
    exit 1
fi

echo "📦 تثبيت dependencies للـ Backend..."
cd backend
npm install

echo "🗄️ إعداد قاعدة البيانات..."
# Create database if it doesn't exist
createdb elbsndely_gym 2>/dev/null || echo "قاعدة البيانات موجودة بالفعل"

echo "🌱 تشغيل seed script..."
npm run seed

echo "📦 تثبيت dependencies للـ Frontend..."
cd ../frontend
npm install

echo "📱 تثبيت dependencies للـ Mobile App..."
cd ../mobile
npm install

echo "✅ تم إعداد المشروع بنجاح!"
echo ""
echo "🎯 لتشغيل المشروع:"
echo "Backend: cd backend && npm run dev"
echo "Frontend: cd frontend && npm start"
echo "Mobile: cd mobile && npm run android"
echo ""
echo "🔑 بيانات تسجيل الدخول الافتراضية:"
echo "المدير: admin / admin123456"
echo "الموظف: receptionist / receptionist123"
