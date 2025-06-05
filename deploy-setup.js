const fs = require('fs');
const path = require('path');

console.log('🚀 إعداد النشر السحابي لنظام إدارة الصالة الرياضية');
console.log('=' .repeat(60));

// Function to update environment files
const updateEnvFile = (filePath, updates) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    Object.entries(updates).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (content.match(regex)) {
        content = content.replace(regex, `${key}=${value}`);
      } else {
        content += `\n${key}=${value}`;
      }
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ تم تحديث ${filePath}`);
  } catch (error) {
    console.log(`❌ خطأ في تحديث ${filePath}:`, error.message);
  }
};

// Function to create deployment guide
const createDeploymentGuide = () => {
  const guide = `# دليل النشر السحابي لنظام إدارة الصالة الرياضية

## 1. نشر الـ Backend

### خيار أ: Railway (مُوصى به)
1. اذهب إلى https://railway.app
2. قم بإنشاء حساب جديد أو تسجيل الدخول
3. اضغط على "New Project"
4. اختر "Deploy from GitHub repo"
5. اختر مجلد backend
6. أضف متغيرات البيئة التالية:
   - NODE_ENV=production
   - JWT_SECRET=elbsndely_gym_super_secret_jwt_key_2024
   - DATABASE_URL=(سيتم إنشاؤها تلقائياً عند إضافة PostgreSQL)

### خيار ب: Heroku
1. قم بتثبيت Heroku CLI
2. \`heroku create elbsndely-gym-backend\`
3. \`heroku addons:create heroku-postgresql:hobby-dev\`
4. \`heroku config:set NODE_ENV=production\`
5. \`heroku config:set JWT_SECRET=elbsndely_gym_super_secret_jwt_key_2024\`
6. \`git push heroku main\`

## 2. نشر الـ Frontend

### خيار أ: Netlify (مُوصى به)
1. اذهب إلى https://netlify.com
2. اضغط على "New site from Git"
3. اختر مجلد frontend
4. Build command: \`npm run build\`
5. Publish directory: \`build\`
6. أضف متغير البيئة:
   - REACT_APP_API_URL=https://your-backend-url.com/api

### خيار ب: Vercel
1. اذهب إلى https://vercel.com
2. اضغط على "New Project"
3. اختر مجلد frontend
4. أضف متغير البيئة:
   - REACT_APP_API_URL=https://your-backend-url.com/api

## 3. إعداد قاعدة البيانات

### PostgreSQL (Railway/Heroku)
- سيتم إنشاؤها تلقائياً
- ستحصل على DATABASE_URL

### MongoDB Atlas (اختياري)
1. اذهب إلى https://cloud.mongodb.com
2. أنشئ cluster جديد
3. احصل على connection string
4. أضفه كـ DATABASE_URL

## 4. بيانات تسجيل الدخول الافتراضية

اسم المستخدم: admin
كلمة المرور: admin123

## 5. الروابط النهائية

بعد النشر، ستحصل على:
- Frontend URL: https://your-app.netlify.app
- Backend URL: https://your-backend.railway.app
- API Health: https://your-backend.railway.app/health

## 6. اختبار النظام

1. افتح Frontend URL
2. سجل دخول بحساب المدير
3. اختبر إضافة عضو جديد
4. اختبر إنشاء اشتراك
5. اختبر تسجيل دفعة

## 7. الصيانة

- مراقبة logs في منصة الاستضافة
- تحديث متغيرات البيئة عند الحاجة
- عمل backup دوري لقاعدة البيانات
`;

  fs.writeFileSync('DEPLOYMENT_GUIDE.md', guide);
  console.log('✅ تم إنشاء دليل النشر: DEPLOYMENT_GUIDE.md');
};

// Function to create production environment files
const createProductionEnvFiles = () => {
  // Backend production env
  const backendProdEnv = `# Production Environment Variables for Backend
NODE_ENV=production
PORT=5000

# Database (PostgreSQL)
DATABASE_URL=your_database_url_here

# JWT Configuration
JWT_SECRET=elbsndely_gym_super_secret_jwt_key_2024
JWT_EXPIRE=7d

# URLs
FRONTEND_URL=https://your-frontend-domain.com
BACKEND_URL=https://your-backend-domain.com

# WhatsApp/Twilio (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
`;

  fs.writeFileSync('backend/.env.production', backendProdEnv);
  console.log('✅ تم إنشاء backend/.env.production');

  // Frontend production env
  const frontendProdEnv = `# Production Environment Variables for Frontend
REACT_APP_API_URL=https://your-backend-domain.com/api
REACT_APP_NAME=نظام إدارة الصالة الرياضية
REACT_APP_VERSION=1.0.0
GENERATE_SOURCEMAP=false
`;

  fs.writeFileSync('frontend/.env.production', frontendProdEnv);
  console.log('✅ تم إنشاء frontend/.env.production');
};

// Function to create package.json scripts for deployment
const updatePackageJsonScripts = () => {
  // Update backend package.json
  try {
    const backendPackagePath = 'backend/package.json';
    const backendPackage = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));
    
    backendPackage.scripts = {
      ...backendPackage.scripts,
      "start": "node server.js",
      "dev": "nodemon server.js",
      "build": "echo 'No build step required for Node.js backend'",
      "deploy:railway": "railway deploy",
      "deploy:heroku": "git push heroku main"
    };

    fs.writeFileSync(backendPackagePath, JSON.stringify(backendPackage, null, 2));
    console.log('✅ تم تحديث backend/package.json');
  } catch (error) {
    console.log('❌ خطأ في تحديث backend/package.json:', error.message);
  }

  // Update frontend package.json
  try {
    const frontendPackagePath = 'frontend/package.json';
    const frontendPackage = JSON.parse(fs.readFileSync(frontendPackagePath, 'utf8'));
    
    frontendPackage.scripts = {
      ...frontendPackage.scripts,
      "build:prod": "REACT_APP_API_URL=https://your-backend-domain.com/api npm run build",
      "deploy:netlify": "netlify deploy --prod --dir=build",
      "deploy:vercel": "vercel --prod"
    };

    fs.writeFileSync(frontendPackagePath, JSON.stringify(frontendPackage, null, 2));
    console.log('✅ تم تحديث frontend/package.json');
  } catch (error) {
    console.log('❌ خطأ في تحديث frontend/package.json:', error.message);
  }
};

// Main execution
console.log('\n📁 إنشاء ملفات النشر...');
createProductionEnvFiles();
createDeploymentGuide();
updatePackageJsonScripts();

console.log('\n🎯 ملخص الإعداد:');
console.log('✅ تم إنشاء ملفات البيئة للإنتاج');
console.log('✅ تم إنشاء دليل النشر');
console.log('✅ تم تحديث scripts النشر');
console.log('✅ تم إعداد ملفات التكوين للمنصات السحابية');

console.log('\n📋 الخطوات التالية:');
console.log('1. راجع ملف DEPLOYMENT_GUIDE.md');
console.log('2. اختر منصة الاستضافة (Railway + Netlify مُوصى بهما)');
console.log('3. قم بنشر Backend أولاً');
console.log('4. احصل على Backend URL وحدث Frontend');
console.log('5. قم بنشر Frontend');
console.log('6. اختبر النظام');

console.log('\n🌐 بعد النشر ستحصل على:');
console.log('- رابط النظام العام');
console.log('- نظام يعمل 24/7');
console.log('- وصول من أي جهاز ومتصفح');
console.log('- قاعدة بيانات سحابية آمنة');
