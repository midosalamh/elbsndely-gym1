const express = require('express');
const { query, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const moment = require('moment');
const { Member, Subscription, SubscriptionType, Payment, sequelize } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// @route   GET /api/reports/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get('/dashboard', async (req, res) => {
  try {
    const today = moment().format('YYYY-MM-DD');
    const thisMonth = moment().format('YYYY-MM');
    const lastMonth = moment().subtract(1, 'month').format('YYYY-MM');

    // Total members
    const totalMembers = await Member.count({
      where: { is_active: true }
    });

    // Active subscriptions
    const activeSubscriptions = await Subscription.count({
      where: { status: 'active' }
    });

    // Expiring subscriptions (next 7 days)
    const expiringSubscriptions = await Subscription.count({
      where: {
        status: 'active',
        end_date: {
          [Op.between]: [today, moment().add(7, 'days').format('YYYY-MM-DD')]
        }
      }
    });

    // Expired subscriptions
    const expiredSubscriptions = await Subscription.count({
      where: {
        status: 'active',
        end_date: {
          [Op.lt]: today
        }
      }
    });

    // This month revenue
    const thisMonthRevenue = await Payment.sum('amount', {
      where: {
        payment_date: {
          [Op.like]: `${thisMonth}%`
        },
        status: 'completed'
      }
    }) || 0;

    // Last month revenue
    const lastMonthRevenue = await Payment.sum('amount', {
      where: {
        payment_date: {
          [Op.like]: `${lastMonth}%`
        },
        status: 'completed'
      }
    }) || 0;

    // Today's revenue
    const todayRevenue = await Payment.sum('amount', {
      where: {
        payment_date: today,
        status: 'completed'
      }
    }) || 0;

    // New members this month
    const newMembersThisMonth = await Member.count({
      where: {
        created_at: {
          [Op.gte]: moment().startOf('month').toDate()
        }
      }
    });

    // Revenue growth percentage
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(2)
      : 0;

    // Recent payments (last 5)
    const recentPayments = await Payment.findAll({
      include: [
        {
          model: Member,
          as: 'member',
          attributes: ['full_name', 'member_number']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    // Subscription type distribution
    const subscriptionDistribution = await SubscriptionType.findAll({
      attributes: [
        'name',
        'color',
        [sequelize.fn('COUNT', sequelize.col('subscriptions.id')), 'count']
      ],
      include: [
        {
          model: Subscription,
          as: 'subscriptions',
          where: { status: 'active' },
          attributes: [],
          required: false
        }
      ],
      group: ['SubscriptionType.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('subscriptions.id')), 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        overview: {
          total_members: totalMembers,
          active_subscriptions: activeSubscriptions,
          expiring_subscriptions: expiringSubscriptions,
          expired_subscriptions: expiredSubscriptions,
          new_members_this_month: newMembersThisMonth
        },
        revenue: {
          today: parseFloat(todayRevenue),
          this_month: parseFloat(thisMonthRevenue),
          last_month: parseFloat(lastMonthRevenue),
          growth_percentage: parseFloat(revenueGrowth)
        },
        recent_payments: recentPayments,
        subscription_distribution: subscriptionDistribution
      }
    });
  } catch (error) {
    console.error('Dashboard report error:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في جلب إحصائيات لوحة التحكم'
    });
  }
});

// @route   GET /api/reports/revenue
// @desc    Get revenue report
// @access  Private
router.get('/revenue', [
  query('period').optional().isIn(['daily', 'weekly', 'monthly', 'yearly']).withMessage('فترة التقرير غير صحيحة'),
  query('start_date').optional().isISO8601().withMessage('تاريخ البداية غير صحيح'),
  query('end_date').optional().isISO8601().withMessage('تاريخ النهاية غير صحيح')
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

    const period = req.query.period || 'monthly';
    const startDate = req.query.start_date || moment().subtract(6, 'months').format('YYYY-MM-DD');
    const endDate = req.query.end_date || moment().format('YYYY-MM-DD');

    let dateFormat, groupBy;
    switch (period) {
      case 'daily':
        dateFormat = '%Y-%m-%d';
        groupBy = sequelize.fn('DATE', sequelize.col('payment_date'));
        break;
      case 'weekly':
        dateFormat = '%Y-%u';
        groupBy = sequelize.fn('YEARWEEK', sequelize.col('payment_date'));
        break;
      case 'monthly':
        dateFormat = '%Y-%m';
        groupBy = sequelize.fn('DATE_FORMAT', sequelize.col('payment_date'), '%Y-%m');
        break;
      case 'yearly':
        dateFormat = '%Y';
        groupBy = sequelize.fn('YEAR', sequelize.col('payment_date'));
        break;
    }

    const revenueData = await Payment.findAll({
      attributes: [
        [groupBy, 'period'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_revenue'],
        [sequelize.fn('SUM', sequelize.col('refund_amount')), 'total_refunds'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'transaction_count']
      ],
      where: {
        payment_date: {
          [Op.between]: [startDate, endDate]
        },
        status: 'completed'
      },
      group: [groupBy],
      order: [[groupBy, 'ASC']],
      raw: true
    });

    // Revenue by payment method
    const revenueByMethod = await Payment.findAll({
      attributes: [
        'payment_method',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_revenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'transaction_count']
      ],
      where: {
        payment_date: {
          [Op.between]: [startDate, endDate]
        },
        status: 'completed'
      },
      group: ['payment_method'],
      order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']],
      raw: true
    });

    // Revenue by subscription type
    const revenueBySubscription = await Payment.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('Payment.amount')), 'total_revenue'],
        [sequelize.fn('COUNT', sequelize.col('Payment.id')), 'transaction_count']
      ],
      include: [
        {
          model: Subscription,
          as: 'subscription',
          attributes: [],
          include: [
            {
              model: SubscriptionType,
              as: 'subscription_type',
              attributes: ['name', 'color']
            }
          ]
        }
      ],
      where: {
        payment_date: {
          [Op.between]: [startDate, endDate]
        },
        status: 'completed',
        payment_type: 'subscription'
      },
      group: ['subscription.subscription_type.id'],
      order: [[sequelize.fn('SUM', sequelize.col('Payment.amount')), 'DESC']]
    });

    // Calculate totals
    const totals = {
      total_revenue: revenueData.reduce((sum, item) => sum + parseFloat(item.total_revenue), 0),
      total_refunds: revenueData.reduce((sum, item) => sum + parseFloat(item.total_refunds), 0),
      total_transactions: revenueData.reduce((sum, item) => sum + parseInt(item.transaction_count), 0)
    };

    res.json({
      status: 'success',
      data: {
        period,
        start_date: startDate,
        end_date: endDate,
        revenue_data: revenueData.map(item => ({
          period: item.period,
          total_revenue: parseFloat(item.total_revenue),
          total_refunds: parseFloat(item.total_refunds),
          net_revenue: parseFloat(item.total_revenue) - parseFloat(item.total_refunds),
          transaction_count: parseInt(item.transaction_count)
        })),
        revenue_by_method: revenueByMethod.map(item => ({
          payment_method: item.payment_method,
          total_revenue: parseFloat(item.total_revenue),
          transaction_count: parseInt(item.transaction_count)
        })),
        revenue_by_subscription: revenueBySubscription,
        totals: {
          ...totals,
          net_revenue: totals.total_revenue - totals.total_refunds
        }
      }
    });
  } catch (error) {
    console.error('Revenue report error:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في جلب تقرير الإيرادات'
    });
  }
});

