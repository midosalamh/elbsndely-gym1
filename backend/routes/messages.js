const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const { Message, Member } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { sendWhatsAppMessage, sendBulkMessages } = require('../services/whatsapp');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// @route   GET /api/messages
// @desc    Get all messages with pagination and filters
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('رقم الصفحة غير صحيح'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('حد النتائج غير صحيح'),
  query('type').optional().isIn(['renewal_reminder', 'motivational', 'promotional', 'notification', 'welcome']).withMessage('نوع الرسالة غير صحيح'),
  query('status').optional().isIn(['pending', 'sent', 'delivered', 'failed', 'scheduled']).withMessage('حالة الرسالة غير صحيحة'),
  query('channel').optional().isIn(['whatsapp', 'sms', 'email', 'app_notification']).withMessage('قناة الإرسال غير صحيحة')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};
    
    if (req.query.type) {
      whereClause.type = req.query.type;
    }

    if (req.query.status) {
      whereClause.status = req.query.status;
    }

    if (req.query.channel) {
      whereClause.channel = req.query.channel;
    }

    // Get messages with pagination
    const { count, rows: messages } = await Message.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Member,
          as: 'member',
          attributes: ['id', 'member_number', 'full_name', 'phone'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      status: 'success',
      data: {
        messages,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_items: count,
          items_per_page: limit,
          has_next: page < totalPages,
          has_prev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في جلب الرسائل'
    });
  }
});

// @route   POST /api/messages/send
// @desc    Send individual message
// @access  Private
router.post('/send', [
  body('member_id')
    .optional()
    .isUUID()
    .withMessage('معرف العضو غير صحيح'),
  body('type')
    .isIn(['renewal_reminder', 'motivational', 'promotional', 'notification', 'welcome'])
    .withMessage('نوع الرسالة غير صحيح'),
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('عنوان الرسالة مطلوب'),
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('محتوى الرسالة مطلوب'),
  body('channel')
    .isIn(['whatsapp', 'sms', 'email', 'app_notification'])
    .withMessage('قناة الإرسال غير صحيحة'),
  body('recipient_phone')
    .optional()
    .isLength({ min: 10, max: 15 })
    .withMessage('رقم الهاتف غير صحيح'),
  body('recipient_email')
    .optional()
    .isEmail()
    .withMessage('البريد الإلكتروني غير صحيح')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const { member_id, type, title, content, channel, recipient_phone, recipient_email, template_variables } = req.body;

    let member = null;
    let phone = recipient_phone;
    let email = recipient_email;

    // If member_id is provided, get member details
    if (member_id) {
      member = await Member.findByPk(member_id);
      if (!member) {
        return res.status(404).json({
          status: 'error',
          message: 'العضو غير موجود'
        });
      }
      
      if (!phone) phone = member.whatsapp_number || member.phone;
      if (!email) email = member.email;
    }

    // Validate recipient based on channel
    if (channel === 'whatsapp' && !phone) {
      return res.status(400).json({
        status: 'error',
        message: 'رقم الهاتف مطلوب لإرسال رسائل واتساب'
      });
    }

    if (channel === 'email' && !email) {
      return res.status(400).json({
        status: 'error',
        message: 'البريد الإلكتروني مطلوب لإرسال الرسائل الإلكترونية'
      });
    }

    // Create message record
    const message = await Message.create({
      member_id,
      type,
      title,
      content,
      channel,
      recipient_phone: phone,
      recipient_email: email,
      template_variables,
      status: 'pending'
    });

    // Send message based on channel
    try {
      if (channel === 'whatsapp') {
        const result = await sendWhatsAppMessage(phone, content);
        if (result.success) {
          await message.markAsSent(result.messageId);
        } else {
          await message.markAsFailed(result.error);
        }
      }
      // Add other channels (SMS, Email) implementation here
    } catch (sendError) {
      await message.markAsFailed(sendError.message);
    }

    res.status(201).json({
      status: 'success',
      message: 'تم إرسال الرسالة بنجاح',
      data: {
        message
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في إرسال الرسالة'
    });
  }
});

