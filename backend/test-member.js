const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test creating a member
const testCreateMember = async () => {
  try {
    console.log('🔍 Testing login first...');
    
    // Login first
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      login: 'admin',
      password: 'admin123456'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Create member
    console.log('🔍 Testing create member...');
    const memberData = {
      full_name: 'أحمد محمد علي',
      phone: '966501234567',
      email: 'ahmed@example.com',
      gender: 'male',
      date_of_birth: '1990-01-01'
    };
    
    const memberResponse = await axios.post(`${BASE_URL}/api/members`, memberData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('✅ Member created successfully');
    console.log('👤 Member:', memberResponse.data.data.member.full_name);
    console.log('🆔 Member Number:', memberResponse.data.data.member.member_number);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data?.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
  }
};

testCreateMember();
