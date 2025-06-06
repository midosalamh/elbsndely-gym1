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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Alert,
  Paper,
  IconButton,
  Tooltip,
  Divider,
  LinearProgress,
  Snackbar,
} from '@mui/material';
import {
  Send,
  WhatsApp,
  Schedule,
  Group,
  Person,
  Template,
  History,
  Refresh,
  Download,
  FilterList,
  Search,
  Close,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { arSA } from 'date-fns/locale';

import { RootState, AppDispatch } from '../../store/store';

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

const Messages: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Single message state
  const [singleMessage, setSingleMessage] = useState({
    recipient: '',
    message: '',
    template: '',
  });

  // Bulk message state
  const [bulkMessage, setBulkMessage] = useState({
    recipients: [] as string[],
    message: '',
    template: '',
    filter: 'all', // all, active, expired, expiring
  });

  // Scheduled message state
  const [scheduledMessage, setScheduledMessage] = useState({
    recipients: [] as string[],
    message: '',
    scheduledDate: new Date(),
    repeat: 'none', // none, daily, weekly, monthly
  });

  // Templates
  const [templates] = useState([
    { id: 1, name: 'رسالة ترحيب', content: 'مرحباً بك في البسنديلي جيم! نحن سعداء بانضمامك إلينا.' },
    { id: 2, name: 'تذكير انتهاء الاشتراك', content: 'تذكير: اشتراكك سينتهي خلال 3 أيام. يرجى التجديد.' },
    { id: 3, name: 'رسالة تحفيزية', content: 'استمر في التقدم! كل تمرين يقربك من هدفك.' },
    { id: 4, name: 'عرض خاص', content: 'عرض خاص! خصم 20% على تجديد الاشتراك هذا الأسبوع.' },
  ]);

  // Mock members data
  const [members] = useState([
    { id: 1, name: 'أحمد محمد', phone: '+966501234567', status: 'active', subscription_end: '2024-02-15' },
    { id: 2, name: 'سارة أحمد', phone: '+966507654321', status: 'active', subscription_end: '2024-01-20' },
    { id: 3, name: 'محمد علي', phone: '+966509876543', status: 'expired', subscription_end: '2024-01-10' },
    { id: 4, name: 'فاطمة خالد', phone: '+966502468135', status: 'expiring', subscription_end: '2024-01-18' },
  ]);

  // Message history
  const [messageHistory] = useState([
    {
      id: 1,
      recipient: 'أحمد محمد',
      phone: '+966501234567',
      message: 'مرحباً بك في البسنديلي جيم!',
      status: 'delivered',
      sent_at: '2024-01-15 10:30',
      type: 'single'
    },
    {
      id: 2,
      recipient: 'مجموعة (5 أعضاء)',
      phone: 'bulk',
      message: 'تذكير: اشتراككم سينتهي قريباً',
      status: 'sent',
      sent_at: '2024-01-14 09:00',
      type: 'bulk'
    },
  ]);

  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [templateDialog, setTemplateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSendSingleMessage = async () => {
    if (!singleMessage.recipient || !singleMessage.message) {
      setSnackbar({ open: true, message: 'يرجى ملء جميع الحقول المطلوبة', severity: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSnackbar({ open: true, message: 'تم إرسال الرسالة بنجاح', severity: 'success' });
      setSingleMessage({ recipient: '', message: '', template: '' });
    } catch (error) {
      setSnackbar({ open: true, message: 'فشل في إرسال الرسالة', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendBulkMessage = async () => {
    if (selectedMembers.length === 0 || !bulkMessage.message) {
      setSnackbar({ open: true, message: 'يرجى اختيار المستقبلين وكتابة الرسالة', severity: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      setSnackbar({ open: true, message: `تم إرسال الرسالة إلى ${selectedMembers.length} عضو`, severity: 'success' });
      setBulkMessage({ recipients: [], message: '', template: '', filter: 'all' });
      setSelectedMembers([]);
    } catch (error) {
      setSnackbar({ open: true, message: 'فشل في إرسال الرسائل', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleMessage = async () => {
    if (selectedMembers.length === 0 || !scheduledMessage.message) {
      setSnackbar({ open: true, message: 'يرجى اختيار المستقبلين وكتابة الرسالة', severity: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSnackbar({ open: true, message: 'تم جدولة الرسالة بنجاح', severity: 'success' });
      setScheduledMessage({
        recipients: [],
        message: '',
        scheduledDate: new Date(),
        repeat: 'none'
      });
      setSelectedMembers([]);
    } catch (error) {
      setSnackbar({ open: true, message: 'فشل في جدولة الرسالة', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const applyTemplate = (templateContent: string, messageType: 'single' | 'bulk' | 'scheduled') => {
    if (messageType === 'single') {
      setSingleMessage({ ...singleMessage, message: templateContent });
    } else if (messageType === 'bulk') {
      setBulkMessage({ ...bulkMessage, message: templateContent });
    } else {
      setScheduledMessage({ ...scheduledMessage, message: templateContent });
    }
    setTemplateDialog(false);
  };

  const getFilteredMembers = () => {
    switch (bulkMessage.filter) {
      case 'active':
        return members.filter(m => m.status === 'active');
      case 'expired':
        return members.filter(m => m.status === 'expired');
      case 'expiring':
        return members.filter(m => m.status === 'expiring');
      default:
        return members;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'sent': return 'info';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'تم التسليم';
      case 'sent': return 'تم الإرسال';
      case 'failed': return 'فشل';
      case 'pending': return 'في الانتظار';
      default: return status;
    }
  };

  const messageHistoryColumns: GridColDef[] = [
    {
      field: 'recipient',
      headerName: 'المستقبل',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            {params.value.charAt(0)}
          </Avatar>
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'message',
      headerName: 'الرسالة',
      width: 300,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'الحالة',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={getStatusText(params.value)}
          color={getStatusColor(params.value) as any}
          size="small"
        />
      ),
    },
    {
      field: 'type',
      headerName: 'النوع',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value === 'single' ? 'فردية' : 'جماعية'}
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      field: 'sent_at',
      headerName: 'تاريخ الإرسال',
      width: 150,
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={arSA}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          إدارة الرسائل
        </Typography>

        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
              <Tab icon={<Person />} label="رسالة فردية" />
              <Tab icon={<Group />} label="رسالة جماعية" />
              <Tab icon={<Schedule />} label="جدولة الرسائل" />
              <Tab icon={<Template />} label="القوالب" />
              <Tab icon={<History />} label="سجل الرسائل" />
            </Tabs>
          </Box>

          <CardContent>
            {/* Single Message Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    إرسال رسالة فردية
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>اختر العضو</InputLabel>
                      <Select
                        value={singleMessage.recipient}
                        onChange={(e) => setSingleMessage({ ...singleMessage, recipient: e.target.value })}
                      >
                        {members.map((member) => (
                          <MenuItem key={member.id} value={member.phone}>
                            {member.name} - {member.phone}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      label="نص الرسالة"
                      value={singleMessage.message}
                      onChange={(e) => setSingleMessage({ ...singleMessage, message: e.target.value })}
                      placeholder="اكتب رسالتك هنا..."
                    />

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<Template />}
                        onClick={() => setTemplateDialog(true)}
                      >
                        استخدام قالب
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<WhatsApp />}
                        onClick={handleSendSingleMessage}
                        disabled={isLoading}
                        sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#128C7E' } }}
                      >
                        إرسال عبر الواتساب
                      </Button>
                    </Box>

                    {isLoading && <LinearProgress />}
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography variant="h6" gutterBottom>
                      معاينة الرسالة
                    </Typography>
                    <Box
                      sx={{
                        bgcolor: '#25D366',
                        color: 'white',
                        p: 2,
                        borderRadius: 2,
                        minHeight: 200,
                        position: 'relative',
                      }}
                    >
                      <Typography variant="body2">
                        {singleMessage.message || 'اكتب رسالتك لرؤية المعاينة...'}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ position: 'absolute', bottom: 8, right: 8, opacity: 0.8 }}
                      >
                        البسنديلي جيم
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Bulk Message Tab */}
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    إرسال رسالة جماعية
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>تصفية الأعضاء</InputLabel>
                      <Select
                        value={bulkMessage.filter}
                        onChange={(e) => setBulkMessage({ ...bulkMessage, filter: e.target.value })}
                      >
                        <MenuItem value="all">جميع الأعضاء</MenuItem>
                        <MenuItem value="active">الأعضاء النشطين</MenuItem>
                        <MenuItem value="expired">الأعضاء المنتهية اشتراكاتهم</MenuItem>
                        <MenuItem value="expiring">الأعضاء المنتهية اشتراكاتهم قريباً</MenuItem>
                      </Select>
                    </FormControl>

                    <Paper sx={{ maxHeight: 200, overflow: 'auto', p: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        اختر الأعضاء ({selectedMembers.length} محدد)
                      </Typography>
                      {getFilteredMembers().map((member) => (
                        <FormControlLabel
                          key={member.id}
                          control={
                            <Checkbox
                              checked={selectedMembers.includes(member.phone)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedMembers([...selectedMembers, member.phone]);
                                } else {
                                  setSelectedMembers(selectedMembers.filter(p => p !== member.phone));
                                }
                              }}
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2">{member.name}</Typography>
                              <Chip
                                label={member.status === 'active' ? 'نشط' : member.status === 'expired' ? 'منتهي' : 'ينتهي قريباً'}
                                size="small"
                                color={member.status === 'active' ? 'success' : member.status === 'expired' ? 'error' : 'warning'}
                              />
                            </Box>
                          }
                        />
                      ))}
                    </Paper>

                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="نص الرسالة"
                      value={bulkMessage.message}
                      onChange={(e) => setBulkMessage({ ...bulkMessage, message: e.target.value })}
                      placeholder="اكتب رسالتك هنا..."
                    />

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<Template />}
                        onClick={() => setTemplateDialog(true)}
                      >
                        استخدام قالب
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Group />}
                        onClick={handleSendBulkMessage}
                        disabled={isLoading || selectedMembers.length === 0}
                        sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#128C7E' } }}
                      >
                        إرسال لـ {selectedMembers.length} عضو
                      </Button>
                    </Box>

                    {isLoading && <LinearProgress />}
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    الأعضاء المحددين
                  </Typography>
                  <Paper sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <List dense>
                      {selectedMembers.map((phone) => {
                        const member = members.find(m => m.phone === phone);
                        return member ? (
                          <ListItem key={phone}>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                {member.name.charAt(0)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={member.name}
                              secondary={member.phone}
                            />
                            <IconButton
                              edge="end"
                              onClick={() => setSelectedMembers(selectedMembers.filter(p => p !== phone))}
                            >
                              <Close />
                            </IconButton>
                          </ListItem>
                        ) : null;
                      })}
                      {selectedMembers.length === 0 && (
                        <ListItem>
                          <ListItemText
                            primary="لم يتم اختيار أي عضو"
                            secondary="اختر الأعضاء من القائمة على اليسار"
                          />
                        </ListItem>
                      )}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Scheduled Messages Tab */}
            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    جدولة رسالة
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Paper sx={{ maxHeight: 150, overflow: 'auto', p: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        اختر الأعضاء ({selectedMembers.length} محدد)
                      </Typography>
                      {members.map((member) => (
                        <FormControlLabel
                          key={member.id}
                          control={
                            <Checkbox
                              checked={selectedMembers.includes(member.phone)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedMembers([...selectedMembers, member.phone]);
                                } else {
                                  setSelectedMembers(selectedMembers.filter(p => p !== member.phone));
                                }
                              }}
                            />
                          }
                          label={member.name}
                        />
                      ))}
                    </Paper>

                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="نص الرسالة"
                      value={scheduledMessage.message}
                      onChange={(e) => setScheduledMessage({ ...scheduledMessage, message: e.target.value })}
                      placeholder="اكتب رسالتك هنا..."
                    />

                    <DateTimePicker
                      label="تاريخ ووقت الإرسال"
                      value={scheduledMessage.scheduledDate}
                      onChange={(newValue) => setScheduledMessage({ ...scheduledMessage, scheduledDate: newValue || new Date() })}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />

                    <FormControl fullWidth>
                      <InputLabel>التكرار</InputLabel>
                      <Select
                        value={scheduledMessage.repeat}
                        onChange={(e) => setScheduledMessage({ ...scheduledMessage, repeat: e.target.value })}
                      >
                        <MenuItem value="none">بدون تكرار</MenuItem>
                        <MenuItem value="daily">يومي</MenuItem>
                        <MenuItem value="weekly">أسبوعي</MenuItem>
                        <MenuItem value="monthly">شهري</MenuItem>
                      </Select>
                    </FormControl>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<Template />}
                        onClick={() => setTemplateDialog(true)}
                      >
                        استخدام قالب
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Schedule />}
                        onClick={handleScheduleMessage}
                        disabled={isLoading || selectedMembers.length === 0}
                      >
                        جدولة الرسالة
                      </Button>
                    </Box>

                    {isLoading && <LinearProgress />}
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    الرسائل المجدولة
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    لا توجد رسائل مجدولة حالياً
                  </Alert>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      ستظهر هنا الرسائل المجدولة للإرسال في المستقبل
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Templates Tab */}
            <TabPanel value={tabValue} index={3}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    قوالب الرسائل
                  </Typography>

                  <List>
                    {templates.map((template) => (
                      <ListItem key={template.id} divider>
                        <ListItemText
                          primary={template.name}
                          secondary={template.content}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => applyTemplate(template.content, 'single')}
                          >
                            استخدام
                          </Button>
                          <IconButton size="small">
                            <Edit />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <Close />
                          </IconButton>
                        </Box>
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    variant="contained"
                    startIcon={<Template />}
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    إضافة قالب جديد
                  </Button>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    إنشاء قالب جديد
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="اسم القالب"
                      placeholder="مثال: رسالة ترحيب"
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      label="محتوى القالب"
                      placeholder="اكتب محتوى القالب هنا..."
                    />
                    <Button variant="contained" startIcon={<Save />}>
                      حفظ القالب
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Message History Tab */}
            <TabPanel value={tabValue} index={4}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  سجل الرسائل
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button startIcon={<Refresh />} variant="outlined">
                    تحديث
                  </Button>
                  <Button startIcon={<Download />} variant="outlined">
                    تصدير
                  </Button>
                  <Button startIcon={<FilterList />} variant="outlined">
                    تصفية
                  </Button>
                </Box>
              </Box>

              <Card>
                <CardContent sx={{ p: 0 }}>
                  <DataGrid
                    rows={messageHistory}
                    columns={messageHistoryColumns}
                    autoHeight
                    disableRowSelectionOnClick
                    sx={{
                      border: 'none',
                      '& .MuiDataGrid-cell': {
                        borderBottom: '1px solid #f0f0f0',
                      },
                      '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#f5f5f5',
                        borderBottom: '2px solid #e0e0e0',
                      },
                      '& .MuiDataGrid-row:hover': {
                        backgroundColor: '#fafafa',
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </TabPanel>
          </CardContent>
        </Card>

        {/* Template Selection Dialog */}
        <Dialog open={templateDialog} onClose={() => setTemplateDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>اختر قالب الرسالة</DialogTitle>
          <DialogContent>
            <List>
              {templates.map((template) => (
                <ListItem
                  key={template.id}
                  button
                  onClick={() => {
                    if (tabValue === 0) applyTemplate(template.content, 'single');
                    else if (tabValue === 1) applyTemplate(template.content, 'bulk');
                    else if (tabValue === 2) applyTemplate(template.content, 'scheduled');
                  }}
                >
                  <ListItemText
                    primary={template.name}
                    secondary={template.content}
                  />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTemplateDialog(false)}>إلغاء</Button>
          </DialogActions>
        </Dialog>

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
    </LocalizationProvider>
  );
};

export default Messages;
