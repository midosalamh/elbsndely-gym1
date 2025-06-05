#!/bin/bash

echo "🚀 تشغيل جميع مكونات مشروع البسنديلي جيم..."

# Function to run command in new terminal
run_in_new_terminal() {
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "$1; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "$1" &
    else
        echo "يرجى تشغيل الأوامر التالية في terminals منفصلة:"
        echo "$1"
    fi
}

echo "🗄️ تشغيل Backend Server..."
run_in_new_terminal "cd backend && npm run dev"

sleep 3

echo "🌐 تشغيل Frontend Dashboard..."
run_in_new_terminal "cd frontend && npm start"

sleep 3

echo "📱 تشغيل Mobile App (Android)..."
run_in_new_terminal "cd mobile && npm run android"

echo "✅ تم تشغيل جميع المكونات!"
echo ""
echo "🌐 الروابط:"
echo "Backend API: http://localhost:5000"
echo "Frontend Dashboard: http://localhost:3000"
echo "Mobile App: على الجهاز/المحاكي"
echo ""
echo "🔑 بيانات تسجيل الدخول:"
echo "Dashboard - المدير: admin / admin123456"
echo "Dashboard - الموظف: receptionist / receptionist123"
