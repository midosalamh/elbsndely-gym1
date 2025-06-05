#!/usr/bin/env node

const axios = require('axios');

// تكوين سريع للاختبار
const testConfig = {
  // ضع هنا روابط النظام بعد النشر
  BACKEND_URL: process.env.BACKEND_URL || 'https://your-backend.onrender.com',
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://your-frontend.netlify.app',
  
  // بيانات تسجيل الدخول
  ADMIN_USERNAME: 'admin',
  ADMIN_PASSWORD: 'admin123'
};

const quickTest = async () => {
  console.log('🚀 اختبار سريع للنظام المنشور');
  console.log('=' .repeat(50));
  console.log(`Backend: ${testConfig.BACKEND_URL}`);
  console.log(`Frontend: ${testConfig.FRONTEND_URL}`);
  console.log('=' .repeat(50));

  let results = {
    backendHealth: false,
    frontendAccess: false,
    authentication: false,
    basicFunctions: false
  };

  try {
    // 1. اختبار Backend Health
    console.log('\n🔍 1. اختبار صحة Backend...');
    try {
      const healthResponse = await axios.get(`${testConfig.BACKEND_URL}/health`, {
        timeout: 10000
      });
      
      if (healthResponse.status === 200) {
        console.log('✅ Backend يعمل بشكل مثالي');
        console.log(`   الحالة: ${healthResponse.data.status}`);
        results.backendHealth = true;
      }
    } catch (error) {
      console.log('❌ Backend لا يعمل');
      console.log(`   الخطأ: ${error.message}`);
      console.log('💡 تأكد من أن Backend URL صحيح');
    }

    // 2. اختبار Frontend
    console.log('\n🌐 2. اختبار Frontend...');
    try {
      const frontendResponse = await axios.get(testConfig.FRONTEND_URL, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (frontendResponse.status === 200) {
        console.log('✅ Frontend يعمل بشكل مثالي');
        console.log(`   حجم الصفحة: ${Math.round(frontendResponse.data.length / 1024)} KB`);
        results.frontendAccess = true;
      }
    } catch (error) {
      console.log('❌ Frontend لا يعمل');
      console.log(`   الخطأ: ${error.message}`);
      console.log('💡 تأكد من أن Frontend URL صحيح');
    }

    // 3. اختبار تسجيل الدخول
    if (results.backendHealth) {
      console.log('\n🔐 3. اختبار تسجيل الدخول...');
      try {
        const loginResponse = await axios.post(`${testConfig.BACKEND_URL}/api/auth/login`, {
          login: testConfig.ADMIN_USERNAME,
          password: testConfig.ADMIN_PASSWORD
        }, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (loginResponse.status === 200 && loginResponse.data.data.token) {
          console.log('✅ تسجيل الدخول يعمل بشكل مثالي');
          console.log(`   المستخدم: ${loginResponse.data.data.user.full_name}`);
          console.log(`   الدور: ${loginResponse.data.data.user.role}`);
          results.authentication = true;

          // 4. اختبار الوظائف الأساسية
          console.log('\n⚙️ 4. اختبار الوظائف الأساسية...');
          const token = loginResponse.data.data.token;
          
          try {
            // اختبار قائمة الأعضاء
            const membersResponse = await axios.get(`${testConfig.BACKEND_URL}/api/members`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              timeout: 5000
            });

            if (membersResponse.status === 200) {
              console.log('✅ إدارة الأعضاء تعمل');
              results.basicFunctions = true;
            }
          } catch (error) {
            console.log('⚠️ بعض الوظائف قد تحتاج وقت إضافي للإعداد');
          }
        }
      } catch (error) {
        console.log('❌ تسجيل الدخول لا يعمل');
        console.log(`   الخطأ: ${error.response?.data?.message || error.message}`);
        console.log('💡 تحقق من قاعدة البيانات ومتغيرات البيئة');
      }
    }

    // النتائج النهائية
    console.log('\n' + '=' .repeat(50));
    console.log('📊 نتائج الاختبار السريع');
    console.log('=' .repeat(50));

    const testResults = [
      { name: 'صحة Backend', status: results.backendHealth, icon: '🔧' },
      { name: 'الوصول للـ Frontend', status: results.frontendAccess, icon: '🌐' },
      { name: 'تسجيل الدخول', status: results.authentication, icon: '🔐' },
      { name: 'الوظائف الأساسية', status: results.basicFunctions, icon: '⚙️' }
    ];

    testResults.forEach(result => {
      const statusIcon = result.status ? '✅' : '❌';
      const statusText = result.status ? 'يعمل' : 'لا يعمل';
      console.log(`${result.icon} ${statusIcon} ${result.name}: ${statusText}`);
    });

    const passedTests = testResults.filter(r => r.status).length;
    const totalTests = testResults.length;
    const successRate = Math.round((passedTests / totalTests) * 100);

    console.log('\n📈 النتيجة الإجمالية:');
    console.log(`${passedTests}/${totalTests} اختبارات نجحت (${successRate}%)`);

    if (successRate === 100) {
      console.log('\n🎉 ممتاز! النظام يعمل بشكل مثالي!');
      console.log('✅ جاهز للاستخدام الفعلي');
      console.log('🌟 يمكنك الآن إدارة الصالة الرياضية من أي مكان');
      
      console.log('\n🔗 روابط النظام:');
      console.log(`📱 النظام: ${testConfig.FRONTEND_URL}`);
      console.log(`🔧 API: ${testConfig.BACKEND_URL}`);
      
      console.log('\n🔐 بيانات تسجيل الدخول:');
      console.log(`👤 اسم المستخدم: ${testConfig.ADMIN_USERNAME}`);
      console.log(`🔑 كلمة المرور: ${testConfig.ADMIN_PASSWORD}`);
      
    } else if (successRate >= 75) {
      console.log('\n⚠️ النظام يعمل بشكل جيد مع بعض المشاكل البسيطة');
      console.log('🔧 قد تحتاج لبعض التحسينات');
      console.log('💡 جرب الانتظار 5 دقائق ثم أعد الاختبار');
      
    } else if (successRate >= 50) {
      console.log('\n🔄 النظام في مرحلة الإعداد');
      console.log('⏳ انتظر 5-10 دقائق حتى يكتمل الإعداد');
      console.log('🔄 ثم أعد تشغيل الاختبار');
      
    } else {
      console.log('\n❌ النظام يحتاج لمراجعة');
      console.log('🛠️ تحقق من الخطوات التالية:');
      
      if (!results.backendHealth) {
        console.log('   • تأكد من نشر Backend بشكل صحيح');
        console.log('   • راجع logs في منصة النشر');
        console.log('   • تحقق من متغيرات البيئة');
      }
      
      if (!results.frontendAccess) {
        console.log('   • تأكد من نشر Frontend بشكل صحيح');
        console.log('   • تحقق من REACT_APP_API_URL');
      }
      
      if (!results.authentication) {
        console.log('   • تحقق من قاعدة البيانات');
        console.log('   • راجع JWT_SECRET');
        console.log('   • انتظر اكتمال إعداد قاعدة البيانات');
      }
    }

    console.log('\n💡 نصائح:');
    console.log('• إذا كان النشر حديث، انتظر 5-10 دقائق');
    console.log('• تحقق من logs في منصة النشر');
    console.log('• تأكد من أن جميع متغيرات البيئة مضبوطة');
    console.log('• جرب إعادة تشغيل الخدمات');

  } catch (error) {
    console.error('\n❌ خطأ عام في الاختبار:', error.message);
    console.log('\n🔧 تحقق من:');
    console.log('• اتصال الإنترنت');
    console.log('• صحة الروابط');
    console.log('• حالة الخدمات');
  }
};

// تشغيل الاختبار
console.log('🎯 بدء الاختبار السريع...');
console.log('⏳ هذا قد يستغرق 30-60 ثانية...\n');

quickTest().catch(error => {
  console.error('❌ فشل الاختبار:', error.message);
  console.log('\n💡 تأكد من:');
  console.log('• تحديث الروابط في بداية الملف');
  console.log('• أن الخدمات تعمل');
  console.log('• اتصال الإنترنت');
});

// تصدير التكوين للاستخدام الخارجي
module.exports = { testConfig, quickTest };
