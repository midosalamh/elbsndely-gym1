#!/bin/bash

echo "🧪 بدء اختبار نظام البسنديلي جيم الشامل..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if PostgreSQL is running
check_postgres() {
    print_status "فحص PostgreSQL..."
    if pg_isready -q; then
        print_success "PostgreSQL يعمل بشكل صحيح"
        return 0
    else
        print_error "PostgreSQL غير متاح. يرجى تشغيله أولاً"
        return 1
    fi
}

# Check if Node.js is installed
check_node() {
    print_status "فحص Node.js..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js متاح - الإصدار: $NODE_VERSION"
        return 0
    else
        print_error "Node.js غير مثبت"
        return 1
    fi
}

# Setup database
setup_database() {
    print_status "إعداد قاعدة البيانات..."
    
    # Create database if it doesn't exist
    if ! psql -lqt | cut -d \| -f 1 | grep -qw elbsndely_gym; then
        print_status "إنشاء قاعدة البيانات..."
        createdb elbsndely_gym
        if [ $? -eq 0 ]; then
            print_success "تم إنشاء قاعدة البيانات"
        else
            print_error "فشل في إنشاء قاعدة البيانات"
            return 1
        fi
    else
        print_success "قاعدة البيانات موجودة بالفعل"
    fi
}

# Install backend dependencies
setup_backend() {
    print_status "إعداد Backend..."
    cd backend
    
    if [ ! -d "node_modules" ]; then
        print_status "تثبيت dependencies..."
        npm install
        if [ $? -ne 0 ]; then
            print_error "فشل في تثبيت backend dependencies"
            return 1
        fi
    fi
    
    # Copy .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        print_status "إنشاء ملف .env..."
        cp .env.example .env
        print_warning "يرجى تحديث ملف .env بالإعدادات الصحيحة"
    fi
    
    # Run migrations and seed
    print_status "تشغيل migrations و seed..."
    npm run migrate
    npm run seed
    
    cd ..
    print_success "تم إعداد Backend بنجاح"
}

# Install frontend dependencies
setup_frontend() {
    print_status "إعداد Frontend..."
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        print_status "تثبيت dependencies..."
        npm install
        if [ $? -ne 0 ]; then
            print_error "فشل في تثبيت frontend dependencies"
            return 1
        fi
    fi
    
    cd ..
    print_success "تم إعداد Frontend بنجاح"
}

# Start backend server
start_backend() {
    print_status "تشغيل Backend Server..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    print_status "انتظار تشغيل Backend..."
    sleep 5
    
    # Check if backend is running
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        print_success "Backend Server يعمل على المنفذ 5000"
        return 0
    else
        print_error "فشل في تشغيل Backend Server"
        return 1
    fi
}

# Test backend API
test_backend() {
    print_status "اختبار Backend API..."
    cd backend
    node test-api.js
    cd ..
}

# Start frontend
start_frontend() {
    print_status "تشغيل Frontend Dashboard..."
    cd frontend
    npm start &
    FRONTEND_PID=$!
    cd ..
    
    print_status "انتظار تشغيل Frontend..."
    sleep 10
    
    print_success "Frontend Dashboard يعمل على المنفذ 3000"
}

# Cleanup function
cleanup() {
    print_status "إيقاف الخوادم..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    print_success "تم إيقاف جميع الخوادم"
}

# Trap to cleanup on exit
trap cleanup EXIT

# Main execution
main() {
    print_status "بدء اختبار النظام الشامل..."
    
    # Prerequisites check
    check_node || exit 1
    check_postgres || exit 1
    
    # Setup
    setup_database || exit 1
    setup_backend || exit 1
    setup_frontend || exit 1
    
    # Start services
    start_backend || exit 1
    test_backend
    start_frontend
    
    print_success "تم تشغيل النظام بنجاح!"
    echo ""
    echo "🌐 الروابط:"
    echo "   Backend API: http://localhost:5000"
    echo "   Frontend Dashboard: http://localhost:3000"
    echo ""
    echo "🔑 بيانات الدخول:"
    echo "   المدير: admin / admin123456"
    echo "   الموظف: receptionist / receptionist123"
    echo ""
    echo "اضغط Ctrl+C لإيقاف النظام"
    
    # Keep script running
    wait
}

# Run main function
main
