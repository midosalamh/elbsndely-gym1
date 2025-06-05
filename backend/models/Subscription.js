const { DataTypes } = require('sequelize');
const moment = require('moment');

module.exports = (sequelize) => {
  const Subscription = sequelize.define('Subscription', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    member_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'members',
        key: 'id'
      }
    },
    subscription_type_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'subscription_types',
        key: 'id'
      }
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    status: {
      type: DataTypes.TEXT,
      defaultValue: 'active',
      validate: {
        isIn: [['active', 'expired', 'frozen', 'cancelled']]
      }
    },
    amount_paid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    freeze_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    freeze_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    freeze_reason: {
      type: DataTypes.STRING,
      allowNull: true
    },
    renewal_reminder_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    auto_renew: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'subscriptions',
    hooks: {
      beforeCreate: async (subscription) => {
        if (!subscription.end_date && subscription.start_date) {
          const { SubscriptionType } = require('../config/database');
          const subscriptionType = await SubscriptionType.findByPk(subscription.subscription_type_id);
          if (subscriptionType) {
            subscription.end_date = moment(subscription.start_date)
              .add(subscriptionType.duration_months, 'months')
              .format('YYYY-MM-DD');
          }
        }
      }
    }
  });

  // Instance methods
  Subscription.prototype.getDaysRemaining = function() {
    const today = moment();
    const endDate = moment(this.end_date);
    return endDate.diff(today, 'days');
  };

  Subscription.prototype.isExpiringSoon = function(days = 3) {
    const remaining = this.getDaysRemaining();
    return remaining <= days && remaining >= 0;
  };

  Subscription.prototype.isExpired = function() {
    return this.getDaysRemaining() < 0;
  };

  Subscription.prototype.freeze = async function(reason, days) {
    const today = moment();
    this.freeze_start_date = today.format('YYYY-MM-DD');
    this.freeze_end_date = today.add(days, 'days').format('YYYY-MM-DD');
    this.freeze_reason = reason;
    this.status = 'frozen';
    
    // Extend end date by freeze duration
    const freezeDuration = moment(this.freeze_end_date).diff(moment(this.freeze_start_date), 'days');
    this.end_date = moment(this.end_date).add(freezeDuration, 'days').format('YYYY-MM-DD');
    
    return await this.save();
  };

  Subscription.prototype.unfreeze = async function() {
    this.freeze_start_date = null;
    this.freeze_end_date = null;
    this.freeze_reason = null;
    this.status = 'active';
    return await this.save();
  };

  Subscription.prototype.cancel = async function(reason) {
    this.status = 'cancelled';
    this.notes = this.notes ? `${this.notes}\nملغي: ${reason}` : `ملغي: ${reason}`;
    return await this.save();
  };

  // Class methods
  Subscription.associate = (models) => {
    // Subscription belongs to Member
    Subscription.belongsTo(models.Member, {
      foreignKey: 'member_id',
      as: 'member'
    });

    // Subscription belongs to SubscriptionType
    Subscription.belongsTo(models.SubscriptionType, {
      foreignKey: 'subscription_type_id',
      as: 'subscription_type'
    });

    // Subscription has many payments
    Subscription.hasMany(models.Payment, {
      foreignKey: 'subscription_id',
      as: 'payments'
    });
  };

  return Subscription;
};
