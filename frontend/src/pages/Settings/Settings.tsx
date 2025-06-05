import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const Settings: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        الإعدادات
      </Typography>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            صفحة الإعدادات قيد التطوير
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ستتضمن هذه الصفحة:
          </Typography>
          <ul>
            <li>إعدادات الحساب الشخصي</li>
            <li>إعدادات النظام</li>
            <li>إدارة المستخدمين</li>
            <li>إعدادات الرسائل</li>
            <li>النسخ الاحتياطي</li>
          </ul>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;
