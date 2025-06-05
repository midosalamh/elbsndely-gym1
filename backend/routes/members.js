const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const { Member, Subscription, SubscriptionType, Payment } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// @route   GET /api/members
// @desc    Get all members with pagination and search
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('رقم الصفحة غير صحيح'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('حد النتائج غير صحيح'),
  query('search').optional().isLength({ max: 100 }).withMessage('نص البحث طويل جداً'),
  query('status').optional().isIn(['active', 'inactive']).withMessage('حالة العضو غير صحيحة'),
  query('gender').optional().isIn(['male', 'female']).withMessage('الجنس غير صحيح')
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
    const search = req.query.search;
    const status = req.query.status;
    const gender = req.query.gender;

    // Build where clause
    const whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { member_number: { [Op.like]: `%${search}%` } }
      ];
    }

    if (status) {
      whereClause.is_active = status === 'active';
    }

    if (gender) {
      whereClause.gender = gender;
    }

    // Get members with pagination
    const { count, rows: members } = await Member.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Subscription,
          as: 'subscriptions',
          include: [
            {
              model: SubscriptionType,
              as: 'subscription_type'
            }
          ],
          order: [['created_at', 'DESC']],
          limit: 1
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
        members,
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
    console.error('Get members error:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في جلب بيانات الأعضاء'
    });
  }
});

// @route   GET /api/members/:id
// @desc    Get member by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id, {
      include: [
        {
          model: Subscription,
          as: 'subscriptions',
          include: [
            {
              model: SubscriptionType,
              as: 'subscription_type'
            }
          ],
          order: [['created_at', 'DESC']]
        },
        {
          model: Payment,
          as: 'payments',
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: 'العضو غير موجود'
      });
    }

    res.json({
      status: 'success',
      data: {
        member
      }
    });
  } catch (error) {
    console.error('Get member error:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في جلب بيانات العضو'
    });
  }
});

// @route   POST /api/members
// @desc    Create new member
// @access  Private
router.post('/', [
  body('full_name')
    .isLength({ min: 2, max: 100 })
    .withMessage('الاسم الكامل يجب أن يكون بين 2 و 100 حرف'),
  body('phone')
    .isLength({ min: 10, max: 15 })
    .withMessage('رقم الهاتف غير صحيح'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('البريد الإلكتروني غير صحيح'),
  body('gender')
    .isIn(['male', 'female'])
    .withMessage('الجنس مطلوب'),
  body('date_of_birth')
    .optional()
    .isISO8601()
    .withMessage('تاريخ الميلاد غير صحيح')
], async (req, res) => {
  try {
    console.log('Creating member with data:', req.body);

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        status: 'error',
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const memberData = {
      ...req.body,
      created_by: req.user.id
    };

    console.log('User ID:', req.user.id);
    console.log('Member data to create:', memberData);

    // Check if phone number already exists
    if (memberData.phone) {
      const existingMember = await Member.findOne({
        where: { phone: memberData.phone }
      });
      
      if (existingMember) {
        return res.status(400).json({
          status: 'error',
          message: 'رقم الهاتف مستخدم بالفعل'
        });
      }
    }

    // Check if email already exists
    if (memberData.email) {
      const existingMember = await Member.findOne({
        where: { email: memberData.email }
      });
      
      if (existingMember) {
        return res.status(400).json({
          status: 'error',
          message: 'البريد الإلكتروني مستخدم بالفعل'
        });
      }
    }

    const member = await Member.create(memberData);

    res.status(201).json({
      status: 'success',
      message: 'تم إنشاء العضو بنجاح',
      data: {
        member
      }
    });
  } catch (error) {
    console.error('Create member error:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في إنشاء العضو'
    });
  }
});

// @route   PUT /api/members/:id
// @desc    Update member
// @access  Private
router.put('/:id', [
  body('full_name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('الاسم الكامل يجب أن يكون بين 2 و 100 حرف'),
  body('phone')
    .optional()
    .isLength({ min: 10, max: 15 })
    .withMessage('رقم الهاتف غير صحيح'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('البريد الإلكتروني غير صحيح'),
  body('gender')
    .optional()
    .isIn(['male', 'female'])
    .withMessage('الجنس غير صحيح'),
  body('date_of_birth')
    .optional()
    .isISO8601()
    .withMessage('تاريخ الميلاد غير صحيح')
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

    const member = await Member.findByPk(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: 'العضو غير موجود'
      });
    }

    // Check if phone number already exists (excluding current member)
    if (req.body.phone && req.body.phone !== member.phone) {
      const existingMember = await Member.findOne({
        where: { 
          phone: req.body.phone,
          id: { [Op.ne]: member.id }
        }
      });
      
      if (existingMember) {
        return res.status(400).json({
          status: 'error',
          message: 'رقم الهاتف مستخدم بالفعل'
        });
      }
    }

    // Check if email already exists (excluding current member)
    if (req.body.email && req.body.email !== member.email) {
      const existingMember = await Member.findOne({
        where: { 
          email: req.body.email,
          id: { [Op.ne]: member.id }
        }
      });
      
      if (existingMember) {
        return res.status(400).json({
          status: 'error',
          message: 'البريد الإلكتروني مستخدم بالفعل'
        });
      }
    }

    await member.update(req.body);

    res.json({
      status: 'success',
      message: 'تم تحديث بيانات العضو بنجاح',
      data: {
        member
      }
    });
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في تحديث بيانات العضو'
    });
  }
});

// @route   DELETE /api/members/:id
// @desc    Delete member (soft delete)
// @access  Private (Admin/Manager only)
router.delete('/:id', authorize('admin', 'manager'), async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: 'العضو غير موجود'
      });
    }

    // Soft delete by setting is_active to false
    await member.update({ is_active: false });

    res.json({
      status: 'success',
      message: 'تم حذف العضو بنجاح'
    });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في حذف العضو'
    });
  }
});

module.exports = router;
