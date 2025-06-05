const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('🧪 اختبار API تسجيل الدخول...');
    
    // Test data
    const loginData = {
      login: 'admin',
      password: 'admin123'
    };

    console.log('📤 إرسال طلب تسجيل الدخول...');
    console.log('البيانات:', loginData);

    // Make login request
    const response = await axios.post('http://localhost:5000/api/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    console.log('✅ نجح تسجيل الدخول!');
    console.log('الحالة:', response.status);
    console.log('الاستجابة:', JSON.stringify(response.data, null, 2));

    // Test protected endpoint
    const token = response.data.data.token;
    console.log('\n🔐 اختبار endpoint محمي...');
    
    const meResponse = await axios.get('http://localhost:5000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    console.log('✅ نجح الوصول للـ endpoint المحمي!');
    console.log('بيانات المستخدم:', JSON.stringify(meResponse.data, null, 2));

  } catch (error) {
    console.error('❌ خطأ في اختبار تسجيل الدخول:');
    
    if (error.response) {
      console.error('الحالة:', error.response.status);
      console.error('البيانات:', error.response.data);
    } else if (error.request) {
      console.error('لا يوجد استجابة من الخادم');
      console.error('الطلب:', error.request);
    } else {
      console.error('خطأ في إعداد الطلب:', error.message);
    }
  }
};

testLogin();
