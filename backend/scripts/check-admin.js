const { User, sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const checkAdminUser = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');

    // Find admin user
    const adminUser = await User.findOne({
      where: { username: 'admin' }
    });

    if (!adminUser) {
      console.log('❌ المستخدم الإداري غير موجود');
      return;
    }

    console.log('📋 بيانات المستخدم الإداري:');
    console.log('ID:', adminUser.id);
    console.log('اسم المستخدم:', adminUser.username);
    console.log('البريد الإلكتروني:', adminUser.email);
    console.log('الاسم الكامل:', adminUser.full_name);
    console.log('الهاتف:', adminUser.phone);
    console.log('الدور:', adminUser.role);
    console.log('مفعل:', adminUser.is_active);
    console.log('آخر تسجيل دخول:', adminUser.last_login);

    // Test password
    console.log('\n🔐 اختبار كلمات المرور...');
    
    const passwords = ['admin123', 'admin', '123456', 'password'];
    
    for (const password of passwords) {
      try {
        const isValid = await adminUser.comparePassword(password);
        console.log(`كلمة المرور "${password}":`, isValid ? '✅ صحيحة' : '❌ خاطئة');
        
        if (isValid) {
          console.log(`\n✅ كلمة المرور الصحيحة هي: ${password}`);
          break;
        }
      } catch (error) {
        console.log(`كلمة المرور "${password}": ❌ خطأ في الاختبار`);
      }
    }

    // Reset password to admin123
    console.log('\n🔄 إعادة تعيين كلمة المرور إلى admin123...');
    adminUser.password = 'admin123';
    await adminUser.save();
    console.log('✅ تم إعادة تعيين كلمة المرور بنجاح');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

checkAdminUser();
