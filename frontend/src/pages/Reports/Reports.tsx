import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const Reports: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        التقارير والإحصائيات
      </Typography>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            صفحة التقارير قيد التطوير
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ستتضمن هذه الصفحة:
          </Typography>
          <ul>
            <li>تقارير الإيرادات</li>
            <li>تقارير الأعضاء</li>
            <li>تقارير الاشتراكات</li>
            <li>إحصائيات مفصلة</li>
            <li>رسوم بيانية تفاعلية</li>
          </ul>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports;
