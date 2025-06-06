import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Paper,
  Button,
  IconButton,
  Badge,
  Alert,
  Tooltip,
  Divider,
  CardActions,
} from '@mui/material';
import {
  People,
  CardMembership,
  Warning,
  TrendingUp,
  Payment,
  PersonAdd,
  Refresh,
  Notifications,
  WhatsApp,
  Assessment,
  Schedule,
  TrendingDown,
  MonetizationOn,
  FitnessCenter,
  AccessTime,
  Add,
  Visibility,
  Close,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LineChart, Line, AreaChart, Area } from 'recharts';

import { RootState, AppDispatch } from '../../store/store';
import { getDashboard } from '../../store/slices/reportsSlice';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { dashboardData, isLoading } = useSelector((state: RootState) => state.reports);
  const { user } = useSelector((state: RootState) => state.auth);

  const [refreshing, setRefreshing] = useState(false);
  const [notifications] = useState([
    { id: 1, type: 'warning', message: '5 اشتراكات ستنتهي خلال 3 أيام', time: '10 دقائق' },
    { id: 2, type: 'info', message: 'تم إضافة عضو جديد: أحمد محمد', time: '30 دقيقة' },
    { id: 3, type: 'success', message: 'تم تحصيل 1500 ريال اليوم', time: '1 ساعة' },
  ]);

  useEffect(() => {
    dispatch(getDashboard());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(getDashboard());
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  const overview = dashboardData?.overview || {};
  const revenue = dashboardData?.revenue || {};
  const recentPayments = dashboardData?.recent_payments || [];
  const subscriptionDistribution = dashboardData?.subscription_distribution || [];

  // Prepare chart data
  const pieChartData = subscriptionDistribution.map((item: any) => ({
    name: item.name,
    value: parseInt(item.count),
    color: item.color,
  }));

  const revenueData = [
    { name: 'الشهر الماضي', amount: revenue.last_month || 0 },
    { name: 'هذا الشهر', amount: revenue.this_month || 0 },
  ];

  const StatCard = ({ title, value, icon, color, subtitle, trend, onClick }: any) => (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'visible',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color, mb: 1 }}>
              {value?.toLocaleString('ar-SA') || 0}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {trend > 0 ? (
                  <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                ) : (
                  <TrendingDown sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: trend > 0 ? 'success.main' : 'error.main',
                    fontWeight: 'bold'
                  }}
                >
                  {trend > 0 ? '+' : ''}{trend}%
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: color,
              width: 56,
              height: 56,
              position: 'absolute',
              top: -8,
              right: 16,
              boxShadow: 3,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header with actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          لوحة التحكم
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            تحديث
          </Button>
          <Badge badgeContent={notifications.length} color="error">
            <IconButton>
              <Notifications />
            </IconButton>
          </Badge>
        </Box>
      </Box>

      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => navigate('/members/new')}
            sx={{ py: 1.5 }}
          >
            إضافة عضو جديد
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Payment />}
            onClick={() => navigate('/payments')}
            sx={{ py: 1.5 }}
          >
            تسجيل دفعة
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<WhatsApp />}
            onClick={() => navigate('/messages')}
            sx={{ py: 1.5, bgcolor: '#25D366', color: 'white', '&:hover': { bgcolor: '#128C7E' } }}
          >
            إرسال رسالة
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Assessment />}
            onClick={() => navigate('/reports')}
            sx={{ py: 1.5 }}
          >
            عرض التقارير
          </Button>
        </Grid>
      </Grid>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="إجمالي الأعضاء"
            value={overview.total_members}
            icon={<People />}
            color="#1976d2"
            subtitle="عضو نشط"
            trend={12}
            onClick={() => navigate('/members')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="الاشتراكات النشطة"
            value={overview.active_subscriptions}
            icon={<CardMembership />}
            color="#2e7d32"
            subtitle="اشتراك فعال"
            trend={8}
            onClick={() => navigate('/subscriptions')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="اشتراكات منتهية قريباً"
            value={overview.expiring_subscriptions}
            icon={<Warning />}
            color="#ed6c02"
            subtitle="خلال 7 أيام"
            trend={-5}
            onClick={() => navigate('/subscriptions?filter=expiring')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="إيرادات اليوم"
            value={revenue.today}
            icon={<MonetizationOn />}
            color="#9c27b0"
            subtitle="ريال سعودي"
            trend={15}
            onClick={() => navigate('/payments')}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                مقارنة الإيرادات
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} ريال`, 'المبلغ']} />
                    <Bar dataKey="amount" fill="#1976d2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    نمو الإيرادات
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: revenue.growth_percentage >= 0 ? 'success.main' : 'error.main',
                      fontWeight: 'bold',
                    }}
                  >
                    {revenue.growth_percentage >= 0 ? '+' : ''}{revenue.growth_percentage}%
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" color="textSecondary">
                    إجمالي هذا الشهر
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {revenue.this_month?.toLocaleString('ar-SA')} ريال
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Subscription Distribution */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                توزيع الاشتراكات
              </Typography>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ mt: 2 }}>
                {pieChartData.map((item: any, index: number) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: item.color,
                        borderRadius: '50%',
                        mr: 1,
                      }}
                    />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Payments */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                آخر المدفوعات
              </Typography>
              <List>
                {recentPayments.slice(0, 5).map((payment: any) => (
                  <ListItem key={payment.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Payment />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={payment.member?.full_name}
                      secondary={`${payment.amount} ريال - ${new Date(payment.payment_date).toLocaleDateString('ar-SA')}`}
                    />
                    <Chip
                      label={payment.payment_method === 'cash' ? 'نقدي' : 'بطاقة'}
                      size="small"
                      color={payment.payment_method === 'cash' ? 'success' : 'primary'}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                إحصائيات سريعة
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">أعضاء جدد هذا الشهر</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {overview.new_members_this_month}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">اشتراكات منتهية</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    {overview.expired_subscriptions}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">معدل النمو الشهري</Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      color: revenue.growth_percentage >= 0 ? 'success.main' : 'error.main',
                    }}
                  >
                    {revenue.growth_percentage >= 0 ? '+' : ''}{revenue.growth_percentage}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Notifications Panel */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              الإشعارات الحديثة
            </Typography>
            <Badge badgeContent={notifications.length} color="error">
              <Notifications />
            </Badge>
          </Box>
          <Grid container spacing={2}>
            {notifications.map((notification) => (
              <Grid item xs={12} md={4} key={notification.id}>
                <Alert
                  severity={notification.type as any}
                  action={
                    <IconButton size="small">
                      <Close />
                    </IconButton>
                  }
                >
                  <Typography variant="body2">
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    منذ {notification.time}
                  </Typography>
                </Alert>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
