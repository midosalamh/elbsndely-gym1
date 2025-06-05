const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SubscriptionType = sequelize.define('SubscriptionType', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [2, 100]
      }
    },
    name_en: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [2, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    duration_months: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 24
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    features: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '#1976d2'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    discount_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
    },
    max_freeze_days: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'subscription_types',
    indexes: [
      {
        fields: ['is_active']
      },
      {
        fields: ['sort_order']
      }
    ]
  });

  // Instance methods
  SubscriptionType.prototype.getDiscountedPrice = function() {
    if (this.discount_percentage > 0) {
      const discount = (this.price * this.discount_percentage) / 100;
      return this.price - discount;
    }
    return this.price;
  };

  SubscriptionType.prototype.getPricePerMonth = function() {
    return this.getDiscountedPrice() / this.duration_months;
  };

  // Class methods
  SubscriptionType.associate = (models) => {
    // SubscriptionType has many subscriptions
    SubscriptionType.hasMany(models.Subscription, {
      foreignKey: 'subscription_type_id',
      as: 'subscriptions'
    });
  };

  return SubscriptionType;
};
