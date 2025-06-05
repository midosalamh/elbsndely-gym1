#!/usr/bin/env node

const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const testLiveSystem = async () => {
  console.log('🌐 اختبار النظام المنشور مباشرة');
  console.log('=' .repeat(50));

  try {
    // Get URLs from user
    const frontendUrl = await question('🔗 أدخل رابط Frontend (Netlify): ');
    const backendUrl = await question('🔗 أدخل رابط Backend (Railway): ');
    
    console.log('\n🧪 بدء الاختبار الشامل...');
    console.log('=' .repeat(50));

    let testResults = {
      backendHealth: false,
      frontendAccess: false,
      databaseConnection: false,
      authentication: false,
      memberManagement: false,
      subscriptionManagement: false,
      paymentSystem: false,
      reports: false
    };

    // 1. Test Backend Health
    console.log('\n1️⃣ اختبار صحة Backend...');
    try {
      const healthResponse = await axios.get(`${backendUrl}/health`, {
        timeout: 10000
      });
      
      if (healthResponse.status === 200) {
        console.log('✅ Backend يعمل بشكل مثالي');
        console.log(`   الحالة: ${healthResponse.data.status}`);
        console.log(`   الرسالة: ${healthResponse.data.message}`);
        testResults.backendHealth = true;
      }
    } catch (error) {
      console.log('❌ Backend لا يعمل');
      console.log(`   الخطأ: ${error.message}`);
    }

    // 2. Test Frontend Access
    console.log('\n2️⃣ اختبار الوصول للـ Frontend...');
    try {
      const frontendResponse = await axios.get(frontendUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (frontendResponse.status === 200) {
        console.log('✅ Frontend يعمل بشكل مثالي');
        console.log(`   حجم الصفحة: ${Math.round(frontendResponse.data.length / 1024)} KB`);
        testResults.frontendAccess = true;
      }
    } catch (error) {
      console.log('❌ Frontend لا يعمل');
      console.log(`   الخطأ: ${error.message}`);
    }

    // 3. Test Database Connection
    console.log('\n3️⃣ اختبار اتصال قاعدة البيانات...');
    try {
      const dbResponse = await axios.get(`${backendUrl}/api/health/db`, {
        timeout: 10000
      });
      
      if (dbResponse.status === 200) {
        console.log('✅ قاعدة البيانات متصلة');
        testResults.databaseConnection = true;
      }
    } catch (error) {
      console.log('⚠️ لا يمكن التحقق من قاعدة البيانات مباشرة');
      // Will test through authentication
    }

    // 4. Test Authentication
    console.log('\n4️⃣ اختبار المصادقة...');
    let authToken = null;
    try {
      const loginResponse = await axios.post(`${backendUrl}/api/auth/login`, {
        login: 'admin',
        password: 'admin123'
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (loginResponse.status === 200 && loginResponse.data.data.token) {
        authToken = loginResponse.data.data.token;
        console.log('✅ المصادقة تعمل بشكل مثالي');
        console.log(`   المستخدم: ${loginResponse.data.data.user.full_name}`);
        console.log(`   الدور: ${loginResponse.data.data.user.role}`);
        testResults.authentication = true;
        testResults.databaseConnection = true; // If auth works, DB works
      }
    } catch (error) {
      console.log('❌ المصادقة لا تعمل');
      console.log(`   الخطأ: ${error.response?.data?.message || error.message}`);
    }

    if (authToken) {
      // 5. Test Member Management
      console.log('\n5️⃣ اختبار إدارة الأعضاء...');
      try {
        const membersResponse = await axios.get(`${backendUrl}/api/members`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });

        if (membersResponse.status === 200) {
          console.log('✅ إدارة الأعضاء تعمل');
          console.log(`   عدد الأعضاء: ${membersResponse.data.data.members.length}`);
          testResults.memberManagement = true;
        }
      } catch (error) {
        console.log('❌ إدارة الأعضاء لا تعمل');
      }

      // 6. Test Subscription Management
      console.log('\n6️⃣ اختبار إدارة الاشتراكات...');
      try {
        const subscriptionTypesResponse = await axios.get(`${backendUrl}/api/subscriptions/types`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });

        if (subscriptionTypesResponse.status === 200) {
          console.log('✅ إدارة الاشتراكات تعمل');
          console.log(`   أنواع الاشتراكات: ${subscriptionTypesResponse.data.data.subscription_types.length}`);
          testResults.subscriptionManagement = true;
        }
      } catch (error) {
        console.log('❌ إدارة الاشتراكات لا تعمل');
      }

      // 7. Test Payment System
      console.log('\n7️⃣ اختبار نظام المدفوعات...');
      try {
        const paymentsResponse = await axios.get(`${backendUrl}/api/payments`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });

        if (paymentsResponse.status === 200) {
          console.log('✅ نظام المدفوعات يعمل');
          console.log(`   عدد المدفوعات: ${paymentsResponse.data.data.payments.length}`);
          testResults.paymentSystem = true;
        }
      } catch (error) {
        console.log('❌ نظام المدفوعات لا يعمل');
      }

      // 8. Test Reports
      console.log('\n8️⃣ اختبار التقارير...');
      try {
        const reportsResponse = await axios.get(`${backendUrl}/api/reports/dashboard`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });

        if (reportsResponse.status === 200) {
          console.log('✅ التقارير تعمل');
          testResults.reports = true;
        }
      } catch (error) {
        console.log('❌ التقارير لا تعمل');
      }
    }

    // Final Results
    console.log('\n' + '=' .repeat(50));
    console.log('📊 نتائج الاختبار النهائية');
    console.log('=' .repeat(50));

    const results = [
      { name: 'صحة Backend', status: testResults.backendHealth },
      { name: 'الوصول للـ Frontend', status: testResults.frontendAccess },
      { name: 'اتصال قاعدة البيانات', status: testResults.databaseConnection },
      { name: 'المصادقة', status: testResults.authentication },
      { name: 'إدارة الأعضاء', status: testResults.memberManagement },
      { name: 'إدارة الاشتراكات', status: testResults.subscriptionManagement },
      { name: 'نظام المدفوعات', status: testResults.paymentSystem },
      { name: 'التقارير', status: testResults.reports }
    ];

    results.forEach(result => {
      const icon = result.status ? '✅' : '❌';
      const status = result.status ? 'يعمل' : 'لا يعمل';
      console.log(`${icon} ${result.name}: ${status}`);
    });

    const passedTests = results.filter(r => r.status).length;
    const totalTests = results.length;
    const successRate = Math.round((passedTests / totalTests) * 100);

    console.log('\n📈 النتيجة الإجمالية:');
    console.log(`${passedTests}/${totalTests} اختبارات نجحت (${successRate}%)`);

    if (successRate >= 90) {
      console.log('\n🎉 النظام يعمل بشكل ممتاز!');
      console.log('✅ جاهز للاستخدام الفعلي');
      console.log('🌟 أداء ممتاز ومستقر');
    } else if (successRate >= 70) {
      console.log('\n⚠️ النظام يعمل بشكل جيد مع بعض المشاكل البسيطة');
      console.log('🔧 يحتاج لبعض التحسينات');
    } else {
      console.log('\n❌ النظام يحتاج لمراجعة');
      console.log('🛠️ يرجى إصلاح المشاكل المذكورة أعلاه');
    }

    console.log('\n🔗 روابط النظام:');
    console.log(`Frontend: ${frontendUrl}`);
    console.log(`Backend: ${backendUrl}`);
    console.log(`API Health: ${backendUrl}/health`);

    console.log('\n🔐 بيانات تسجيل الدخول:');
    console.log('اسم المستخدم: admin');
    console.log('كلمة المرور: admin123');

    if (successRate >= 70) {
      console.log('\n🎯 النظام جاهز للاستخدام!');
      console.log('يمكنك الآن:');
      console.log('- إضافة أعضاء جدد');
      console.log('- إنشاء اشتراكات');
      console.log('- تسجيل مدفوعات');
      console.log('- مراجعة التقارير');
      console.log('- إدارة النظام بالكامل');
    }

  } catch (error) {
    console.error('\n❌ خطأ عام في الاختبار:', error.message);
  } finally {
    rl.close();
  }
};

// Run the test
testLiveSystem();
