const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const fullSystemTest = async () => {
  console.log('🧪 اختبار شامل لنظام إدارة الصالة الرياضية');
  console.log('=' .repeat(50));

  let authToken = null;
  let testResults = {
    backend: false,
    login: false,
    protectedEndpoints: false,
    members: false,
    subscriptions: false,
    payments: false
  };

  try {
    // 1. Test Backend Health
    console.log('\n1️⃣ اختبار صحة الـ Backend...');
    try {
      const healthResponse = await axios.get('http://localhost:5000/health', { timeout: 5000 });
      console.log('✅ الـ Backend يعمل بشكل صحيح');
      console.log('الحالة:', healthResponse.status);
      testResults.backend = true;
    } catch (error) {
      console.log('❌ الـ Backend لا يعمل');
      throw new Error('Backend not responding');
    }

    // 2. Test Login
    console.log('\n2️⃣ اختبار تسجيل الدخول...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        login: 'admin',
        password: 'admin123'
      }, { timeout: 5000 });

      authToken = loginResponse.data.data.token;
      console.log('✅ تم تسجيل الدخول بنجاح');
      console.log('المستخدم:', loginResponse.data.data.user.full_name);
      console.log('الدور:', loginResponse.data.data.user.role);
      testResults.login = true;
    } catch (error) {
      console.log('❌ فشل تسجيل الدخول');
      console.log('الخطأ:', error.response?.data?.message || error.message);
      throw new Error('Login failed');
    }

    // 3. Test Protected Endpoints
    console.log('\n3️⃣ اختبار الـ endpoints المحمية...');
    try {
      const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
        timeout: 5000
      });
      console.log('✅ الوصول للـ endpoints المحمية يعمل');
      testResults.protectedEndpoints = true;
    } catch (error) {
      console.log('❌ فشل الوصول للـ endpoints المحمية');
      throw new Error('Protected endpoints failed');
    }

    // 4. Test Members API
    console.log('\n4️⃣ اختبار API الأعضاء...');
    try {
      const membersResponse = await axios.get(`${BASE_URL}/members`, {
        headers: { Authorization: `Bearer ${authToken}` },
        timeout: 5000
      });
      console.log('✅ API الأعضاء يعمل');
      console.log('عدد الأعضاء:', membersResponse.data.data.members.length);
      testResults.members = true;
    } catch (error) {
      console.log('❌ فشل API الأعضاء');
      console.log('الخطأ:', error.response?.data?.message || error.message);
    }

    // 5. Test Subscriptions API
    console.log('\n5️⃣ اختبار API الاشتراكات...');
    try {
      const subscriptionsResponse = await axios.get(`${BASE_URL}/subscriptions`, {
        headers: { Authorization: `Bearer ${authToken}` },
        timeout: 5000
      });
      console.log('✅ API الاشتراكات يعمل');
      testResults.subscriptions = true;
    } catch (error) {
      console.log('❌ فشل API الاشتراكات');
      console.log('الخطأ:', error.response?.data?.message || error.message);
    }

    // 6. Test Payments API
    console.log('\n6️⃣ اختبار API المدفوعات...');
    try {
      const paymentsResponse = await axios.get(`${BASE_URL}/payments`, {
        headers: { Authorization: `Bearer ${authToken}` },
        timeout: 5000
      });
      console.log('✅ API المدفوعات يعمل');
      testResults.payments = true;
    } catch (error) {
      console.log('❌ فشل API المدفوعات');
      console.log('الخطأ:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.log('\n❌ فشل الاختبار الشامل:', error.message);
  }

  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 ملخص نتائج الاختبار:');
  console.log('=' .repeat(50));
  
  const results = [
    { name: 'صحة الـ Backend', status: testResults.backend },
    { name: 'تسجيل الدخول', status: testResults.login },
    { name: 'الـ Endpoints المحمية', status: testResults.protectedEndpoints },
    { name: 'API الأعضاء', status: testResults.members },
    { name: 'API الاشتراكات', status: testResults.subscriptions },
    { name: 'API المدفوعات', status: testResults.payments }
  ];

  results.forEach(result => {
    const icon = result.status ? '✅' : '❌';
    const status = result.status ? 'يعمل' : 'لا يعمل';
    console.log(`${icon} ${result.name}: ${status}`);
  });

  const passedTests = results.filter(r => r.status).length;
  const totalTests = results.length;
  
  console.log('\n📈 النتيجة النهائية:');
  console.log(`${passedTests}/${totalTests} اختبارات نجحت (${Math.round(passedTests/totalTests*100)}%)`);

  if (passedTests === totalTests) {
    console.log('🎉 جميع الاختبارات نجحت! النظام يعمل بشكل مثالي.');
  } else {
    console.log('⚠️ بعض الاختبارات فشلت. يرجى مراجعة الأخطاء أعلاه.');
  }

  console.log('\n🔐 بيانات تسجيل الدخول:');
  console.log('اسم المستخدم: admin');
  console.log('كلمة المرور: admin123');
  console.log('الرابط: http://localhost:3000');
};

fullSystemTest();
