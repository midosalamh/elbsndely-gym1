import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Paper,
} from '@mui/material';
import {
  Person,
  Settings as SettingsIcon,
  People,
  Message,
  Backup,
  Security,
  Notifications,
  Edit,
  Delete,
  Add,
  Save,
  Cancel,
  PhotoCamera,
} from '@mui/icons-material';

import { RootState, AppDispatch } from '../../store/store';
import { updateProfile, changePassword } from '../../store/slices/authSlice';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Profile settings state
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // System settings state
  const [systemSettings, setSystemSettings] = useState({
    auto_backup: true,
    email_notifications: true,
    whatsapp_notifications: true,
    subscription_reminders: true,
    payment_reminders: true,
    gym_name: 'البسنديلي جيم',
    gym_phone: '+966501234567',
    gym_email: 'info@elbsndely-gym.com',
    gym_address: 'الرياض، المملكة العربية السعودية',
  });

  // Users management state
  const [users, setUsers] = useState([
    { id: 1, name: 'أحمد محمد', role: 'admin', email: 'admin@gym.com', active: true },
    { id: 2, name: 'سارة أحمد', role: 'manager', email: 'manager@gym.com', active: true },
    { id: 3, name: 'محمد علي', role: 'receptionist', email: 'receptionist@gym.com', active: false },
  ]);

  const [userDialog, setUserDialog] = useState({ open: false, user: null, mode: 'add' });

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProfileUpdate = async () => {
    try {
      await dispatch(updateProfile(profileData)).unwrap();
      setSnackbar({ open: true, message: 'تم تحديث الملف الشخصي بنجاح', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'فشل في تحديث الملف الشخصي', severity: 'error' });
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setSnackbar({ open: true, message: 'كلمات المرور غير متطابقة', severity: 'error' });
      return;
    }

    try {
      await dispatch(changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      })).unwrap();

      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      setSnackbar({ open: true, message: 'تم تغيير كلمة المرور بنجاح', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'فشل في تغيير كلمة المرور', severity: 'error' });
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      admin: 'مدير النظام',
      manager: 'مدير الصالة',
      receptionist: 'موظف استقبال',
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'error',
      manager: 'warning',
      receptionist: 'info',
    };
    return colors[role as keyof typeof colors] || 'default';
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        الإعدادات
      </Typography>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab icon={<Person />} label="الملف الشخصي" />
            <Tab icon={<SettingsIcon />} label="إعدادات النظام" />
            <Tab icon={<People />} label="إدارة المستخدمين" />
            <Tab icon={<Message />} label="إعدادات الرسائل" />
            <Tab icon={<Backup />} label="النسخ الاحتياطي" />
            <Tab icon={<Security />} label="الأمان" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Profile Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Avatar
                    sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}
                    src={user?.avatar}
                  >
                    {user?.full_name?.charAt(0)}
                  </Avatar>
                  <IconButton color="primary" component="label">
                    <PhotoCamera />
                    <input hidden accept="image/*" type="file" />
                  </IconButton>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    اضغط لتغيير الصورة الشخصية
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="الاسم الكامل"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="البريد الإلكتروني"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="رقم الهاتف"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleProfileUpdate}
                      disabled={isLoading}
                    >
                      حفظ التغييرات
                    </Button>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  تغيير كلمة المرور
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="كلمة المرور الحالية"
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="كلمة المرور الجديدة"
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="تأكيد كلمة المرور الجديدة"
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      startIcon={<Security />}
                      onClick={handlePasswordChange}
                      disabled={isLoading}
                    >
                      تغيير كلمة المرور
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </TabPanel>

          {/* System Settings Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  معلومات الصالة
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="اسم الصالة"
                      value={systemSettings.gym_name}
                      onChange={(e) => setSystemSettings({ ...systemSettings, gym_name: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="رقم هاتف الصالة"
                      value={systemSettings.gym_phone}
                      onChange={(e) => setSystemSettings({ ...systemSettings, gym_phone: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="بريد الصالة الإلكتروني"
                      value={systemSettings.gym_email}
                      onChange={(e) => setSystemSettings({ ...systemSettings, gym_email: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="عنوان الصالة"
                      multiline
                      rows={3}
                      value={systemSettings.gym_address}
                      onChange={(e) => setSystemSettings({ ...systemSettings, gym_address: e.target.value })}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  إعدادات النظام
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={systemSettings.auto_backup}
                        onChange={(e) => setSystemSettings({ ...systemSettings, auto_backup: e.target.checked })}
                      />
                    }
                    label="النسخ الاحتياطي التلقائي"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={systemSettings.email_notifications}
                        onChange={(e) => setSystemSettings({ ...systemSettings, email_notifications: e.target.checked })}
                      />
                    }
                    label="إشعارات البريد الإلكتروني"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={systemSettings.whatsapp_notifications}
                        onChange={(e) => setSystemSettings({ ...systemSettings, whatsapp_notifications: e.target.checked })}
                      />
                    }
                    label="إشعارات الواتساب"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={systemSettings.subscription_reminders}
                        onChange={(e) => setSystemSettings({ ...systemSettings, subscription_reminders: e.target.checked })}
                      />
                    }
                    label="تذكيرات انتهاء الاشتراكات"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={systemSettings.payment_reminders}
                        onChange={(e) => setSystemSettings({ ...systemSettings, payment_reminders: e.target.checked })}
                      />
                    }
                    label="تذكيرات المدفوعات"
                  />
                </Box>

                <Button
                  variant="contained"
                  startIcon={<Save />}
                  sx={{ mt: 3 }}
                  fullWidth
                >
                  حفظ إعدادات النظام
                </Button>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Users Management Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                إدارة المستخدمين
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setUserDialog({ open: true, user: null, mode: 'add' })}
              >
                إضافة مستخدم جديد
              </Button>
            </Box>

            <List>
              {users.map((user) => (
                <ListItem key={user.id} divider>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    {user.name.charAt(0)}
                  </Avatar>
                  <ListItemText
                    primary={user.name}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Chip
                          label={getRoleDisplayName(user.role)}
                          size="small"
                          color={getRoleColor(user.role) as any}
                          variant="outlined"
                        />
                        <Chip
                          label={user.active ? 'نشط' : 'غير نشط'}
                          size="small"
                          color={user.active ? 'success' : 'default'}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => setUserDialog({ open: true, user, mode: 'edit' })}
                      sx={{ mr: 1 }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton edge="end" color="error">
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </TabPanel>

          {/* Messages Settings Tab */}
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  إعدادات الواتساب
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  لتفعيل خدمة الواتساب، يرجى إدخال بيانات Twilio الخاصة بك
                </Alert>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Twilio Account SID"
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Twilio Auth Token"
                      type="password"
                      placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="رقم الواتساب"
                      placeholder="whatsapp:+14155238886"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="contained" startIcon={<Save />}>
                      حفظ إعدادات الواتساب
                    </Button>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  قوالب الرسائل
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="رسالة الترحيب"
                    multiline
                    rows={3}
                    defaultValue="مرحباً بك في البسنديلي جيم! نحن سعداء بانضمامك إلينا."
                  />
                  <TextField
                    fullWidth
                    label="تذكير انتهاء الاشتراك"
                    multiline
                    rows={3}
                    defaultValue="تذكير: اشتراكك في الصالة سينتهي خلال 3 أيام. يرجى التجديد."
                  />
                  <TextField
                    fullWidth
                    label="رسالة تحفيزية"
                    multiline
                    rows={3}
                    defaultValue="استمر في التقدم! كل تمرين يقربك من هدفك."
                  />
                  <Button variant="outlined" startIcon={<Save />}>
                    حفظ القوالب
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Backup Tab */}
          <TabPanel value={tabValue} index={4}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  النسخ الاحتياطي التلقائي
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="تفعيل النسخ الاحتياطي التلقائي"
                  />
                  <TextField
                    select
                    fullWidth
                    label="تكرار النسخ الاحتياطي"
                    defaultValue="daily"
                    SelectProps={{ native: true }}
                  >
                    <option value="daily">يومي</option>
                    <option value="weekly">أسبوعي</option>
                    <option value="monthly">شهري</option>
                  </TextField>
                  <TextField
                    type="time"
                    fullWidth
                    label="وقت النسخ الاحتياطي"
                    defaultValue="02:00"
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  النسخ الاحتياطي اليدوي
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Alert severity="warning">
                    آخر نسخة احتياطية: 2024-01-15 02:00 ص
                  </Alert>
                  <Button
                    variant="contained"
                    startIcon={<Backup />}
                    size="large"
                    fullWidth
                  >
                    إنشاء نسخة احتياطية الآن
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Backup />}
                    size="large"
                    fullWidth
                  >
                    استعادة من نسخة احتياطية
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Security Tab */}
          <TabPanel value={tabValue} index={5}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  إعدادات الأمان
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="تسجيل الدخول بخطوتين"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="تسجيل محاولات تسجيل الدخول"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="إجبار تغيير كلمة المرور كل 90 يوم"
                  />
                  <TextField
                    type="number"
                    fullWidth
                    label="مدة انتهاء الجلسة (بالدقائق)"
                    defaultValue="60"
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  سجل النشاطات
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  آخر 5 عمليات تسجيل دخول
                </Alert>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="تسجيل دخول ناجح"
                      secondary="2024-01-15 10:30 ص - IP: 192.168.1.100"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="تسجيل دخول ناجح"
                      secondary="2024-01-14 09:15 ص - IP: 192.168.1.100"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="محاولة تسجيل دخول فاشلة"
                      secondary="2024-01-13 11:45 م - IP: 192.168.1.200"
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
