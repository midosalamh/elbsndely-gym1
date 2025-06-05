const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payment = sequelize.define('Payment', {
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
    subscription_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'subscriptions',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    payment_method: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'cash',
      validate: {
        isIn: [['cash', 'card', 'bank_transfer', 'mobile_payment']]
      }
    },
    payment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    payment_type: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'subscription',
      validate: {
        isIn: [['subscription', 'personal_training', 'supplement', 'other']]
      }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    receipt_number: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    processed_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.TEXT,
      defaultValue: 'completed',
      validate: {
        isIn: [['completed', 'pending', 'refunded', 'cancelled']]
      }
    },
    reference_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    refund_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    refund_reason: {
      type: DataTypes.STRING,
      allowNull: true
    },
    refund_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    tableName: 'payments',
    hooks: {
      beforeCreate: async (payment) => {
        if (!payment.receipt_number) {
          // Generate receipt number: RCP + year + month + sequential number
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          
          const count = await Payment.count({
            where: sequelize.where(
              sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')),
              sequelize.fn('DATE_TRUNC', 'month', now)
            )
          });
          
          payment.receipt_number = `RCP${year}${month}${String(count + 1).padStart(4, '0')}`;
        }
      }
    },
    indexes: [
      {
        fields: ['payment_date']
      },
      {
        fields: ['payment_method']
      },
      {
        fields: ['payment_type']
      },
      {
        fields: ['status']
      }
    ]
  });

  // Instance methods
  Payment.prototype.refund = async function(amount, reason) {
    if (amount > this.amount) {
      throw new Error('مبلغ الاسترداد لا يمكن أن يكون أكبر من المبلغ المدفوع');
    }
    
    this.refund_amount = amount;
    this.refund_reason = reason;
    this.refund_date = new Date();
    this.status = 'refunded';
    
    return await this.save();
  };

  Payment.prototype.getNetAmount = function() {
    return this.amount - this.refund_amount;
  };

  // Class methods
  Payment.associate = (models) => {
    // Payment belongs to Member
    Payment.belongsTo(models.Member, {
      foreignKey: 'member_id',
      as: 'member'
    });

    // Payment belongs to Subscription
    Payment.belongsTo(models.Subscription, {
      foreignKey: 'subscription_id',
      as: 'subscription'
    });

    // Payment belongs to User (processor)
    Payment.belongsTo(models.User, {
      foreignKey: 'processed_by',
      as: 'processor'
    });
  };

  return Payment;
};
