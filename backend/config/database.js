const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration based on environment
let dbConfig;

if (process.env.DATABASE_URL) {
  // Production: Use DATABASE_URL (for platforms like Heroku, Railway)
  dbConfig = {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  };
} else if (process.env.DB_DIALECT === 'sqlite') {
  // Local development: SQLite
  dbConfig = {
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  };
} else {
  // Local development: PostgreSQL
  dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'elbsndely_gym',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  };
}

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, dbConfig)
  : new Sequelize(dbConfig);

// Import models
const User = require('../models/User');
const Member = require('../models/Member');
const SubscriptionType = require('../models/SubscriptionType');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const Message = require('../models/Message');

// Initialize models
const models = {
  User: User(sequelize),
  Member: Member(sequelize),
  SubscriptionType: SubscriptionType(sequelize),
  Subscription: Subscription(sequelize),
  Payment: Payment(sequelize),
  Message: Message(sequelize)
};

// Define associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
};
