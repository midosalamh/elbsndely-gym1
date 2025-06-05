import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const Messages: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        إدارة الرسائل
      </Typography>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            صفحة الرسائل قيد التطوير
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ستتضمن هذه الصفحة:
          </Typography>
          <ul>
            <li>إرسال رسائل واتساب فردية</li>
            <li>إرسال رسائل جماعية</li>
            <li>قوالب الرسائل</li>
            <li>جدولة الرسائل</li>
            <li>تتبع حالة الرسائل</li>
          </ul>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Messages;
