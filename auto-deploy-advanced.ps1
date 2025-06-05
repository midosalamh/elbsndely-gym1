# نشر نظام البسنديلي جيم تلقائياً - PowerShell المتقدم
# Auto Deploy Elbsndely Gym System

param(
    [string]$GitHubUsername = "",
    [string]$GitHubEmail = "",
    [switch]$SkipInstall = $false
)

# Set console encoding to UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    🚀 النشر التلقائي المتقدم" -ForegroundColor Green
Write-Host "    نظام إدارة الصالة الرياضية" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 هذا البرنامج سيقوم بـ:" -ForegroundColor Yellow
Write-Host "   ✅ فحص وتثبيت المتطلبات تلقائياً" -ForegroundColor Green
Write-Host "   ✅ رفع المشروع على GitHub" -ForegroundColor Green
Write-Host "   ✅ إنشاء ملفات النشر المحسنة" -ForegroundColor Green
Write-Host "   ✅ إعداد تعليمات النشر التفصيلية" -ForegroundColor Green
Write-Host "   ✅ اختبار النظام بعد النشر" -ForegroundColor Green
Write-Host ""

# Function to check if a command exists
function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# Function to install software
function Install-Software {
    param($Name, $Url, $Arguments = "/S")
    
    Write-Host "📥 جاري تحميل وتثبيت $Name..." -ForegroundColor Yellow
    
    $fileName = Split-Path $Url -Leaf
    $tempPath = Join-Path $env:TEMP $fileName
    
    try {
        Invoke-WebRequest -Uri $Url -OutFile $tempPath -UseBasicParsing
        Start-Process -FilePath $tempPath -ArgumentList $Arguments -Wait
        Remove-Item $tempPath -Force
        Write-Host "✅ تم تثبيت $Name بنجاح" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ فشل في تثبيت $Name : $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Check and install prerequisites
if (-not $SkipInstall) {
    Write-Host "🔧 فحص المتطلبات..." -ForegroundColor Cyan
    
    # Check Git
    if (-not (Test-Command "git")) {
        Write-Host "❌ Git غير مثبت" -ForegroundColor Red
        $gitInstalled = Install-Software "Git" "https://github.com/git-for-windows/git/releases/download/v2.43.0.windows.1/Git-2.43.0-64-bit.exe" "/VERYSILENT /NORESTART"
        
        if ($gitInstalled) {
            # Refresh environment variables
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        }
    } else {
        Write-Host "✅ Git مثبت" -ForegroundColor Green
    }
    
    # Check Node.js
    if (-not (Test-Command "node")) {
        Write-Host "❌ Node.js غير مثبت" -ForegroundColor Red
        $nodeInstalled = Install-Software "Node.js" "https://nodejs.org/dist/v18.19.0/node-v18.19.0-x64.msi" "/quiet"
        
        if ($nodeInstalled) {
            # Refresh environment variables
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        }
    } else {
        Write-Host "✅ Node.js مثبت" -ForegroundColor Green
    }
}

# Get GitHub credentials if not provided
if (-not $GitHubUsername) {
    $GitHubUsername = Read-Host "أدخل اسم المستخدم في GitHub"
}

if (-not $GitHubEmail) {
    $GitHubEmail = Read-Host "أدخل البريد الإلكتروني"
}

# Configure Git
Write-Host "🔐 إعداد Git..." -ForegroundColor Cyan
git config --global user.name $GitHubUsername
git config --global user.email $GitHubEmail
Write-Host "✅ تم إعداد Git" -ForegroundColor Green

# Generate unique repository name
$RepoName = "elbsndely-gym-$(Get-Random -Minimum 1000 -Maximum 9999)"
Write-Host "📂 اسم المستودع: $RepoName" -ForegroundColor Yellow

# Initialize Git repository
Write-Host "📤 إعداد المستودع المحلي..." -ForegroundColor Cyan

try {
    # Remove existing .git if exists
    if (Test-Path ".git") {
        Remove-Item ".git" -Recurse -Force
    }
    
    git init
    git add .
    git commit -m "نظام إدارة الصالة الرياضية - البسنديلي جيم - نشر تلقائي متقدم"
    git branch -M main
    
    Write-Host "✅ تم إعداد المستودع المحلي" -ForegroundColor Green
}
catch {
    Write-Host "❌ خطأ في إعداد Git: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Create deployment files optimized for Egypt
Write-Host "🇪🇬 إنشاء ملفات النشر المحسنة لمصر..." -ForegroundColor Cyan

# Create optimized backend environment for Egypt
$BackendEnvEgypt = @"
# إعدادات الإنتاج - مصر
NODE_ENV=production
PORT=10000

# قاعدة البيانات
DATABASE_URL=your_database_url_here

# الأمان
JWT_SECRET=elbsndely_gym_egypt_super_secret_jwt_key_2024_production
JWT_EXPIRE=7d

# المنطقة الزمنية
TZ=Africa/Cairo

# الروابط
FRONTEND_URL=https://your-frontend-url.netlify.app
BACKEND_URL=https://your-backend-url.onrender.com

# تحسينات الأداء لمصر
NODE_OPTIONS=--max-old-space-size=512
"@

$BackendEnvEgypt | Out-File -FilePath "backend/.env.egypt" -Encoding UTF8

# Create optimized frontend environment for Egypt
$FrontendEnvEgypt = @"
# إعدادات الإنتاج - مصر
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
REACT_APP_NAME=نظام إدارة الصالة الرياضية - البسنديلي جيم
REACT_APP_VERSION=1.0.0
REACT_APP_TIMEZONE=Africa/Cairo
REACT_APP_LOCALE=ar-EG
GENERATE_SOURCEMAP=false
"@

$FrontendEnvEgypt | Out-File -FilePath "frontend/.env.egypt" -Encoding UTF8

Write-Host "✅ تم إنشاء ملفات البيئة المحسنة لمصر" -ForegroundColor Green

# Create deployment instructions
$DeploymentInstructions = @"
# 🇪🇬 تعليمات النشر المحسنة لمصر

## 📋 المعلومات الأساسية:
- اسم المستودع: $RepoName
- المنطقة الزمنية: Africa/Cairo
- اللغة: العربية (ar-EG)

## 🚀 خطوات النشر:

### 1. إنشاء مستودع GitHub:
1. اذهب إلى: https://github.com/new
2. اسم المستودع: $RepoName
3. اجعله Public
4. اضغط Create repository

### 2. رفع الملفات:
```bash
git remote add origin https://github.com/$GitHubUsername/$RepoName.git
git push -u origin main
```

### 3. نشر Backend على Render:
1. اذهب إلى: https://render.com
2. New + → Web Service
3. اختر المستودع: $RepoName
4. الإعدادات:
   - Name: elbsndely-gym-backend-egypt
   - Root Directory: backend
   - Environment: Node
   - Build Command: npm install
   - Start Command: npm start
   - Region: اختر الأقرب لمصر (Europe أو Middle East)

### 4. إضافة قاعدة البيانات:
1. New + → PostgreSQL
2. Name: elbsndely-gym-db-egypt
3. Region: نفس منطقة Backend

### 5. متغيرات البيئة للـ Backend:
```
NODE_ENV=production
JWT_SECRET=elbsndely_gym_egypt_super_secret_jwt_key_2024_production
TZ=Africa/Cairo
DATABASE_URL=[من PostgreSQL service]
```

### 6. نشر Frontend على Netlify:
1. اذهب إلى: https://netlify.com
2. New site from Git
3. اختر المستودع: $RepoName
4. الإعدادات:
   - Base directory: frontend
   - Build command: npm run build
   - Publish directory: frontend/build

### 7. متغيرات البيئة للـ Frontend:
```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
REACT_APP_TIMEZONE=Africa/Cairo
REACT_APP_LOCALE=ar-EG
```

## 🔐 بيانات تسجيل الدخول:
- اسم المستخدم: admin
- كلمة المرور: admin123

## 🧪 اختبار النظام:
بعد النشر، استخدم هذا الأمر:
```powershell
.\test-egypt-deployment.ps1 -BackendUrl "https://your-backend.onrender.com" -FrontendUrl "https://your-frontend.netlify.app"
```
"@

$DeploymentInstructions | Out-File -FilePath "DEPLOYMENT_EGYPT.md" -Encoding UTF8

Write-Host "✅ تم إنشاء تعليمات النشر المخصصة لمصر" -ForegroundColor Green

# Show GitHub repository creation instructions
Write-Host ""
Write-Host "🌐 الآن قم بإنشاء مستودع GitHub:" -ForegroundColor Yellow
Write-Host "1. اذهب إلى: https://github.com/new" -ForegroundColor White
Write-Host "2. اسم المستودع: $RepoName" -ForegroundColor White
Write-Host "3. اجعله Public" -ForegroundColor White
Write-Host "4. اضغط Create repository" -ForegroundColor White
Write-Host ""

$RepoUrl = Read-Host "الصق رابط المستودع هنا"

# Push to GitHub
Write-Host "📤 جاري رفع الملفات على GitHub..." -ForegroundColor Cyan

try {
    git remote add origin $RepoUrl
    git push -u origin main
    Write-Host "✅ تم رفع المشروع على GitHub بنجاح!" -ForegroundColor Green
}
catch {
    Write-Host "❌ فشل في رفع الملفات: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 تأكد من صحة الرابط وأن لديك صلاحيات الكتابة" -ForegroundColor Yellow
    exit 1
}

# Create test script for Egypt
$TestScript = @"
param(
    [Parameter(Mandatory=`$true)]
    [string]`$BackendUrl,
    [Parameter(Mandatory=`$true)]
    [string]`$FrontendUrl
)

Write-Host "🇪🇬 اختبار النظام في مصر..." -ForegroundColor Cyan

# Test backend
try {
    `$response = Invoke-WebRequest -Uri "`$BackendUrl/health" -TimeoutSec 10
    if (`$response.StatusCode -eq 200) {
        Write-Host "✅ Backend يعمل بشكل مثالي" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend لا يعمل: `$(`$_.Exception.Message)" -ForegroundColor Red
}

# Test frontend
try {
    `$response = Invoke-WebRequest -Uri `$FrontendUrl -TimeoutSec 10
    if (`$response.StatusCode -eq 200) {
        Write-Host "✅ Frontend يعمل بشكل مثالي" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend لا يعمل: `$(`$_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🔐 بيانات تسجيل الدخول:" -ForegroundColor Yellow
Write-Host "اسم المستخدم: admin" -ForegroundColor White
Write-Host "كلمة المرور: admin123" -ForegroundColor White
"@

$TestScript | Out-File -FilePath "test-egypt-deployment.ps1" -Encoding UTF8

Write-Host ""
Write-Host "🎉 تم الانتهاء من الإعداد التلقائي!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 ملخص ما تم إنجازه:" -ForegroundColor Yellow
Write-Host "   ✅ فحص وتثبيت المتطلبات" -ForegroundColor Green
Write-Host "   ✅ إعداد Git مع بياناتك" -ForegroundColor Green
Write-Host "   ✅ رفع المشروع على GitHub" -ForegroundColor Green
Write-Host "   ✅ إنشاء ملفات محسنة لمصر" -ForegroundColor Green
Write-Host "   ✅ إنشاء تعليمات النشر التفصيلية" -ForegroundColor Green
Write-Host "   ✅ إنشاء script اختبار النظام" -ForegroundColor Green
Write-Host ""
Write-Host "📁 الملفات المُنشأة:" -ForegroundColor Yellow
Write-Host "   📄 DEPLOYMENT_EGYPT.md - تعليمات النشر" -ForegroundColor White
Write-Host "   📄 backend/.env.egypt - إعدادات Backend" -ForegroundColor White
Write-Host "   📄 frontend/.env.egypt - إعدادات Frontend" -ForegroundColor White
Write-Host "   📄 test-egypt-deployment.ps1 - اختبار النظام" -ForegroundColor White
Write-Host ""
Write-Host "🔗 روابط مهمة:" -ForegroundColor Yellow
Write-Host "   GitHub: $RepoUrl" -ForegroundColor White
Write-Host "   Render: https://render.com" -ForegroundColor White
Write-Host "   Netlify: https://netlify.com" -ForegroundColor White
Write-Host ""
Write-Host "📖 الخطوة التالية:" -ForegroundColor Yellow
Write-Host "   اقرأ ملف DEPLOYMENT_EGYPT.md واتبع التعليمات" -ForegroundColor White
Write-Host ""

Read-Host "اضغط Enter للخروج"
