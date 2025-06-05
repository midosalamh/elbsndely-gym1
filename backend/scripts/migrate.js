const { sequelize } = require('../config/database');
require('dotenv').config();

const runMigrations = async () => {
  try {
    console.log('🔄 بدء تشغيل المايجريشن...');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');

    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('✅ تم تحديث جداول قاعدة البيانات');

    console.log('🎉 تم تشغيل المايجريشن بنجاح!');
  } catch (error) {
    console.error('❌ خطأ في تشغيل المايجريشن:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
