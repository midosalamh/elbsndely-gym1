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
  Link,
  useTheme,
  useMediaQuery,
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
  Phone,
  Code,
} from '@mui/icons-material';
 
import { RootState } from '../../store/store'; 
 
interface SidebarProps { 
  onItemClick?: () => void; 
} 
 
const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => { 
  const navigate = useNavigate(); 
  const location = useLocation(); 
  const { user } = useSelector((state: RootState) => state.auth); 
  const theme = useTheme(); 
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); 
 
  const menuItems = [ 
    { text: '???? ??????', icon: <Dashboard />, path: '/dashboard', roles: ['admin', 'manager', 'receptionist'] }, 
    { text: '???????', icon: <People />, path: '/members', roles: ['admin', 'manager', 'receptionist'] }, 
    { text: '??????????', icon: <CardMembership />, path: '/subscriptions', roles: ['admin', 'manager', 'receptionist'] }, 
    { text: '?????????', icon: <Payment />, path: '/payments', roles: ['admin', 'manager', 'receptionist'] }, 
    { text: '????????', icon: <Assessment />, path: '/reports', roles: ['admin', 'manager'] }, 
    { text: '???????', icon: <Message />, path: '/messages', roles: ['admin', 'manager'] }, 
    { text: '?????????', icon: <Settings />, path: '/settings', roles: ['admin', 'manager'] }, 
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
    const colors = { admin: 'error', manager: 'warning', receptionist: 'info' };
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Toolbar sx={{ px: 2, py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: isMobile ? 32 : 40, height: isMobile ? 32 : 40 }}>
            <FitnessCenter />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant={isMobile ? 'body2' : 'h6'} sx={{ fontWeight: 'bold', color: 'primary.main', lineHeight: 1.2 }}>
              البسنديلي جيم
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>
              نظام إدارة الصالة
            </Typography>
          </Box>
        </Box>
      </Toolbar>

      {/* User Info */}
      <Box sx={{ px: 2, py: 1, bgcolor: 'grey.50' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
            {user?.full_name?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 'medium', lineHeight: 1.2 }}>
              {user?.full_name || 'مستخدم'}
            </Typography>
            <Chip
              label={getRoleDisplayName(user?.role || '')}
              size="small"
              color={getRoleColor(user?.role || '') as any}
              sx={{ height: 16, fontSize: '0.7rem' }}
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
            if (!canAccessItem(item.roles)) return null;

            const isActive = isItemActive(item.path);

            return (
              <ListItem key={item.path} disablePadding sx={{ px: 1 }}>
                <ListItemButton
                  onClick={() => handleItemClick(item.path)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    bgcolor: isActive ? 'primary.main' : 'transparent',
                    color: isActive ? 'primary.contrastText' : 'text.primary',
                    '&:hover': {
                      bgcolor: isActive ? 'primary.dark' : 'action.hover',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isActive ? 'primary.contrastText' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 'bold' : 'normal',
                      fontSize: isMobile ? '0.875rem' : '1rem',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* WhatsApp Quick Action */}
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
      </Box>

      {/* Developer Info */}
      <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
        <Divider sx={{ mb: 1 }} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
            <Code fontSize="small" />
            تطوير: محمد سلامة
          </Typography>
          <Link href="tel:01063864546" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, textDecoration: 'none' }}>
            <Phone fontSize="small" />
            <Typography variant="caption" color="primary">
              01063864546
            </Typography>
          </Link>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            © 2024 البسنديلي جيم
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
