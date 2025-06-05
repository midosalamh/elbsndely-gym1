const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test data
const testUser = {
  login: 'admin',
  password: 'admin123456'
};

const testMember = {
  full_name: 'سارة أحمد محمد',
  phone: '966507654321',
  email: 'sara@example.com',
  gender: 'female',
  date_of_birth: '1995-05-15'
};

let authToken = '';
let memberId = '';

// Helper function to make authenticated requests
const makeRequest = async (method, url, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      data
    };
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ Error in ${method} ${url}:`, error.response?.data || error.message);
    throw error;
  }
};

// Test functions
const testHealthCheck = async () => {
  console.log('🔍 Testing health check...');
  try {
    const response = await makeRequest('GET', '/health');
    console.log('✅ Health check passed:', response.status);
  } catch (error) {
    console.error('❌ Health check failed');
  }
};

const testLogin = async () => {
  console.log('🔍 Testing login...');
  try {
    const response = await makeRequest('POST', '/api/auth/login', testUser);
    authToken = response.data.token;
    console.log('✅ Login successful');
    console.log('👤 User:', response.data.user.full_name);
  } catch (error) {
    console.error('❌ Login failed');
  }
};

const testCreateMember = async () => {
  console.log('🔍 Testing create member...');
  try {
    const response = await makeRequest('POST', '/api/members', testMember);
    memberId = response.data.member.id;
    console.log('✅ Member created successfully');
    console.log('👤 Member:', response.data.member.full_name);
    console.log('🆔 Member ID:', memberId);
  } catch (error) {
    console.error('❌ Create member failed');
  }
};

const testGetMembers = async () => {
  console.log('🔍 Testing get members...');
  try {
    const response = await makeRequest('GET', '/api/members');
    console.log('✅ Get members successful');
    console.log('📊 Total members:', response.data.pagination?.total_items || 0);
  } catch (error) {
    console.error('❌ Get members failed');
  }
};

const testGetMember = async () => {
  if (!memberId) {
    console.log('⏭️ Skipping get member test (no member ID)');
    return;
  }
  
  console.log('🔍 Testing get member by ID...');
  try {
    const response = await makeRequest('GET', `/api/members/${memberId}`);
    console.log('✅ Get member successful');
    console.log('👤 Member:', response.data.member.full_name);
  } catch (error) {
    console.error('❌ Get member failed');
  }
};

const testGetSubscriptionTypes = async () => {
  console.log('🔍 Testing get subscription types...');
  try {
    const response = await makeRequest('GET', '/api/subscriptions/types');
    console.log('✅ Get subscription types successful');
    console.log('📋 Types count:', response.data.subscription_types?.length || 0);
  } catch (error) {
    console.error('❌ Get subscription types failed');
  }
};

const testGetDashboard = async () => {
  console.log('🔍 Testing dashboard data...');
  try {
    const response = await makeRequest('GET', '/api/reports/dashboard');
    console.log('✅ Dashboard data retrieved successfully');
    console.log('📊 Total members:', response.data.overview?.total_members || 0);
  } catch (error) {
    console.error('❌ Dashboard test failed');
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting API tests...\n');
  
  await testHealthCheck();
  console.log('');
  
  await testLogin();
  console.log('');
  
  if (authToken) {
    await testCreateMember();
    console.log('');
    
    await testGetMembers();
    console.log('');
    
    await testGetMember();
    console.log('');
    
    await testGetSubscriptionTypes();
    console.log('');
    
    await testGetDashboard();
    console.log('');
  }
  
  console.log('🎉 API tests completed!');
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
