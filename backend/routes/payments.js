const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const { Payment, Member, Subscription, SubscriptionType } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// @route   GET /api/payments
// @desc    Get all payments with pagination and filters
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('رقم الصفحة غير صحيح'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('حد النتائج غير صحيح'),
  query('payment_method').optional().isIn(['cash', 'card', 'bank_transfer', 'mobile_payment']).withMessage('طريقة الدفع غير صحيحة'),
  query('payment_type').optional().isIn(['subscription', 'personal_training', 'supplement', 'other']).withMessage('نوع الدفع غير صحيح'),
  query('status').optional().isIn(['completed', 'pending', 'refunded', 'cancelled']).withMessage('حالة الدفع غير صحيحة'),
  query('date_from').optional().isISO8601().withMessage('تاريخ البداية غير صحيح'),
  query('date_to').optional().isISO8601().withMessage('تاريخ النهاية غير صحيح')
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
    
    if (req.query.payment_method) {
      whereClause.payment_method = req.query.payment_method;
    }

    if (req.query.payment_type) {
      whereClause.payment_type = req.query.payment_type;
    }

    if (req.query.status) {
      whereClause.status = req.query.status;
    }

    if (req.query.date_from || req.query.date_to) {
      whereClause.payment_date = {};
      if (req.query.date_from) {
        whereClause.payment_date[Op.gte] = req.query.date_from;
      }
      if (req.query.date_to) {
        whereClause.payment_date[Op.lte] = req.query.date_to;
      }
    }

    // Get payments with pagination
    const { count, rows: payments } = await Payment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Member,
          as: 'member',
          attributes: ['id', 'member_number', 'full_name', 'phone']
        },
        {
          model: Subscription,
          as: 'subscription',
          include: [
            {
              model: SubscriptionType,
              as: 'subscription_type',
              attributes: ['name', 'duration_months']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    const totalPages = Math.ceil(count / limit);

    // Calculate totals
    const totals = await Payment.findOne({
      where: whereClause,
      attributes: [
        [Payment.sequelize.fn('SUM', Payment.sequelize.col('amount')), 'total_amount'],
        [Payment.sequelize.fn('SUM', Payment.sequelize.col('refund_amount')), 'total_refunds'],
        [Payment.sequelize.fn('COUNT', Payment.sequelize.col('id')), 'total_count']
      ],
      raw: true
    });

    res.json({
      status: 'success',
      data: {
        payments,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_items: count,
          items_per_page: limit,
          has_next: page < totalPages,
          has_prev: page > 1
        },
        totals: {
          total_amount: parseFloat(totals.total_amount) || 0,
          total_refunds: parseFloat(totals.total_refunds) || 0,
          net_amount: (parseFloat(totals.total_amount) || 0) - (parseFloat(totals.total_refunds) || 0),
          total_count: parseInt(totals.total_count) || 0
        }
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في جلب بيانات المدفوعات'
    });
  }
});

// @route   GET /api/payments/:id
// @desc    Get payment by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [
        {
          model: Member,
          as: 'member'
        },
        {
          model: Subscription,
          as: 'subscription',
          include: [
            {
              model: SubscriptionType,
              as: 'subscription_type'
            }
          ]
        }
      ]
    });

    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'المدفوعة غير موجودة'
      });
    }

    res.json({
      status: 'success',
      data: {
        payment
      }
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في جلب بيانات المدفوعة'
    });
  }
});

// @route   POST /api/payments
// @desc    Create new payment
// @access  Private
router.post('/', [
  body('member_id')
    .isUUID()
    .withMessage('معرف العضو غير صحيح'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('المبلغ يجب أن يكون رقم موجب'),
  body('payment_method')
    .isIn(['cash', 'card', 'bank_transfer', 'mobile_payment'])
    .withMessage('طريقة الدفع غير صحيحة'),
  body('payment_type')
    .isIn(['subscription', 'personal_training', 'supplement', 'other'])
    .withMessage('نوع الدفع غير صحيح'),
  body('payment_date')
    .optional()
    .isISO8601()
    .withMessage('تاريخ الدفع غير صحيح')
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

    const { member_id, subscription_id, amount, payment_method, payment_type, description, notes, payment_date, reference_number } = req.body;

    // Check if member exists
    const member = await Member.findByPk(member_id);
    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: 'العضو غير موجود'
      });
    }

    // Check if subscription exists (if provided)
    if (subscription_id) {
      const subscription = await Subscription.findByPk(subscription_id);
      if (!subscription) {
        return res.status(404).json({
          status: 'error',
          message: 'الاشتراك غير موجود'
        });
      }
    }

    // Create payment
    const payment = await Payment.create({
      member_id,
      subscription_id,
      amount,
      payment_method,
      payment_type,
      description,
      notes,
      payment_date: payment_date || new Date(),
      reference_number,
      processed_by: req.user.id
    });

    // Load payment with relations
    const newPayment = await Payment.findByPk(payment.id, {
      include: [
        {
          model: Member,
          as: 'member'
        },
        {
          model: Subscription,
          as: 'subscription',
          include: [
            {
              model: SubscriptionType,
              as: 'subscription_type'
            }
          ]
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'تم إنشاء المدفوعة بنجاح',
      data: {
        payment: newPayment
      }
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في إنشاء المدفوعة'
    });
  }
});

// @route   PUT /api/payments/:id/refund
// @desc    Refund payment
// @access  Private (Admin/Manager only)
router.put('/:id/refund', authorize('admin', 'manager'), [
  body('refund_amount')
    .isFloat({ min: 0 })
    .withMessage('مبلغ الاسترداد يجب أن يكون رقم موجب'),
  body('refund_reason')
    .isLength({ min: 2, max: 200 })
    .withMessage('سبب الاسترداد مطلوب')
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

    const payment = await Payment.findByPk(req.params.id);

    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'المدفوعة غير موجودة'
      });
    }

    if (payment.status === 'refunded') {
      return res.status(400).json({
        status: 'error',
        message: 'المدفوعة مستردة بالفعل'
      });
    }

    const { refund_amount, refund_reason } = req.body;

    if (refund_amount > payment.amount) {
      return res.status(400).json({
        status: 'error',
        message: 'مبلغ الاسترداد لا يمكن أن يكون أكبر من المبلغ المدفوع'
      });
    }

    await payment.refund(refund_amount, refund_reason);

    res.json({
      status: 'success',
      message: 'تم استرداد المدفوعة بنجاح',
      data: {
        payment
      }
    });
  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'خطأ في استرداد المدفوعة'
    });
  }
});

// @route   GET /api/payments/member/:memberId
// @desc    Get payments for specific member
// @access  Private
router.get('/member/:memberId', async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { member_id: req.params.memberId },
      include: [
        {
          model: Subscription,
          as: 'subscription',
          include: [
            {
              model: SubscriptionType,
              as: 'subscription_type'
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        payments
      }
    });
  } catch (error) {
    console.error('Get member payments error:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في جلب مدفوعات العضو'
    });
  }
});

module.exports = router;
