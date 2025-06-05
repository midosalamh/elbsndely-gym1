# 🏋️‍♂️ نظام إدارة البسنديلي جيم

نظام شامل لإدارة الصالات الرياضية يتضمن لوحة تحكم ويب وتطبيق جوال للأعضاء مع نظام رسائل واتساب تلقائي.

## 🌟 المميزات

### 📊 لوحة التحكم (Dashboard)
- **إدارة الأعضاء**: تسجيل أعضاء جدد، تعديل البيانات، عرض التفاصيل
- **إدارة الاشتراكات**: أنواع اشتراكات متعددة، تجديد، تجميد، إلغاء
- **إدارة المدفوعات**: تسجيل المدفوعات، الإيصالات، الاستردادات
- **التقارير والإحصائيات**: تقارير مالية، إحصائيات الأعضاء، رسوم بيانية
- **نظام الرسائل**: رسائل واتساب تلقائية، رسائل تحفيزية، تذكيرات التجديد
- **إدارة المستخدمين**: أدوار متعددة (مدير، مدير صالة، موظف استقبال)

### 📱 تطبيق الأعضاء (Mobile App)
- **الملف الشخصي**: عرض وتعديل البيانات الشخصية
- **حالة الاشتراك**: عرض تفاصيل الاشتراك الحالي وتاريخ الانتهاء
- **سجل المدفوعات**: عرض تاريخ جميع المدفوعات
- **الرسائل**: استقبال رسائل من الصالة
- **نقاط الولاء**: نظام نقاط للأعضاء المميزين

### 🤖 الأتمتة والذكاء
- **رسائل واتساب تلقائية**: تذكيرات التجديد، رسائل ترحيب، رسائل تحفيزية
- **المهام المجدولة**: فحص الاشتراكات المنتهية، إرسال التذكيرات
- **نظام الإشعارات**: تنبيهات للموظفين عند انتهاء الاشتراكات

## 🛠️ التقنيات المستخدمة

### Backend
- **Node.js** مع **Express.js**
- **PostgreSQL** قاعدة البيانات
- **Sequelize** ORM
- **JWT** للمصادقة
- **Twilio** لرسائل الواتساب
- **Node-cron** للمهام المجدولة

### Frontend (Dashboard)
- **React.js** مع **TypeScript**
- **Material-UI (MUI)** للواجهة
- **Redux Toolkit** لإدارة الحالة
- **React Router** للتنقل
- **Recharts** للرسوم البيانية

### Mobile App
- **React Native** مع **TypeScript**
- **React Native Paper** للواجهة
- **Redux Toolkit** لإدارة الحالة
- **React Navigation** للتنقل

## 📁 هيكل المشروع

```
elbsndely-gym/
├── backend/                 # Backend API
│   ├── config/             # إعدادات قاعدة البيانات
│   ├── models/             # نماذج قاعدة البيانات
│   ├── routes/             # مسارات API
│   ├── middleware/         # Middleware functions
│   ├── services/           # خدمات (واتساب، مجدولة)
│   └── scripts/            # سكريبتات الإعداد
├── frontend/               # لوحة التحكم
│   ├── src/
│   │   ├── components/     # مكونات React
│   │   ├── pages/          # صفحات التطبيق
│   │   ├── store/          # Redux store
│   │   └── services/       # خدمات API
├── mobile/                 # تطبيق الجوال
│   ├── src/
│   │   ├── screens/        # شاشات التطبيق
│   │   ├── navigation/     # إعدادات التنقل
│   │   ├── store/          # Redux store
│   │   └── services/       # خدمات API
├── database/               # ملفات قاعدة البيانات
├── scripts/                # سكريبتات الإعداد والتشغيل
└── docs/                   # الوثائق
```

## 🚀 التثبيت والتشغيل

### المتطلبات
- **Node.js** (الإصدار 16 أو أحدث)
- **PostgreSQL** (الإصدار 12 أو أحدث)
- **npm** أو **yarn**
- **Android Studio** (للتطبيق الجوال)

### الإعداد السريع

#### Linux/Mac
```bash
# استنساخ المشروع
git clone https://github.com/your-repo/elbsndely-gym.git
cd elbsndely-gym

# تشغيل سكريبت الإعداد
chmod +x scripts/setup.sh
./scripts/setup.sh

# تشغيل جميع المكونات
chmod +x scripts/start-all.sh
./scripts/start-all.sh
```

#### Windows
```cmd
# استنساخ المشروع
git clone https://github.com/your-repo/elbsndely-gym.git
cd elbsndely-gym

# تشغيل سكريبت الإعداد
scripts\setup.bat
```

### الإعداد اليدوي

#### 1. إعداد قاعدة البيانات
```sql
-- إنشاء قاعدة البيانات
CREATE DATABASE elbsndely_gym;
```

#### 2. إعداد Backend
```bash
cd backend
npm install
cp .env.example .env
# تعديل ملف .env بالإعدادات المناسبة
npm run seed
npm run dev
```

#### 3. إعداد Frontend
```bash
cd frontend
npm install
npm start
```

#### 4. إعداد Mobile App
```bash
cd mobile
npm install
npm run android
```

### 🐳 التشغيل باستخدام Docker

```bash
# تشغيل جميع الخدمات
docker-compose up -d

# عرض السجلات
docker-compose logs -f

# إيقاف الخدمات
docker-compose down
```

## 🔑 بيانات الدخول الافتراضية

### لوحة التحكم
- **المدير**: `admin` / `admin123456`
- **مدير الصالة**: `manager` / `manager123`
- **موظف الاستقبال**: `receptionist` / `receptionist123`

### تطبيق الأعضاء
- **رقم الهاتف**: رقم العضو المسجل
- **رقم العضوية**: يتم الحصول عليه من موظف الاستقبال

## 📱 الروابط

- **Backend API**: http://localhost:5000
- **لوحة التحكم**: http://localhost:3000
- **تطبيق الجوال**: على الجهاز/المحاكي

## 🔧 الإعدادات

### إعدادات الواتساب (Twilio)
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### إعدادات البريد الإلكتروني
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## 🎯 الميزات القادمة

- [ ] تطبيق iOS
- [ ] نظام الحجوزات
- [ ] تتبع التمارين
- [ ] نظام التغذية
- [ ] تكامل مع أجهزة القياس
- [ ] نظام المدربين الشخصيين
- [ ] متجر المكملات الغذائية

---

**تم تطويره بـ ❤️ لصالة البسنديلي الرياضية**
- نظام WhatsApp التلقائي

## هيكل المشروع

```
elbsndely-gym/
├── backend/                 # Node.js + Express API
├── frontend/               # React.js Dashboard
├── mobile/                 # React Native App
├── database/              # SQL scripts
└── docs/                  # التوثيق
```

## التقنيات المستخدمة

### Backend
- Node.js + Express
- PostgreSQL
- JWT Authentication
- WhatsApp Business API

### Frontend
- React.js + TypeScript
- Material-UI
- Redux Toolkit

### Mobile
- React Native
- React Navigation
- Redux Toolkit

## التشغيل

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Mobile
```bash
cd mobile
npm install
npx react-native run-android
```

## الميزات

- إدارة المشتركين والاشتراكات
- نظام التنبيهات للاشتراكات المنتهية
- تقارير الإيرادات والإحصائيات
- تطبيق جوال للمشتركين
- رسائل WhatsApp التلقائية
- نظام الصلاحيات المتعدد
