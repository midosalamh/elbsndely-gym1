# دليل النشر السحابي لنظام إدارة الصالة الرياضية

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
2. `heroku create elbsndely-gym-backend`
3. `heroku addons:create heroku-postgresql:hobby-dev`
4. `heroku config:set NODE_ENV=production`
5. `heroku config:set JWT_SECRET=elbsndely_gym_super_secret_jwt_key_2024`
6. `git push heroku main`

## 2. نشر الـ Frontend

### خيار أ: Netlify (مُوصى به)
1. اذهب إلى https://netlify.com
2. اضغط على "New site from Git"
3. اختر مجلد frontend
4. Build command: `npm run build`
5. Publish directory: `build`
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
