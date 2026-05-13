import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemText, 
  ListItemIcon, Box, Button, IconButton, useMediaQuery, useTheme,
  Avatar, Badge, Tooltip
} from '@mui/material';
import {
  Dashboard, AttachMoney, Apartment, Build, ExitToApp,
  ChevronLeft, ChevronRight, Menu as MenuIcon,
  Notifications
} from '@mui/icons-material';

const DRAWER_WIDTH = 240;
const DRAWER_COLLAPSED = 60;

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [collapsed, setCollapsed] = useState(true);
  const [hoverExpand, setHoverExpand] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isExpanded = !collapsed || hoverExpand;

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Despesas', icon: <AttachMoney />, path: '/expenses' },
    { text: 'Unidades', icon: <Apartment />, path: '/units' },
    { text: 'Manutenção', icon: <Build />, path: '/maintenance' },
  ];

  const drawerContent = (
    <Box 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: '#1a1a2e',
        color: 'white'
      }}
      onMouseEnter={() => setHoverExpand(true)}
      onMouseLeave={() => setHoverExpand(false)}
    >
      {/* Logo */}
      <Box sx={{ 
        p: isExpanded ? 2 : 1.2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isExpanded ? 'flex-start' : 'center',
        gap: isExpanded ? 1.5 : 0,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        minHeight: 56
      }}>
        <Box sx={{ 
          bgcolor: '#6c5ce7', 
          borderRadius: 1.5, 
          width: 32, 
          height: 32, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: 16,
          flexShrink: 0
        }}>
          🏢
        </Box>
        {isExpanded && (
          <Box sx={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <Typography sx={{ fontWeight: 700, fontSize: 13, color: 'white', lineHeight: 1.2 }}>
              CondoManager
            </Typography>
          </Box>
        )}
      </Box>

      {/* Menu */}
      <List sx={{ flex: 1, px: 0.5, pt: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Tooltip key={item.path} title={!isExpanded ? item.text : ''} placement="right" arrow>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 1.5,
                  mb: 0.3,
                  minHeight: 40,
                  justifyContent: isExpanded ? 'initial' : 'center',
                  px: isExpanded ? 1.5 : 1,
                  bgcolor: isActive ? '#6c5ce7' : 'transparent',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
                  '&:hover': {
                    bgcolor: isActive ? '#5a4bd1' : 'rgba(108,92,231,0.12)',
                    color: 'white',
                  },
                  transition: 'all 0.15s ease',
                }}
              >
                <ListItemIcon sx={{
                  minWidth: 0,
                  mr: isExpanded ? 1.5 : 0,
                  justifyContent: 'center',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.45)',
                }}>
                  {item.icon}
                </ListItemIcon>
                {isExpanded && (
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ fontSize: 12, fontWeight: isActive ? 600 : 400 }} 
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      {/* Toggle Button */}
      {!isMobile && (
        <Box sx={{ px: 1, pb: 1 }}>
          <Button
            onClick={() => setCollapsed(!collapsed)}
            sx={{
              minWidth: 'auto',
              width: '100%',
              p: 0.5,
              color: 'rgba(255,255,255,0.3)',
              fontSize: 10,
              '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.05)' },
            }}
          >
            {collapsed ? <ChevronRight fontSize="small" /> : <ChevronLeft fontSize="small" />}
          </Button>
        </Box>
      )}

      {/* User */}
      <Box sx={{ p: isExpanded ? 1.5 : 1, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: isExpanded ? 1.5 : 0,
          justifyContent: 'center',
          mb: 1
        }}>
          <Avatar sx={{ bgcolor: '#6c5ce7', width: 28, height: 28, fontSize: 11, fontWeight: 700 }}>
            S
          </Avatar>
          {isExpanded && (
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'white' }}>Síndico</Typography>
              <Typography sx={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>Administrador</Typography>
            </Box>
          )}
        </Box>
        <Tooltip title={!isExpanded ? 'Sair' : ''} placement="right">
          <Button
            fullWidth
            onClick={() => { logout(); navigate('/login'); }}
            sx={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: 11,
              justifyContent: 'center',
              textTransform: 'none',
              borderRadius: 1.5,
              minWidth: 'auto',
              p: 0.5,
              '&:hover': { bgcolor: 'rgba(231,76,60,0.12)', color: '#e74c3c' },
            }}
          >
            <ExitToApp sx={{ fontSize: 16 }} />
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f6fa', minHeight: '100vh' }}>
      {/* Sidebar Desktop */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: isExpanded ? DRAWER_WIDTH : DRAWER_COLLAPSED,
            flexShrink: 0,
            transition: 'width 0.2s ease',
            '& .MuiDrawer-paper': {
              width: isExpanded ? DRAWER_WIDTH : DRAWER_COLLAPSED,
              boxSizing: 'border-box',
              borderRight: 'none',
              transition: 'width 0.2s ease',
              overflow: 'hidden',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Sidebar Mobile */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', borderRight: 'none' } }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content - OCUPA TODA A LARGURA RESTANTE */}
      <Box sx={{ 
        flexGrow: 1,
        display: 'flex', 
        flexDirection: 'column',
        transition: 'margin 0.2s ease',
        ml: isMobile ? 0 : `${DRAWER_COLLAPSED}px`,
        minWidth: 0, // Importante para tabelas não quebrarem
        ...(!isMobile && isExpanded && { ml: `${DRAWER_WIDTH}px` })
      }}>
        {/* Top Bar */}
        <AppBar 
          position="sticky" 
          elevation={0}
          sx={{ bgcolor: 'white', borderBottom: '1px solid #e8eaed', zIndex: 1100 }}
        >
          <Toolbar sx={{ minHeight: 52, px: { xs: 1.5, md: 2.5 } }}>
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} sx={{ mr: 1, color: '#6c5ce7' }}>
                <MenuIcon />
              </IconButton>
            )}

            <Typography sx={{ 
              flexGrow: 1, 
              fontWeight: 600, 
              fontSize: 15,
              color: '#1a1a2e'
            }}>
              {menuItems.find(m => m.path === location.pathname)?.text || 'Dashboard'}
            </Typography>

            <IconButton sx={{ mr: 1, color: '#636e72' }} size="small">
              <Badge badgeContent={3} color="error">
                <Notifications fontSize="small" />
              </Badge>
            </IconButton>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              pl: 1.5,
              borderLeft: '1px solid #e8eaed'
            }}>
              <Avatar sx={{ bgcolor: '#6c5ce7', width: 28, height: 28, fontSize: 11, fontWeight: 700 }}>
                S
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#1a1a2e' }}>Síndico</Typography>
                <Typography sx={{ fontSize: 9, color: '#636e72' }}>Administrador</Typography>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content - SEM LIMITE DE LARGURA */}
        <Box sx={{ p: { xs: 1.5, md: 2.5 }, flex: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
