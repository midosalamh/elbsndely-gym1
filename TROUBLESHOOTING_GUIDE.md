# 🛠️ دليل استكشاف الأخطاء وحلولها

## 🎯 المشاكل الشائعة وحلولها السريعة

---

## 🚂 مشاكل Railway (Backend)

### ❌ مشكلة: "Build Failed"

**الأعراض**:
- رسالة خطأ في Deployments
- Backend لا يعمل
- رسالة "Application failed to start"

**الأسباب المحتملة**:
1. مجلد `backend` غير موجود
2. ملف `package.json` مفقود
3. خطأ في dependencies

**الحلول**:

#### الحل 1: تحقق من هيكل المشروع
```
elbsndely-gym/
├── backend/
│   ├── package.json ✅
│   ├── server.js ✅
│   └── ...
└── frontend/
    ├── package.json ✅
    └── ...
```

#### الحل 2: تحقق من Root Directory
1. في Railway، اذهب إلى **Settings**
2. تأكد من أن **Root Directory** = `backend`
3. احفظ واعد النشر

#### الحل 3: تحقق من package.json
```json
{
  "name": "elbsndely-gym-backend",
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### ❌ مشكلة: "Database Connection Failed"

**الأعراض**:
- رسالة "Cannot connect to database"
- خطأ في logs: "ECONNREFUSED"

**الحلول**:

#### الحل 1: تحقق من PostgreSQL Service
1. في Railway، تأكد من وجود **PostgreSQL service**
2. إذا لم يكن موجود، أضفه: **New Service** > **Database** > **PostgreSQL**

#### الحل 2: تحقق من DATABASE_URL
1. في PostgreSQL service، انسخ **DATABASE_URL**
2. تأكد من أنه متاح في Backend service
3. إذا لم يكن موجود، أضفه يدوياً

#### الحل 3: انتظر اكتمال الإعداد
- قاعدة البيانات تحتاج 2-3 دقائق للإعداد
- أعد تشغيل Backend بعد اكتمال قاعدة البيانات

### ❌ مشكلة: "Environment Variables Missing"

**الأعراض**:
- خطأ "JWT_SECRET is not defined"
- مشاكل في المصادقة

**الحل**:
1. اذهب إلى **Variables** في Backend service
2. أضف المتغيرات المطلوبة:
```
NODE_ENV=production
JWT_SECRET=elbsndely_gym_super_secret_jwt_key_2024_production
```

---

## 🌐 مشاكل Netlify (Frontend)

### ❌ مشكلة: "Build Failed"

**الأعراض**:
- رسالة خطأ في Deploy log
- الموقع لا يعمل
- صفحة خطأ 404

**الحلول**:

#### الحل 1: تحقق من Build Settings
```
Base directory: frontend
Build command: npm run build
Publish directory: frontend/build
```

#### الحل 2: تحقق من package.json في Frontend
```json
{
  "name": "elbsndely-gym-frontend",
  "scripts": {
    "build": "react-scripts build"
  }
}
```

#### الحل 3: تحقق من Node.js Version
1. في **Site settings** > **Build & deploy**
2. أضف متغير بيئة:
```
NODE_VERSION=18
```

### ❌ مشكلة: "Cannot Connect to Backend"

**الأعراض**:
- رسالة "Network Error"
- خطأ CORS في Console
- تسجيل الدخول لا يعمل

**الحلول**:

#### الحل 1: تحقق من REACT_APP_API_URL
1. في **Site settings** > **Environment variables**
2. تأكد من وجود:
```
REACT_APP_API_URL=https://your-backend-url.up.railway.app/api
```
3. **مهم**: يجب أن ينتهي بـ `/api`

#### الحل 2: تحقق من Backend URL
1. اذهب إلى Railway
2. انسخ الرابط من **Networking**
3. تأكد من أنه يعمل: `https://your-backend.railway.app/health`

#### الحل 3: أعد النشر
1. في Netlify، اذهب إلى **Deploys**
2. اضغط **Trigger deploy**
3. انتظر اكتمال البناء