// @route   POST /api/messages/bulk
// @desc    Send bulk messages
// @access  Private (Admin/Manager only)
router.post('/bulk', authorize('admin', 'manager'), [
  body('type')
    .isIn(['motivational', 'promotional', 'notification'])
    .withMessage('نوع الرسالة غير صحيح'),
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('عنوان الرسالة مطلوب'),
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('محتوى الرسالة مطلوب'),
  body('channel')
    .isIn(['whatsapp', 'sms', 'email', 'app_notification'])
    .withMessage('قناة الإرسال غير صحيحة'),
  body('target_audience')
    .isIn(['all_active', 'active_subscriptions', 'expired_subscriptions', 'specific_members'])
    .withMessage('الجمهور المستهدف غير صحيح'),
  body('member_ids')
    .optional()
    .isArray()
    .withMessage('قائمة معرفات الأعضاء يجب أن تكون مصفوفة')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const { type, title, content, channel, target_audience, member_ids, scheduled_at } = req.body;

    // Build member query based on target audience
    let memberWhere = { is_active: true };
    
    switch (target_audience) {
      case 'all_active':
        // All active members
        break;
      case 'active_subscriptions':
        // Members with active subscriptions
        memberWhere = {
          ...memberWhere,
          '$subscriptions.status$': 'active'
        };
        break;
      case 'expired_subscriptions':
        // Members with expired subscriptions
        memberWhere = {
          ...memberWhere,
          '$subscriptions.status$': 'expired'
        };
        break;
      case 'specific_members':
        if (!member_ids || member_ids.length === 0) {
          return res.status(400).json({
            status: 'error',
            message: 'يجب تحديد الأعضاء المستهدفين'
          });
        }
        memberWhere = {
          ...memberWhere,
          id: { [Op.in]: member_ids }
        };
        break;
    }

    // Get target members
    const members = await Member.findAll({
      where: memberWhere,
      include: target_audience.includes('subscriptions') ? [
        {
          model: Subscription,
          as: 'subscriptions',
          required: true
        }
      ] : [],
      attributes: ['id', 'full_name', 'phone', 'whatsapp_number', 'email']
    });

    if (members.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'لا يوجد أعضاء مطابقين للمعايير المحددة'
      });
    }

    // Generate campaign ID
    const campaignId = `BULK_${Date.now()}`;

    // Create message records for each member
    const messagePromises = members.map(member => {
      const recipientPhone = member.whatsapp_number || member.phone;
      const recipientEmail = member.email;

      // Skip if no contact method available for the channel
      if (channel === 'whatsapp' && !recipientPhone) return null;
      if (channel === 'email' && !recipientEmail) return null;

      return Message.create({
        member_id: member.id,
        type,
        title,
        content,
        channel,
        recipient_phone: recipientPhone,
        recipient_email: recipientEmail,
        status: scheduled_at ? 'scheduled' : 'pending',
        scheduled_at,
        is_bulk: true,
        campaign_id
      });
    });

    const messages = await Promise.all(messagePromises.filter(p => p !== null));

    // If not scheduled, send immediately
    if (!scheduled_at && channel === 'whatsapp') {
      const sendPromises = messages.map(async (message) => {
        try {
          const result = await sendWhatsAppMessage(message.recipient_phone, content);
          if (result.success) {
            await message.markAsSent(result.messageId);
          } else {
            await message.markAsFailed(result.error);
          }
        } catch (error) {
          await message.markAsFailed(error.message);
        }
      });

      await Promise.all(sendPromises);
    }

    res.status(201).json({
      status: 'success',
      message: `تم ${scheduled_at ? 'جدولة' : 'إرسال'} ${messages.length} رسالة بنجاح`,
      data: {
        campaign_id: campaignId,
        total_messages: messages.length,
        scheduled: !!scheduled_at
      }
    });
  } catch (error) {
    console.error('Bulk message error:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في إرسال الرسائل المجمعة'
    });
  }
});

// @route   GET /api/messages/templates
// @desc    Get message templates
// @access  Private
router.get('/templates', async (req, res) => {
  try {
    const templates = {
      renewal_reminder: [
        {
          title: 'تذكير تجديد الاشتراك',
          content: 'مرحباً {{member_name}}، ينتهي اشتراكك في {{end_date}}. يرجى التجديد لمواصلة الاستفادة من خدماتنا.'
        }
      ],
      motivational: [
        {
          title: 'رسالة تحفيزية',
          content: 'لا تستسلم أبداً! كل تمرين يقربك خطوة من هدفك. استمر وستحقق ما تريد! 💪'
        },
        {
          title: 'نصيحة يومية',
          content: 'تذكر: النجاح لا يأتي من الراحة، بل من التحدي والمثابرة. اجعل اليوم أفضل من الأمس!'
        }
      ],
      promotional: [
        {
          title: 'عرض خاص',
          content: 'عرض محدود! خصم 20% على جميع الاشتراكات الجديدة. سارع بالحجز قبل انتهاء العرض!'
        }
      ],
      welcome: [
        {
          title: 'مرحباً بك',
          content: 'مرحباً {{member_name}}! أهلاً بك في عائلة البسنديلي جيم. نتطلع لمساعدتك في تحقيق أهدافك الرياضية!'
        }
      ]
    };

    res.json({
      status: 'success',
      data: {
        templates
      }
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في جلب قوالب الرسائل'
    });
  }
});

module.exports = router;
