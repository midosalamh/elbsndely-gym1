const cron = require('node-cron');
const moment = require('moment');
const { Op, col } = require('sequelize');
const { Member, Subscription, SubscriptionType, Message } = require('../config/database');
const { sendRenewalReminder, sendMotivationalMessage } = require('./whatsapp');

/**
 * Check for expiring subscriptions and send renewal reminders
 */
const checkExpiringSubscriptions = async () => {
  try {
    console.log('🔍 Checking for expiring subscriptions...');
    
    // Get subscriptions expiring in 3 days
    const threeDaysFromNow = moment().add(3, 'days').format('YYYY-MM-DD');
    const today = moment().format('YYYY-MM-DD');
    
    const expiringSubscriptions = await Subscription.findAll({
      where: {
        status: 'active',
        end_date: {
          [Op.between]: [today, threeDaysFromNow]
        },
        renewal_reminder_sent: false
      },
      include: [
        {
          model: Member,
          as: 'member',
          where: { is_active: true }
        },
        {
          model: SubscriptionType,
          as: 'subscription_type'
        }
      ]
    });

    console.log(`📋 Found ${expiringSubscriptions.length} expiring subscriptions`);

    for (const subscription of expiringSubscriptions) {
      try {
        // Create renewal reminder message
        await Message.create({
          member_id: subscription.member.id,
          type: 'renewal_reminder',
          title: 'تذكير تجديد الاشتراك',
          content: `تذكير: ينتهي اشتراكك في ${subscription.end_date}`,
          channel: 'whatsapp',
          recipient_phone: subscription.member.whatsapp_number || subscription.member.phone,
          status: 'pending'
        });

        // Send WhatsApp reminder
        const result = await sendRenewalReminder(subscription.member, subscription);
        
        if (result.success) {
          // Mark reminder as sent
          await subscription.update({ renewal_reminder_sent: true });
          console.log(`✅ Renewal reminder sent to ${subscription.member.full_name}`);
        } else {
          console.error(`❌ Failed to send reminder to ${subscription.member.full_name}:`, result.error);
        }
      } catch (error) {
        console.error(`❌ Error processing subscription ${subscription.id}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Error in checkExpiringSubscriptions:', error);
  }
};

/**
 * Update expired subscriptions status
 */
const updateExpiredSubscriptions = async () => {
  try {
    console.log('🔍 Checking for expired subscriptions...');
    
    const today = moment().format('YYYY-MM-DD');
    
    const expiredCount = await Subscription.update(
      { status: 'expired' },
      {
        where: {
          status: 'active',
          end_date: {
            [Op.lt]: today
          }
        }
      }
    );

    if (expiredCount[0] > 0) {
      console.log(`📋 Updated ${expiredCount[0]} expired subscriptions`);
    }
  } catch (error) {
    console.error('❌ Error in updateExpiredSubscriptions:', error);
  }
};

/**
 * Send daily motivational messages
 */
const sendDailyMotivationalMessages = async () => {
  try {
    console.log('💪 Sending daily motivational messages...');
    
    // Get active members with active subscriptions
    const activeMembers = await Member.findAll({
      where: { is_active: true },
      include: [
        {
          model: Subscription,
          as: 'subscriptions',
          where: { status: 'active' },
          required: true
        }
      ],
      limit: 50 // Limit to avoid overwhelming the system
    });

    console.log(`📋 Found ${activeMembers.length} active members`);

    // Send to random subset (30% of active members)
    const targetCount = Math.ceil(activeMembers.length * 0.3);
    const shuffled = activeMembers.sort(() => 0.5 - Math.random());
    const selectedMembers = shuffled.slice(0, targetCount);

    for (const member of selectedMembers) {
      try {
        // Create motivational message
        await Message.create({
          member_id: member.id,
          type: 'motivational',
          title: 'رسالة تحفيزية يومية',
          content: 'رسالة تحفيزية لتشجيع العضو على مواصلة التمرين',
          channel: 'whatsapp',
          recipient_phone: member.whatsapp_number || member.phone,
          status: 'pending'
        });

        // Send motivational message
        const result = await sendMotivationalMessage(
          member.whatsapp_number || member.phone,
          member.full_name
        );
        
        if (result.success) {
          console.log(`✅ Motivational message sent to ${member.full_name}`);
        } else {
          console.error(`❌ Failed to send motivational message to ${member.full_name}:`, result.error);
        }

        // Add delay between messages
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Error sending motivational message to ${member.full_name}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Error in sendDailyMotivationalMessages:', error);
  }
};

/**
 * Process scheduled messages
 */
const processScheduledMessages = async () => {
  try {
    console.log('📅 Processing scheduled messages...');
    
    const now = new Date();
    
    const scheduledMessages = await Message.findAll({
      where: {
        status: 'scheduled',
        scheduled_at: {
          [Op.lte]: now
        }
      },
      include: [
        {
          model: Member,
          as: 'member',
          required: false
        }
      ]
    });

    console.log(`📋 Found ${scheduledMessages.length} scheduled messages`);

    for (const message of scheduledMessages) {
      try {
        // Update status to pending
        await message.update({ status: 'pending' });

        // Send message based on channel
        if (message.channel === 'whatsapp') {
          const { sendWhatsAppMessage } = require('./whatsapp');
          const result = await sendWhatsAppMessage(message.recipient_phone, message.content);
          
          if (result.success) {
            await message.markAsSent(result.messageId);
            console.log(`✅ Scheduled message sent: ${message.id}`);
          } else {
            await message.markAsFailed(result.error);
            console.error(`❌ Failed to send scheduled message ${message.id}:`, result.error);
          }
        }
      } catch (error) {
        console.error(`❌ Error processing scheduled message ${message.id}:`, error);
        await message.markAsFailed(error.message);
      }
    }
  } catch (error) {
    console.error('❌ Error in processScheduledMessages:', error);
  }
};

/**
 * Retry failed messages
 */
const retryFailedMessages = async () => {
  try {
    console.log('🔄 Retrying failed messages...');
    
    const failedMessages = await Message.findAll({
      where: {
        status: 'failed',
        retry_count: {
          [Op.lt]: col('max_retries')
        }
      }
    });

    console.log(`📋 Found ${failedMessages.length} failed messages to retry`);

    for (const message of failedMessages) {
      try {
        if (message.channel === 'whatsapp') {
          const { sendWhatsAppMessage } = require('./whatsapp');
          const result = await sendWhatsAppMessage(message.recipient_phone, message.content);
          
          if (result.success) {
            await message.markAsSent(result.messageId);
            console.log(`✅ Retry successful for message: ${message.id}`);
          } else {
            await message.markAsFailed(result.error);
            console.error(`❌ Retry failed for message ${message.id}:`, result.error);
          }
        }
      } catch (error) {
        console.error(`❌ Error retrying message ${message.id}:`, error);
        await message.markAsFailed(error.message);
      }
    }
  } catch (error) {
    console.error('❌ Error in retryFailedMessages:', error);
  }
};

/**
 * Start all scheduled jobs
 */
const startScheduledJobs = () => {
  console.log('🚀 Starting scheduled jobs...');

  // Check expiring subscriptions daily at 9 AM
  cron.schedule('0 9 * * *', () => {
    console.log('⏰ Running daily expiring subscriptions check...');
    checkExpiringSubscriptions();
  });

  // Update expired subscriptions daily at midnight
  cron.schedule('0 0 * * *', () => {
    console.log('⏰ Running daily expired subscriptions update...');
    updateExpiredSubscriptions();
  });

  // Send motivational messages every other day at 7 PM
  cron.schedule('0 19 */2 * *', () => {
    console.log('⏰ Running motivational messages job...');
    sendDailyMotivationalMessages();
  });

  // Process scheduled messages every 15 minutes
  cron.schedule('*/15 * * * *', () => {
    console.log('⏰ Processing scheduled messages...');
    processScheduledMessages();
  });

  // Retry failed messages every hour
  cron.schedule('0 * * * *', () => {
    console.log('⏰ Retrying failed messages...');
    retryFailedMessages();
  });

  console.log('✅ All scheduled jobs started successfully');
};

module.exports = {
  startScheduledJobs,
  checkExpiringSubscriptions,
  updateExpiredSubscriptions,
  sendDailyMotivationalMessages,
  processScheduledMessages,
  retryFailedMessages
};
