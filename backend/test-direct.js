const { sequelize, Member, User } = require('./config/database');

const testDirectMember = async () => {
  try {
    console.log('🔍 Testing direct member creation...');
    
    // Find admin user
    const admin = await User.findOne({ where: { username: 'admin' } });
    if (!admin) {
      console.error('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:', admin.full_name);
    
    // Create member directly
    const memberData = {
      full_name: 'أحمد محمد علي',
      phone: '966501234567',
      email: 'ahmed@example.com',
      gender: 'male',
      date_of_birth: '1990-01-01',
      created_by: admin.id
    };
    
    console.log('Creating member with data:', memberData);
    
    const member = await Member.create(memberData);
    
    console.log('✅ Member created successfully');
    console.log('👤 Member:', member.full_name);
    console.log('🆔 Member Number:', member.member_number);
    console.log('📞 Phone:', member.phone);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
};

testDirectMember();
