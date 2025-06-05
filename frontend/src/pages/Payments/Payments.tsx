import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const Payments: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        إدارة المدفوعات
      </Typography>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            صفحة المدفوعات قيد التطوير
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ستتضمن هذه الصفحة:
          </Typography>
          <ul>
            <li>عرض جميع المدفوعات</li>
            <li>تسجيل مدفوعات جديدة</li>
            <li>استرداد المدفوعات</li>
            <li>طباعة الإيصالات</li>
            <li>تقارير المدفوعات</li>
          </ul>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Payments;