### ❌ مشكلة: "Environment Variables Not Working"

**الأعراض**:
- `process.env.REACT_APP_API_URL` يعطي `undefined`
- Frontend يحاول الاتصال بـ localhost

**الحل**:
1. تأكد من أن المتغير يبدأ بـ `REACT_APP_`
2. أعد نشر الموقع بعد إضافة المتغيرات
3. تحقق من Console في المتصفح

---

## 🔗 مشاكل الاتصال بين الخدمات

### ❌ مشكلة: "CORS Error"

**الأعراض**:
```
Access to fetch at 'https://backend.railway.app/api/auth/login' 
from origin 'https://frontend.netlify.app' has been blocked by CORS policy
```

**الحلول**:

#### الحل 1: تحقق من CORS في Backend
في ملف `server.js`:
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://your-frontend-url.netlify.app'
];
```

#### الحل 2: أضف Frontend URL في Railway
```
FRONTEND_URL=https://your-frontend-url.netlify.app
```

#### الحل 3: تحقق من الروابط
- تأكد من أن Frontend URL صحيح
- تأكد من أن Backend URL صحيح
- لا توجد أخطاء إملائية

### ❌ مشكلة: "Authentication Failed"

**الأعراض**:
- "Invalid credentials" رغم صحة البيانات
- لا يمكن تسجيل الدخول

**الحلول**:

#### الحل 1: تحقق من قاعدة البيانات
1. تأكد من أن PostgreSQL يعمل
2. تحقق من logs في Railway
3. انتظر اكتمال إعداد قاعدة البيانات

#### الحل 2: تحقق من المستخدم الافتراضي
البيانات الصحيحة:
```
اسم المستخدم: admin
كلمة المرور: admin123
```

#### الحل 3: أعد تشغيل Backend
1. في Railway، اضغط **Restart**
2. انتظر إعادة التشغيل
3. جرب تسجيل الدخول مرة أخرى

---

## 🔍 أدوات التشخيص

### تحقق من حالة الخدمات:

#### Backend Health Check:
```
https://your-backend-url.railway.app/health
```
**النتيجة المتوقعة**:
```json
{
  "status": "success",
  "message": "الخادم يعمل بشكل طبيعي"
}
```

#### Frontend Check:
```
https://your-frontend-url.netlify.app
```
**النتيجة المتوقعة**: صفحة تسجيل الدخول

### فحص Logs:

#### Railway Logs:
1. اذهب إلى **Deployments**
2. اضغط على آخر deployment
3. راجع **Build logs** و **Runtime logs**

#### Netlify Logs:
1. اذهب إلى **Deploys**
2. اضغط على آخر deploy
3. راجع **Deploy log**

### فحص Network في المتصفح:

1. اضغط **F12**
2. اذهب إلى **Network**
3. جرب تسجيل الدخول
4. راجع الطلبات والاستجابات

---

## 📞 الحصول على المساعدة

### معلومات مطلوبة عند طلب المساعدة:

1. **رابط Railway**: `https://railway.app/project/xxxxx`
2. **رابط Netlify**: `https://app.netlify.com/sites/xxxxx`
3. **رسالة الخطأ الكاملة**
4. **لقطة شاشة للخطأ**
5. **الخطوة التي فشلت**

### مصادر المساعدة:

- **Railway Discord**: https://discord.gg/railway
- **Netlify Community**: https://community.netlify.com/
- **Stack Overflow**: ابحث عن الخطأ المحدد

---

## ✅ قائمة التحقق السريع

عند مواجهة أي مشكلة، تحقق من:

- [ ] هل الروابط صحيحة؟
- [ ] هل متغيرات البيئة مضبوطة؟
- [ ] هل الخدمات تعمل؟
- [ ] هل تم إعادة النشر بعد التغييرات؟
- [ ] هل انتظرت وقت كافي للإعداد؟

**💡 نصيحة**: معظم المشاكل تحل بإعادة النشر وانتظار بضع دقائق!