// @route   GET /api/reports/members
// @desc    Get members report
// @access  Private
router.get('/members', [
  query('start_date').optional().isISO8601().withMessage('تاريخ البداية غير صحيح'),
  query('end_date').optional().isISO8601().withMessage('تاريخ النهاية غير صحيح')
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

    const startDate = req.query.start_date || moment().subtract(1, 'year').format('YYYY-MM-DD');
    const endDate = req.query.end_date || moment().format('YYYY-MM-DD');

    // Members by gender
    const membersByGender = await Member.findAll({
      attributes: [
        'gender',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        is_active: true,
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      },
      group: ['gender'],
      raw: true
    });

    // Members by age group
    const membersByAge = await Member.findAll({
      attributes: [
        [sequelize.literal(`
          CASE 
            WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) < 18 THEN 'تحت 18'
            WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 18 AND 25 THEN '18-25'
            WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 26 AND 35 THEN '26-35'
            WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 36 AND 45 THEN '36-45'
            WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) > 45 THEN 'فوق 45'
            ELSE 'غير محدد'
          END
        `), 'age_group'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        is_active: true,
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      },
      group: [sequelize.literal('age_group')],
      raw: true
    });

    // New members by month
    const newMembersByMonth = await Member.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      },
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'ASC']],
      raw: true
    });

    // Member retention (active subscriptions)
    const memberRetention = await Member.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Member.id')), 'total_members'],
        [sequelize.fn('COUNT', sequelize.col('subscriptions.id')), 'active_members']
      ],
      include: [
        {
          model: Subscription,
          as: 'subscriptions',
          where: { status: 'active' },
          attributes: [],
          required: false
        }
      ],
      where: {
        is_active: true,
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      },
      raw: true
    });

    const retentionRate = memberRetention[0] ? 
      (parseInt(memberRetention[0].active_members) / parseInt(memberRetention[0].total_members) * 100).toFixed(2) : 0;

    res.json({
      status: 'success',
      data: {
        start_date: startDate,
        end_date: endDate,
        members_by_gender: membersByGender.map(item => ({
          gender: item.gender,
          count: parseInt(item.count)
        })),
        members_by_age: membersByAge.map(item => ({
          age_group: item.age_group,
          count: parseInt(item.count)
        })),
        new_members_by_month: newMembersByMonth.map(item => ({
          month: item.month,
          count: parseInt(item.count)
        })),
        retention: {
          total_members: parseInt(memberRetention[0]?.total_members || 0),
          active_members: parseInt(memberRetention[0]?.active_members || 0),
          retention_rate: parseFloat(retentionRate)
        }
      }
    });
  } catch (error) {
    console.error('Members report error:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في جلب تقرير الأعضاء'
    });
  }
});

module.exports = router;
