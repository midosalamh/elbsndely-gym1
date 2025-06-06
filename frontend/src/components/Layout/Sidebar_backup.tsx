import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Dashboard,
  People,
  CardMembership,
  Payment,
  Assessment,
  Message,
  Settings,
  FitnessCenter,
  Home,
  ArrowBack,
  WhatsApp,
  Notifications,
} from '@mui/icons-material';

import { RootState } from '../../store/store';

interface SidebarProps {
  onItemClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const menuItems = [
    {
      text: 'لوحة التحكم',
      icon: <Dashboard />,
      path: '/dashboard',
      roles: ['admin', 'manager', 'receptionist'],
    },
    {
      text: 'الأعضاء',
      icon: <People />,
      path: '/members',
      roles: ['admin', 'manager', 'receptionist'],
    },
    {
      text: 'الاشتراكات',
      icon: <CardMembership />,
      path: '/subscriptions',
      roles: ['admin', 'manager', 'receptionist'],
    },
    {
      text: 'المدفوعات',
      icon: <Payment />,
      path: '/payments',
      roles: ['admin', 'manager', 'receptionist'],
    },
    {
      text: 'التقارير',
      icon: <Assessment />,
      path: '/reports',
      roles: ['admin', 'manager'],
    },
    {
      text: 'الرسائل',
      icon: <Message />,
      path: '/messages',
      roles: ['admin', 'manager'],
    },
    {
      text: 'الإعدادات',
      icon: <Settings />,
      path: '/settings',
      roles: ['admin', 'manager'],
    },
  ];

  const handleItemClick = (path: string) => {
    navigate(path);
    onItemClick?.();
  };

  const isItemActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const canAccessItem = (roles: string[]) => {
    return roles.includes(user?.role || '');
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'error',
      manager: 'warning',
      receptionist: 'info',
    };
    return colors[role as keyof typeof colors] || 'default';
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      admin: 'مدير النظام',
      manager: 'مدير الصالة',
      receptionist: 'موظف استقبال',
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Toolbar
        sx={{
          background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
          color: 'white',
          flexDirection: 'column',
          alignItems: 'center',
          py: 2,
        }}
      >
        <FitnessCenter sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center' }}>
          البسنديلي جيم
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8, textAlign: 'center' }}>
          نظام إدارة الصالة
        </Typography>
      </Toolbar>

      {/* User info */}
      <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}
            src={user?.avatar}
          >
            {user?.full_name?.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, mb: 0.5 }}
              noWrap
            >
              {user?.full_name}
            </Typography>
            <Chip
              label={getRoleDisplayName(user?.role || '')}
              size="small"
              color={getRoleColor(user?.role || '') as any}
              variant="outlined"
            />
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Quick Actions */}
      <Box sx={{ p: 1 }}>
        <List dense>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleItemClick('/dashboard')}
              sx={{
                borderRadius: 1,
                bgcolor: location.pathname === '/dashboard' ? 'primary.light' : 'transparent',
                color: location.pathname === '/dashboard' ? 'primary.contrastText' : 'text.primary',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Home fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="الصفحة الرئيسية"
                primaryTypographyProps={{ fontSize: 12 }}
              />
            </ListItemButton>
          </ListItem>

          {location.pathname !== '/dashboard' && (
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => window.history.back()}
                sx={{
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <ArrowBack fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="العودة"
                  primaryTypographyProps={{ fontSize: 12 }}
                />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Box>

      <Divider />

      {/* Navigation menu */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ py: 1 }}>
          {menuItems.map((item) => {
            if (!canAccessItem(item.roles)) {
              return null;
            }

            const isActive = isItemActive(item.path);

            return (
              <ListItem key={item.path} disablePadding sx={{ px: 1 }}>
                <ListItemButton
                  onClick={() => handleItemClick(item.path)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    mb: 0.5,
                    bgcolor: isActive ? 'primary.main' : 'transparent',
                    color: isActive ? 'white' : 'text.primary',
                    '&:hover': {
                      bgcolor: isActive ? 'primary.dark' : 'action.hover',
                    },
                    '& .MuiListItemIcon-root': {
                      color: isActive ? 'white' : 'text.secondary',
                      minWidth: 40,
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: isActive ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Quick Actions Footer */}
      <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
        <List dense>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleItemClick('/messages')}
              sx={{
                borderRadius: 1,
                bgcolor: '#25D366',
                color: 'white',
                '&:hover': { bgcolor: '#128C7E' },
                mb: 1,
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <WhatsApp fontSize="small" sx={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText
                primary="واتساب سريع"
                primaryTypographyProps={{ fontSize: 12, color: 'white' }}
              />
            </ListItemButton>
          </ListItem>
        </List>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: 'center', display: 'block', mt: 1 }}
        >
          © 2024 البسنديلي جيم
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: 'center', display: 'block' }}
        >
          الإصدار 1.0.0
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;
