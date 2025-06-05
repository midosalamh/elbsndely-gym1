const { sequelize, User, SubscriptionType } = require('../config/database');

const setupProductionDatabase = async () => {
  try {
    console.log('🔄 إعداد قاعدة البيانات للإنتاج...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');

    // Sync all models
    console.log('🔄 إنشاء الجداول...');
    await sequelize.sync({ force: false });
    console.log('✅ تم إنشاء جميع الجداول');

    // Check if admin user exists
    const existingAdmin = await User.findOne({
      where: { username: 'admin' }
    });

    if (!existingAdmin) {
      // Create admin user
      console.log('🔄 إنشاء المستخدم الإداري...');
      const adminUser = await User.create({
        username: 'admin',
        email: 'admin@elbsndely-gym.com',
        password: 'admin123',
        full_name: 'مدير النظام',
        phone: '01234567890',
        role: 'admin',
        is_active: true
      });
      console.log('✅ تم إنشاء المستخدم الإداري بنجاح');
      console.log('   اسم المستخدم: admin');
      console.log('   كلمة المرور: admin123');
    } else {
      console.log('✅ المستخدم الإداري موجود بالفعل');
    }

    // Check if subscription types exist
    const existingTypes = await SubscriptionType.count();
    
    if (existingTypes === 0) {
      console.log('🔄 إنشاء أنواع الاشتراكات الافتراضية...');
      
      const defaultSubscriptionTypes = [
        {
          name: 'اشتراك شهري',
          description: 'اشتراك شهري للصالة الرياضية',
          duration_days: 30,
          price: 200.00,
          features: ['استخدام جميع الأجهزة', 'الساونا', 'خزانة ملابس'],
          is_active: true
        },
        {
          name: 'اشتراك ربع سنوي',
          description: 'اشتراك لمدة 3 أشهر مع خصم',
          duration_days: 90,
          price: 500.00,
          features: ['استخدام جميع الأجهزة', 'الساونا', 'خزانة ملابس', 'استشارة تغذية'],
          is_active: true
        },
        {
          name: 'اشتراك سنوي',
          description: 'اشتراك سنوي مع خصم كبير',
          duration_days: 365,
          price: 1800.00,
          features: ['استخدام جميع الأجهزة', 'الساونا', 'خزانة ملابس', 'استشارة تغذية', 'مدرب شخصي'],
          is_active: true
        },
        {
          name: 'اشتراك يومي',
          description: 'اشتراك يوم واحد للزوار',
          duration_days: 1,
          price: 15.00,
          features: ['استخدام الأجهزة الأساسية'],
          is_active: true
        }
      ];

      for (const typeData of defaultSubscriptionTypes) {
        await SubscriptionType.create(typeData);
      }
      
      console.log('✅ تم إنشاء أنواع الاشتراكات الافتراضية');
    } else {
      console.log('✅ أنواع الاشتراكات موجودة بالفعل');
    }

    console.log('\n🎉 تم إعداد قاعدة البيانات بنجاح!');
    console.log('📋 ملخص الإعداد:');
    console.log('✅ قاعدة البيانات متصلة');
    console.log('✅ الجداول منشأة');
    console.log('✅ المستخدم الإداري جاهز');
    console.log('✅ أنواع الاشتراكات جاهزة');
    
    console.log('\n🔐 بيانات تسجيل الدخول:');
    console.log('اسم المستخدم: admin');
    console.log('كلمة المرور: admin123');
    
  } catch (error) {
    console.error('❌ خطأ في إعداد قاعدة البيانات:', error);
    
    if (error.name === 'SequelizeConnectionError') {
      console.log('\n💡 نصائح لحل مشكلة الاتصال:');
      console.log('1. تأكد من أن DATABASE_URL مضبوط بشكل صحيح');
      console.log('2. تأكد من أن قاعدة البيانات PostgreSQL تعمل');
      console.log('3. تحقق من إعدادات الشبكة والـ SSL');
    }
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

// Run only if this file is executed directly
if (require.main === module) {
  setupProductionDatabase();
}

module.exports = setupProductionDatabase;
