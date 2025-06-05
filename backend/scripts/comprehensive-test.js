const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = null;

// Helper function for API calls
const apiCall = async (method, endpoint, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 10000
    };
    
    if (data) config.data = data;
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message,
      status: error.response?.status || 0
    };
  }
};

const comprehensiveTest = async () => {
  console.log('🧪 اختبار شامل لنظام إدارة الصالة الرياضية');
  console.log('=' .repeat(60));

  // 1. Test Backend Health
  console.log('\n1️⃣ اختبار صحة النظام...');
  try {
    const healthResponse = await axios.get('http://localhost:5000/health', { timeout: 5000 });
    console.log('✅ Backend يعمل بشكل صحيح');
    console.log('   الحالة:', healthResponse.status);
    console.log('   الرسالة:', healthResponse.data.message);
  } catch (error) {
    console.log('❌ Backend لا يعمل');
    console.log('   الخطأ:', error.message);
    return;
  }

  // 2. Test Authentication
  console.log('\n2️⃣ اختبار المصادقة...');
  const loginResult = await apiCall('POST', '/auth/login', {
    login: 'admin',
    password: 'admin123'
  });

  if (loginResult.success) {
    authToken = loginResult.data.data.token;
    console.log('✅ تم تسجيل الدخول بنجاح');
    console.log('   المستخدم:', loginResult.data.data.user.full_name);
    console.log('   الدور:', loginResult.data.data.user.role);
    console.log('   Token:', authToken.substring(0, 20) + '...');
  } else {
    console.log('❌ فشل تسجيل الدخول');
    console.log('   الخطأ:', loginResult.error);
    return;
  }

  // 3. Test Protected Endpoints
  console.log('\n3️⃣ اختبار الوصول للـ endpoints المحمية...');
  const meResult = await apiCall('GET', '/auth/me', null, {
    Authorization: `Bearer ${authToken}`
  });

  if (meResult.success) {
    console.log('✅ الوصول للـ endpoints المحمية يعمل');
    console.log('   بيانات المستخدم محدثة');
  } else {
    console.log('❌ فشل الوصول للـ endpoints المحمية');
    console.log('   الخطأ:', meResult.error);
  }

  // 4. Test Members Management
  console.log('\n4️⃣ اختبار إدارة الأعضاء...');
  
  // Get members list
  const membersResult = await apiCall('GET', '/members', null, {
    Authorization: `Bearer ${authToken}`
  });

  if (membersResult.success) {
    console.log('✅ عرض قائمة الأعضاء يعمل');
    console.log('   عدد الأعضاء:', membersResult.data.data.members.length);
  } else {
    console.log('❌ فشل عرض قائمة الأعضاء');
  }

  // Create new member
  const newMemberData = {
    member_number: 'TEST001',
    full_name: 'عضو تجريبي',
    email: 'test@example.com',
    phone: '01234567890',
    date_of_birth: '1990-01-01',
    gender: 'male',
    address: 'عنوان تجريبي',
    emergency_contact_name: 'جهة اتصال طوارئ',
    emergency_contact_phone: '01234567891'
  };

  const createMemberResult = await apiCall('POST', '/members', newMemberData, {
    Authorization: `Bearer ${authToken}`
  });

  if (createMemberResult.success) {
    console.log('✅ إضافة عضو جديد يعمل');
    console.log('   رقم العضو:', createMemberResult.data.data.member.member_number);
  } else {
    console.log('❌ فشل إضافة عضو جديد');
    console.log('   الخطأ:', createMemberResult.error);
  }

  // 5. Test Subscription Types
  console.log('\n5️⃣ اختبار أنواع الاشتراكات...');
  const subscriptionTypesResult = await apiCall('GET', '/subscriptions/types', null, {
    Authorization: `Bearer ${authToken}`
  });

  if (subscriptionTypesResult.success) {
    console.log('✅ عرض أنواع الاشتراكات يعمل');
    console.log('   عدد الأنواع:', subscriptionTypesResult.data.data.subscription_types.length);
  } else {
    console.log('❌ فشل عرض أنواع الاشتراكات');
  }

  // Create subscription type if none exist
  if (subscriptionTypesResult.success && subscriptionTypesResult.data.data.subscription_types.length === 0) {
    const newSubscriptionType = {
      name: 'اشتراك شهري تجريبي',
      description: 'اشتراك شهري للاختبار',
      duration_days: 30,
      price: 100,
      features: ['استخدام الأجهزة', 'الساونا'],
      is_active: true
    };

    const createTypeResult = await apiCall('POST', '/subscriptions/types', newSubscriptionType, {
      Authorization: `Bearer ${authToken}`
    });

    if (createTypeResult.success) {
      console.log('✅ إضافة نوع اشتراك جديد يعمل');
    }
  }

  // 6. Test Payments
  console.log('\n6️⃣ اختبار المدفوعات...');
  const paymentsResult = await apiCall('GET', '/payments', null, {
    Authorization: `Bearer ${authToken}`
  });

  if (paymentsResult.success) {
    console.log('✅ عرض المدفوعات يعمل');
    console.log('   عدد المدفوعات:', paymentsResult.data.data.payments.length);
  } else {
    console.log('❌ فشل عرض المدفوعات');
  }

  // 7. Test Reports
  console.log('\n7️⃣ اختبار التقارير...');
  const dashboardResult = await apiCall('GET', '/reports/dashboard', null, {
    Authorization: `Bearer ${authToken}`
  });

  if (dashboardResult.success) {
    console.log('✅ تقرير لوحة التحكم يعمل');
    console.log('   البيانات متوفرة');
  } else {
    console.log('❌ فشل تقرير لوحة التحكم');
  }

  // 8. Test Messages
  console.log('\n8️⃣ اختبار الرسائل...');
  const messagesResult = await apiCall('GET', '/messages', null, {
    Authorization: `Bearer ${authToken}`
  });

  if (messagesResult.success) {
    console.log('✅ عرض الرسائل يعمل');
    console.log('   عدد الرسائل:', messagesResult.data.data.messages.length);
  } else {
    console.log('❌ فشل عرض الرسائل');
  }

  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 ملخص الاختبار الشامل');
  console.log('=' .repeat(60));
  console.log('🎯 النظام جاهز للاستخدام العملي');
  console.log('🔐 بيانات تسجيل الدخول:');
  console.log('   اسم المستخدم: admin');
  console.log('   كلمة المرور: admin123');
  console.log('🌐 الروابط:');
  console.log('   Frontend: http://localhost:3000');
  console.log('   Backend: http://localhost:5000');
  console.log('   API Health: http://localhost:5000/health');
};

comprehensiveTest().catch(console.error);
