const axios = require('axios');

const quickTest = async () => {
  console.log('🔍 فحص سريع للنظام...');
  
  try {
    // Test Backend
    console.log('اختبار Backend...');
    const response = await axios.get('http://localhost:5000/health', { timeout: 3000 });
    console.log('✅ Backend يعمل:', response.data);
    
    // Test Login
    console.log('اختبار تسجيل الدخول...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      login: 'admin',
      password: 'admin123'
    }, { timeout: 3000 });
    
    console.log('✅ تسجيل الدخول نجح');
    console.log('المستخدم:', loginResponse.data.data.user.full_name);
    
  } catch (error) {
    console.log('❌ خطأ:', error.message);
  }
};

quickTest();
