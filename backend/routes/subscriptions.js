const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const moment = require('moment');
const { Subscription, SubscriptionType, Member, Payment } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// @route   GET /api/subscriptions/types
// @desc    Get all subscription types
// @access  Private
router.get('/types', async (req, res) => {
  try {
    const subscriptionTypes = await SubscriptionType.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC'], ['duration_months', 'ASC']]
    });

    res.json({
      status: 'success',
      data: {
        subscription_types: subscriptionTypes
      }
    });
  } catch (error) {
    console.error('Get subscription types error:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في جلب أنواع الاشتراكات'
    });
  }
});

// @route   POST /api/subscriptions/types
// @desc    Create subscription type
// @access  Private (Admin/Manager only)
router.post('/types', authorize('admin', 'manager'), [
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('اسم نوع الاشتراك يجب أن يكون بين 2 و 100 حرف'),
  body('duration_months')
    .isInt({ min: 1, max: 24 })
    .withMessage('مدة الاشتراك يجب أن تكون بين 1 و 24 شهر'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('السعر يجب أن يكون رقم موجب')
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

    // Check if subscription type name already exists
    const existingType = await SubscriptionType.findOne({
      where: { name: req.body.name }
    });

    if (existingType) {
      return res.status(400).json({
        status: 'error',
        message: 'نوع الاشتراك موجود بالفعل'
      });
    }

    const subscriptionType = await SubscriptionType.create(req.body);

    res.status(201).json({
      status: 'success',
      message: 'تم إنشاء نوع الاشتراك بنجاح',
      data: {
        subscription_type: subscriptionType
      }
    });
  } catch (error) {
    console.error('Create subscription type error:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في إنشاء نوع الاشتراك'
    });
  }
});

// @route   GET /api/subscriptions
// @desc    Get all subscriptions with pagination and filters
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('رقم الصفحة غير صحيح'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('حد النتائج غير صحيح'),
  query('status').optional().isIn(['active', 'expired', 'frozen', 'cancelled']).withMessage('حالة الاشتراك غير صحيحة'),
  query('expiring_soon').optional().isBoolean().withMessage('قيمة انتهاء الاشتراك قريباً غير صحيحة')
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
    const status = req.query.status;
    const expiringSoon = req.query.expiring_soon === 'true';

    // Build where clause
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }

    if (expiringSoon) {
      const threeDaysFromNow = moment().add(3, 'days').format('YYYY-MM-DD');
      const today = moment().format('YYYY-MM-DD');
      
      whereClause.end_date = {
        [Op.between]: [today, threeDaysFromNow]
      };
      whereClause.status = 'active';
    }

    // Get subscriptions with pagination
    const { count, rows: subscriptions } = await Subscription.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Member,
          as: 'member',
          attributes: ['id', 'member_number', 'full_name', 'phone', 'whatsapp_number']
        },
        {
          model: SubscriptionType,
          as: 'subscription_type'
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
        subscriptions,
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
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في جلب بيانات الاشتراكات'
    });
  }
});

// @route   POST /api/subscriptions
// @desc    Create new subscription
// @access  Private
router.post('/', [
  body('member_id')
    .isUUID()
    .withMessage('معرف العضو غير صحيح'),
  body('subscription_type_id')
    .isUUID()
    .withMessage('معرف نوع الاشتراك غير صحيح'),
  body('amount_paid')
    .isFloat({ min: 0 })
    .withMessage('المبلغ المدفوع يجب أن يكون رقم موجب'),
  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('تاريخ البداية غير صحيح')
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

    const { member_id, subscription_type_id, amount_paid, discount_amount, notes, start_date } = req.body;

    // Check if member exists
    const member = await Member.findByPk(member_id);
    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: 'العضو غير موجود'
      });
    }

    // Check if subscription type exists
    const subscriptionType = await SubscriptionType.findByPk(subscription_type_id);
    if (!subscriptionType) {
      return res.status(404).json({
        status: 'error',
        message: 'نوع الاشتراك غير موجود'
      });
    }

    // Check if member has active subscription
    const activeSubscription = await Subscription.findOne({
      where: {
        member_id,
        status: 'active'
      }
    });

    if (activeSubscription) {
      return res.status(400).json({
        status: 'error',
        message: 'العضو لديه اشتراك نشط بالفعل'
      });
    }

    // Create subscription
    const subscription = await Subscription.create({
      member_id,
      subscription_type_id,
      amount_paid,
      discount_amount: discount_amount || 0,
      notes,
      start_date: start_date || new Date()
    });

    // Create payment record
    await Payment.create({
      member_id,
      subscription_id: subscription.id,
      amount: amount_paid,
      payment_type: 'subscription',
      description: `اشتراك ${subscriptionType.name}`,
      processed_by: req.user.id
    });

    // Load subscription with relations
    const newSubscription = await Subscription.findByPk(subscription.id, {
      include: [
        {
          model: Member,
          as: 'member'
        },
        {
          model: SubscriptionType,
          as: 'subscription_type'
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'تم إنشاء الاشتراك بنجاح',
      data: {
        subscription: newSubscription
      }
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في إنشاء الاشتراك'
    });
  }
});

// @route   PUT /api/subscriptions/:id/freeze
// @desc    Freeze subscription
// @access  Private
router.put('/:id/freeze', [
  body('reason')
    .isLength({ min: 2, max: 200 })
    .withMessage('سبب التجميد مطلوب'),
  body('days')
    .isInt({ min: 1, max: 90 })
    .withMessage('عدد أيام التجميد يجب أن يكون بين 1 و 90 يوم')
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

    const subscription = await Subscription.findByPk(req.params.id, {
      include: [
        {
          model: SubscriptionType,
          as: 'subscription_type'
        }
      ]
    });

    if (!subscription) {
      return res.status(404).json({
        status: 'error',
        message: 'الاشتراك غير موجود'
      });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({
        status: 'error',
        message: 'لا يمكن تجميد اشتراك غير نشط'
      });
    }

    const { reason, days } = req.body;

    // Check if freeze days exceed allowed limit
    if (days > subscription.subscription_type.max_freeze_days) {
      return res.status(400).json({
        status: 'error',
        message: `عدد أيام التجميد لا يمكن أن يتجاوز ${subscription.subscription_type.max_freeze_days} يوم`
      });
    }

    await subscription.freeze(reason, days);

    res.json({
      status: 'success',
      message: 'تم تجميد الاشتراك بنجاح',
      data: {
        subscription
      }
    });
  } catch (error) {
    console.error('Freeze subscription error:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في تجميد الاشتراك'
    });
  }
});

// @route   PUT /api/subscriptions/:id/unfreeze
// @desc    Unfreeze subscription
// @access  Private
router.put('/:id/unfreeze', async (req, res) => {
  try {
    const subscription = await Subscription.findByPk(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        status: 'error',
        message: 'الاشتراك غير موجود'
      });
    }

    if (subscription.status !== 'frozen') {
      return res.status(400).json({
        status: 'error',
        message: 'الاشتراك غير مجمد'
      });
    }

    await subscription.unfreeze();

    res.json({
      status: 'success',
      message: 'تم إلغاء تجميد الاشتراك بنجاح',
      data: {
        subscription
      }
    });
  } catch (error) {
    console.error('Unfreeze subscription error:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في إلغاء تجميد الاشتراك'
    });
  }
});

module.exports = router;
