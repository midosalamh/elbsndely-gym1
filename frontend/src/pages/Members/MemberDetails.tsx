import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Phone,
  Email,
  CalendarToday,
  Person,
  CardMembership,
  Payment,
} from '@mui/icons-material';

import { RootState, AppDispatch } from '../../store/store';
import { getMember } from '../../store/slices/membersSlice';

const MemberDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentMember, isLoading } = useSelector((state: RootState) => state.members);

  useEffect(() => {
    if (id) {
      dispatch(getMember(id));
    }
  }, [dispatch, id]);

  if (isLoading || !currentMember) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>جاري تحميل بيانات العضو...</Typography>
      </Box>
    );
  }

  const member = currentMember;

  const getStatusChip = (isActive: boolean) => (
    <Chip
      label={isActive ? 'نشط' : 'غير نشط'}
      color={isActive ? 'success' : 'default'}
      size="small"
    />
  );

  const getGenderText = (gender: string) => (
    gender === 'male' ? 'ذكر' : 'أنثى'
  );

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'غير محدد';
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    return `${age} سنة`;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/members')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', flex: 1 }}>
          تفاصيل العضو
        </Typography>
        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={() => navigate(`/members/${id}/edit`)}
        >
          تعديل البيانات
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: 48,
                }}
                src={member.profile_picture}
              >
                {member.full_name?.charAt(0)}
              </Avatar>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                {member.full_name}
              </Typography>
              <Typography variant="body1" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                {member.member_number}
              </Typography>
              {getStatusChip(member.is_active)}
              
              <Divider sx={{ my: 2 }} />
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Phone color="action" />
                  </ListItemIcon>
                  <ListItemText primary={member.phone} />
                </ListItem>
                {member.email && (
                  <ListItem>
                    <ListItemIcon>
                      <Email color="action" />
                    </ListItemIcon>
                    <ListItemText primary={member.email} />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemIcon>
                    <Person color="action" />
                  </ListItemIcon>
                  <ListItemText primary={getGenderText(member.gender)} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday color="action" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="العمر"
                    secondary={calculateAge(member.date_of_birth)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday color="action" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="تاريخ الانضمام"
                    secondary={new Date(member.join_date).toLocaleDateString('ar-SA')}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Detailed Information */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Contact Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    معلومات الاتصال
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">
                        رقم الهاتف
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {member.phone}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">
                        رقم الواتساب
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {member.whatsapp_number || member.phone}
                      </Typography>
                    </Grid>
                    {member.email && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">
                          البريد الإلكتروني
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {member.email}
                        </Typography>
                      </Grid>
                    )}
                    {member.address && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">
                          العنوان
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {member.address}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Emergency Contact */}
            {(member.emergency_contact_name || member.emergency_contact_phone) && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      جهة الاتصال في حالات الطوارئ
                    </Typography>
                    <Grid container spacing={2}>
                      {member.emergency_contact_name && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="textSecondary">
                            الاسم
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {member.emergency_contact_name}
                          </Typography>
                        </Grid>
                      )}
                      {member.emergency_contact_phone && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="textSecondary">
                            رقم الهاتف
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {member.emergency_contact_phone}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Medical Information */}
            {member.medical_conditions && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      المعلومات الطبية
                    </Typography>
                    <Typography variant="body1">
                      {member.medical_conditions}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Notes */}
            {member.notes && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      ملاحظات
                    </Typography>
                    <Typography variant="body1">
                      {member.notes}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Subscriptions */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    الاشتراكات
                  </Typography>
                  {member.subscriptions && member.subscriptions.length > 0 ? (
                    <List>
                      {member.subscriptions.map((subscription: any) => (
                        <ListItem key={subscription.id} divider>
                          <ListItemIcon>
                            <CardMembership color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={subscription.subscription_type?.name}
                            secondary={`من ${new Date(subscription.start_date).toLocaleDateString('ar-SA')} إلى ${new Date(subscription.end_date).toLocaleDateString('ar-SA')}`}
                          />
                          <Chip
                            label={subscription.status === 'active' ? 'نشط' : subscription.status === 'expired' ? 'منتهي' : subscription.status}
                            color={subscription.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      لا توجد اشتراكات
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Payments */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    آخر المدفوعات
                  </Typography>
                  {member.payments && member.payments.length > 0 ? (
                    <List>
                      {member.payments.slice(0, 5).map((payment: any) => (
                        <ListItem key={payment.id} divider>
                          <ListItemIcon>
                            <Payment color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={`${payment.amount} ريال`}
                            secondary={`${payment.description} - ${new Date(payment.payment_date).toLocaleDateString('ar-SA')}`}
                          />
                          <Chip
                            label={payment.payment_method === 'cash' ? 'نقدي' : 'بطاقة'}
                            size="small"
                            color={payment.payment_method === 'cash' ? 'success' : 'primary'}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      لا توجد مدفوعات
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MemberDetails;
