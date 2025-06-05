const { User, sequelize } = require('../config/database');

const createAdminUser = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');

    // Sync models
    await sequelize.sync();
    console.log('✅ تم مزامنة النماذج');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      where: { username: 'admin' }
    });

    if (existingAdmin) {
      console.log('⚠️ المستخدم الإداري موجود بالفعل');
      console.log('بيانات المستخدم:');
      console.log('اسم المستخدم: admin');
      console.log('البريد الإلكتروني:', existingAdmin.email);
      console.log('الاسم الكامل:', existingAdmin.full_name);
      console.log('الدور:', existingAdmin.role);
      console.log('مفعل:', existingAdmin.is_active ? 'نعم' : 'لا');
      return;
    }

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@elbsndely.com',
      password: 'admin123',
      full_name: 'مدير النظام',
      phone: '01234567890',
      role: 'admin',
      is_active: true
    });

    console.log('✅ تم إنشاء المستخدم الإداري بنجاح!');
    console.log('بيانات تسجيل الدخول:');
    console.log('اسم المستخدم: admin');
    console.log('كلمة المرور: admin123');
    console.log('البريد الإلكتروني: admin@elbsndely.com');
    console.log('الدور: admin');

  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدم الإداري:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

createAdminUser();
