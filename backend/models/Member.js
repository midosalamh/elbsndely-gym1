const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Member = sequelize.define('Member', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    member_number: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [10, 15]
      }
    },
    whatsapp_number: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [10, 15]
      }
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    gender: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        isIn: [['male', 'female']]
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    emergency_contact_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    emergency_contact_phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    medical_conditions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    profile_picture: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    loyalty_points: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    join_date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'members',
    hooks: {
      beforeCreate: async (member) => {
        if (!member.member_number) {
          // Generate member number: GYM + year + sequential number
          const year = new Date().getFullYear();
          const count = await Member.count();
          member.member_number = `GYM${year}${String(count + 1).padStart(4, '0')}`;
        }

        // Set WhatsApp number same as phone if not provided
        if (!member.whatsapp_number && member.phone) {
          member.whatsapp_number = member.phone;
        }
      }
    }
  });

  // Instance methods
  Member.prototype.getAge = function() {
    if (!this.date_of_birth) return null;
    const today = new Date();
    const birthDate = new Date(this.date_of_birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  Member.prototype.getCurrentSubscription = async function() {
    const { Subscription } = require('../config/database');
    return await Subscription.findOne({
      where: {
        member_id: this.id,
        status: 'active'
      },
      include: ['subscription_type'],
      order: [['created_at', 'DESC']]
    });
  };

  // Class methods
  Member.associate = (models) => {
    // Member belongs to User (creator)
    Member.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });

    // Member has many subscriptions
    Member.hasMany(models.Subscription, {
      foreignKey: 'member_id',
      as: 'subscriptions'
    });

    // Member has many payments
    Member.hasMany(models.Payment, {
      foreignKey: 'member_id',
      as: 'payments'
    });

    // Member has many messages
    Member.hasMany(models.Message, {
      foreignKey: 'member_id',
      as: 'messages'
    });
  };

  return Member;
};
