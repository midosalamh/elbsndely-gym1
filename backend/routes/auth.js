const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { User } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (but should be restricted in production)
router.post('/register', [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('اسم المستخدم يجب أن يكون بين 3 و 50 حرف'),
  body('email')
    .isEmail()
    .withMessage('البريد الإلكتروني غير صحيح'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  body('full_name')
    .isLength({ min: 2, max: 100 })
    .withMessage('الاسم الكامل يجب أن يكون بين 2 و 100 حرف'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'receptionist'])
    .withMessage('الدور غير صحيح')
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

    const { username, email, password, full_name, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'المستخدم موجود بالفعل'
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      full_name,
      phone,
      role: role || 'receptionist'
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      status: 'success',
      message: 'تم إنشاء الحساب بنجاح',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في إنشاء الحساب'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('login')
    .notEmpty()
    .withMessage('اسم المستخدم أو البريد الإلكتروني مطلوب'),
  body('password')
    .notEmpty()
    .withMessage('كلمة المرور مطلوبة')
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

    const { login, password } = req.body;

    // Find user by email or username
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: login },
          { username: login }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'بيانات الدخول غير صحيحة'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        status: 'error',
        message: 'الحساب غير مفعل'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'بيانات الدخول غير صحيحة'
      });
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user.id);

    res.json({
      status: 'success',
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في تسجيل الدخول'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في جلب بيانات المستخدم'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, [
  body('full_name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('الاسم الكامل يجب أن يكون بين 2 و 100 حرف'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('البريد الإلكتروني غير صحيح'),
  body('phone')
    .optional()
    .isLength({ min: 10, max: 15 })
    .withMessage('رقم الهاتف غير صحيح')
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

    const { full_name, email, phone } = req.body;
    const user = req.user;

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        where: { email, id: { [Op.ne]: user.id } }
      });
      
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'البريد الإلكتروني مستخدم بالفعل'
        });
      }
    }

    // Update user
    await user.update({
      full_name: full_name || user.full_name,
      email: email || user.email,
      phone: phone || user.phone
    });

    res.json({
      status: 'success',
      message: 'تم تحديث الملف الشخصي بنجاح',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في تحديث الملف الشخصي'
    });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', authenticate, [
  body('current_password')
    .notEmpty()
    .withMessage('كلمة المرور الحالية مطلوبة'),
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل')
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

    const { current_password, new_password } = req.body;
    const user = req.user;

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(current_password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: 'كلمة المرور الحالية غير صحيحة'
      });
    }

    // Update password
    user.password = new_password;
    await user.save();

    res.json({
      status: 'success',
      message: 'تم تغيير كلمة المرور بنجاح'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في تغيير كلمة المرور'
    });
  }
});

module.exports = router;
