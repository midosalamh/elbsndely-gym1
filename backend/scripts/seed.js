const { sequelize, User, SubscriptionType } = require('../config/database');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Sync database
    await sequelize.sync({ force: false });
    console.log('✅ Database synced');

    // Create default admin user
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    
    if (!adminExists) {
      await User.create({
        username: 'admin',
        email: 'admin@elbsndely-gym.com',
        password: 'admin123456',
        full_name: 'مدير النظام',
        phone: '966500000000',
        role: 'admin'
      });
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Create default subscription types
    const subscriptionTypes = [
      {
        name: 'اشتراك شهري',
        name_en: 'Monthly',
        description: 'اشتراك شهري للصالة الرياضية',
        duration_months: 1,
        price: 150.00,
        color: '#4CAF50',
        sort_order: 1,
        features: ['دخول مفتوح للصالة', 'استخدام جميع الأجهزة', 'خزانة شخصية']
      },
      {
        name: 'اشتراك ربع سنوي',
        name_en: 'Quarterly',
        description: 'اشتراك لثلاثة أشهر مع خصم 10%',
        duration_months: 3,
        price: 400.00,
        color: '#2196F3',
        sort_order: 2,
        discount_percentage: 10,
        features: ['دخول مفتوح للصالة', 'استخدام جميع الأجهزة', 'خزانة شخصية', 'استشارة تغذية مجانية']
      },
      {
        name: 'اشتراك نصف سنوي',
        name_en: 'Semi-Annual',
        description: 'اشتراك لستة أشهر مع خصم 15%',
        duration_months: 6,
        price: 750.00,
        color: '#FF9800',
        sort_order: 3,
        discount_percentage: 15,
        max_freeze_days: 14,
        features: ['دخول مفتوح للصالة', 'استخدام جميع الأجهزة', 'خزانة شخصية', 'استشارة تغذية مجانية', 'برنامج تدريبي شخصي']
      },
      {
        name: 'اشتراك سنوي',
        name_en: 'Annual',
        description: 'اشتراك سنوي مع خصم 20% وميزات إضافية',
        duration_months: 12,
        price: 1400.00,
        color: '#9C27B0',
        sort_order: 4,
        discount_percentage: 20,
        max_freeze_days: 30,
        features: [
          'دخول مفتوح للصالة',
          'استخدام جميع الأجهزة',
          'خزانة شخصية',
          'استشارة تغذية مجانية',
          'برنامج تدريبي شخصي',
          'جلسات مساج مجانية',
          'دعوة صديق مجانية'
        ]
      },
      {
        name: 'اشتراك طلابي',
        name_en: 'Student',
        description: 'اشتراك خاص للطلاب مع خصم 25%',
        duration_months: 1,
        price: 120.00,
        color: '#607D8B',
        sort_order: 5,
        discount_percentage: 25,
        features: ['دخول مفتوح للصالة', 'استخدام جميع الأجهزة', 'خزانة شخصية']
      }
    ];

    for (const typeData of subscriptionTypes) {
      const existingType = await SubscriptionType.findOne({ 
        where: { name: typeData.name } 
      });
      
      if (!existingType) {
        await SubscriptionType.create(typeData);
        console.log(`✅ Created subscription type: ${typeData.name}`);
      } else {
        console.log(`ℹ️ Subscription type already exists: ${typeData.name}`);
      }
    }

    // Create sample receptionist user
    const receptionistExists = await User.findOne({ 
      where: { username: 'receptionist' } 
    });
    
    if (!receptionistExists) {
      await User.create({
        username: 'receptionist',
        email: 'receptionist@elbsndely-gym.com',
        password: 'receptionist123',
        full_name: 'موظف الاستقبال',
        phone: '966500000001',
        role: 'receptionist'
      });
      console.log('✅ Receptionist user created');
    } else {
      console.log('ℹ️ Receptionist user already exists');
    }

    // Create sample manager user
    const managerExists = await User.findOne({ 
      where: { username: 'manager' } 
    });
    
    if (!managerExists) {
      await User.create({
        username: 'manager',
        email: 'manager@elbsndely-gym.com',
        password: 'manager123',
        full_name: 'مدير الصالة',
        phone: '966500000002',
        role: 'manager'
      });
      console.log('✅ Manager user created');
    } else {
      console.log('ℹ️ Manager user already exists');
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Default Users Created:');
    console.log('👤 Admin: admin / admin123456');
    console.log('👤 Manager: manager / manager123');
    console.log('👤 Receptionist: receptionist / receptionist123');
    console.log('\n💡 You can now start the server and login with these credentials.');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
