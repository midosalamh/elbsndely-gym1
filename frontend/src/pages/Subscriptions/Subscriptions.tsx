import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const Subscriptions: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        إدارة الاشتراكات
      </Typography>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            صفحة الاشتراكات قيد التطوير
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ستتضمن هذه الصفحة:
          </Typography>
          <ul>
            <li>عرض جميع الاشتراكات</li>
            <li>إنشاء اشتراكات جديدة</li>
            <li>تجديد الاشتراكات</li>
            <li>تجميد وإلغاء تجميد الاشتراكات</li>
            <li>إدارة أنواع الاشتراكات</li>
          </ul>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Subscriptions;
