const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    member_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'members',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        isIn: [['renewal_reminder', 'motivational', 'promotional', 'notification', 'welcome']]
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    channel: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'whatsapp',
      validate: {
        isIn: [['whatsapp', 'sms', 'email', 'app_notification']]
      }
    },
    status: {
      type: DataTypes.TEXT,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'sent', 'delivered', 'failed', 'scheduled']]
      }
    },
    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    recipient_phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    recipient_email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    external_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    retry_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    max_retries: {
      type: DataTypes.INTEGER,
      defaultValue: 3
    },
    template_variables: {
      type: DataTypes.JSON,
      allowNull: true
    },
    is_bulk: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    campaign_id: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'messages',
    indexes: [
      {
        fields: ['type']
      },
      {
        fields: ['status']
      },
      {
        fields: ['scheduled_at']
      },
      {
        fields: ['channel']
      },
      {
        fields: ['campaign_id']
      }
    ]
  });

  // Instance methods
  Message.prototype.markAsSent = async function(externalId = null) {
    this.status = 'sent';
    this.sent_at = new Date();
    if (externalId) {
      this.external_id = externalId;
    }
    return await this.save();
  };

  Message.prototype.markAsDelivered = async function() {
    this.status = 'delivered';
    this.delivered_at = new Date();
    return await this.save();
  };

  Message.prototype.markAsFailed = async function(errorMessage) {
    this.status = 'failed';
    this.error_message = errorMessage;
    this.retry_count += 1;
    return await this.save();
  };

  Message.prototype.canRetry = function() {
    return this.retry_count < this.max_retries && this.status === 'failed';
  };

  Message.prototype.schedule = async function(scheduledAt) {
    this.status = 'scheduled';
    this.scheduled_at = scheduledAt;
    return await this.save();
  };

  // Class methods
  Message.associate = (models) => {
    // Message belongs to Member (optional for bulk messages)
    Message.belongsTo(models.Member, {
      foreignKey: 'member_id',
      as: 'member'
    });
  };

  return Message;
};
