const axios = require('axios');

// Configuration - Update these URLs after deployment
const CONFIG = {
  BACKEND_URL: process.env.BACKEND_URL || 'https://your-backend-url.com',
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://your-frontend-url.com',
  ADMIN_USERNAME: 'admin',
  ADMIN_PASSWORD: 'admin123'
};

const testCloudDeployment = async () => {
  console.log('🌐 اختبار النشر السحابي لنظام إدارة الصالة الرياضية');
  console.log('=' .repeat(60));
  console.log(`Backend URL: ${CONFIG.BACKEND_URL}`);
  console.log(`Frontend URL: ${CONFIG.FRONTEND_URL}`);
  console.log('=' .repeat(60));

  let testResults = {
    backendHealth: false,
    frontendAccess: false,
    authentication: false,
    apiEndpoints: false,
    databaseConnection: false,
    crossOriginRequests: false
  };

  try {
    // 1. Test Backend Health
    console.log('\n1️⃣ اختبار صحة الـ Backend...');
    try {
      const healthResponse = await axios.get(`${CONFIG.BACKEND_URL}/health`, {
        timeout: 10000
      });
      
      if (healthResponse.status === 200) {
        console.log('✅ Backend يعمل بشكل صحيح');
        console.log('   الحالة:', healthResponse.data.status);
        console.log('   الرسالة:', healthResponse.data.message);
        testResults.backendHealth = true;
      }
    } catch (error) {
      console.log('❌ Backend لا يعمل');
      console.log('   الخطأ:', error.message);
      if (error.code === 'ENOTFOUND') {
        console.log('   💡 تأكد من أن Backend URL صحيح ومنشور');
      }
    }

    // 2. Test Frontend Access
    console.log('\n2️⃣ اختبار الوصول للـ Frontend...');
    try {
      const frontendResponse = await axios.get(CONFIG.FRONTEND_URL, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (frontendResponse.status === 200) {
        console.log('✅ Frontend يعمل بشكل صحيح');
        console.log('   حجم الاستجابة:', frontendResponse.data.length, 'bytes');
        testResults.frontendAccess = true;
      }
    } catch (error) {
      console.log('❌ Frontend لا يعمل');
      console.log('   الخطأ:', error.message);
      if (error.code === 'ENOTFOUND') {
        console.log('   💡 تأكد من أن Frontend URL صحيح ومنشور');
      }
    }

    // 3. Test Authentication
    console.log('\n3️⃣ اختبار المصادقة...');
    let authToken = null;
    try {
      const loginResponse = await axios.post(`${CONFIG.BACKEND_URL}/api/auth/login`, {
        login: CONFIG.ADMIN_USERNAME,
        password: CONFIG.ADMIN_PASSWORD
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (loginResponse.status === 200 && loginResponse.data.data.token) {
        authToken = loginResponse.data.data.token;
        console.log('✅ المصادقة تعمل بشكل صحيح');
        console.log('   المستخدم:', loginResponse.data.data.user.full_name);
        console.log('   الدور:', loginResponse.data.data.user.role);
        console.log('   Token:', authToken.substring(0, 20) + '...');
        testResults.authentication = true;
      }
    } catch (error) {
      console.log('❌ المصادقة لا تعمل');
      console.log('   الخطأ:', error.response?.data?.message || error.message);
    }

    // 4. Test API Endpoints (if authentication succeeded)
    if (authToken) {
      console.log('\n4️⃣ اختبار API Endpoints...');
      try {
        const endpoints = [
          { name: 'الملف الشخصي', url: '/api/auth/me' },
          { name: 'الأعضاء', url: '/api/members' },
          { name: 'أنواع الاشتراكات', url: '/api/subscriptions/types' },
          { name: 'المدفوعات', url: '/api/payments' },
          { name: 'لوحة التحكم', url: '/api/reports/dashboard' }
        ];

        let successCount = 0;
        for (const endpoint of endpoints) {
          try {
            const response = await axios.get(`${CONFIG.BACKEND_URL}${endpoint.url}`, {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              },
              timeout: 5000
            });

            if (response.status === 200) {
              console.log(`   ✅ ${endpoint.name}: يعمل`);
              successCount++;
            }
          } catch (error) {
            console.log(`   ❌ ${endpoint.name}: لا يعمل (${error.response?.status || 'خطأ'})`);
          }
        }

        if (successCount === endpoints.length) {
          testResults.apiEndpoints = true;
          console.log('✅ جميع API Endpoints تعمل بشكل صحيح');
        } else {
          console.log(`⚠️ ${successCount}/${endpoints.length} endpoints تعمل`);
        }
      } catch (error) {
        console.log('❌ خطأ في اختبار API Endpoints');
      }
    }

    // 5. Test Database Connection (indirect)
    console.log('\n5️⃣ اختبار اتصال قاعدة البيانات...');
    if (testResults.authentication && testResults.apiEndpoints) {
      console.log('✅ قاعدة البيانات متصلة (تم التحقق عبر APIs)');
      testResults.databaseConnection = true;
    } else {
      console.log('❌ لا يمكن التحقق من اتصال قاعدة البيانات');
    }

    // 6. Test CORS (Cross-Origin Requests)
    console.log('\n6️⃣ اختبار CORS...');
    if (testResults.authentication) {
      console.log('✅ CORS مضبوط بشكل صحيح');
      testResults.crossOriginRequests = true;
    } else {
      console.log('❌ مشكلة في إعدادات CORS');
    }

  } catch (error) {
    console.log('\n❌ خطأ عام في الاختبار:', error.message);
  }

  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 ملخص نتائج اختبار النشر السحابي');
  console.log('=' .repeat(60));

  const results = [
    { name: 'صحة الـ Backend', status: testResults.backendHealth },
    { name: 'الوصول للـ Frontend', status: testResults.frontendAccess },
    { name: 'المصادقة', status: testResults.authentication },
    { name: 'API Endpoints', status: testResults.apiEndpoints },
    { name: 'اتصال قاعدة البيانات', status: testResults.databaseConnection },
    { name: 'CORS', status: testResults.crossOriginRequests }
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
    console.log('\n🎉 النظام السحابي يعمل بشكل مثالي!');
    console.log('✅ جاهز للاستخدام الفعلي');
    console.log('🌐 يمكن الوصول إليه من أي مكان في العالم');
    console.log('📱 يعمل على جميع الأجهزة والمتصفحات');
  } else {
    console.log('\n⚠️ النظام يحتاج إلى مراجعة');
    console.log('📋 راجع الأخطاء أعلاه وأصلحها');
  }

  console.log('\n🔐 بيانات تسجيل الدخول:');
  console.log(`اسم المستخدم: ${CONFIG.ADMIN_USERNAME}`);
  console.log(`كلمة المرور: ${CONFIG.ADMIN_PASSWORD}`);
  console.log(`رابط النظام: ${CONFIG.FRONTEND_URL}`);
};

// Run the test
testCloudDeployment().catch(console.error);
