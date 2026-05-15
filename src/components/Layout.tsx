import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemText, 
  ListItemIcon, Box, Button, IconButton, useMediaQuery, useTheme,
  Avatar, Badge, Tooltip, Popover
} from '@mui/material';
import {
  Dashboard, AttachMoney, Apartment, Build, Inventory, Campaign, ExitToApp,
  ChevronLeft, ChevronRight, Menu as MenuIcon, Notifications, Warning
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
  const [notifications, setNotifications] = useState({ packages: 0, maintenance: 0, overdueExpenses: 0, total: 0 });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isExpanded = !collapsed || hoverExpand;

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadNotifications() {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (error) {}
  }

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Despesas', icon: <AttachMoney />, path: '/expenses' },
    { text: 'Unidades', icon: <Apartment />, path: '/units' },
    { text: 'Manutenção', icon: <Build />, path: '/maintenance' },
    { text: 'Encomendas', icon: <Inventory />, path: '/packages' },
    { text: 'Avisos', icon: <Campaign />, path: '/notices' },
  ];

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f6fa', minHeight: '100vh' }}>
      {!isMobile && (
        <Drawer variant="permanent" sx={{ width: isExpanded ? DRAWER_WIDTH : DRAWER_COLLAPSED, flexShrink: 0, '& .MuiDrawer-paper': { width: isExpanded ? DRAWER_WIDTH : DRAWER_COLLAPSED, boxSizing: 'border-box', borderRight: 'none', bgcolor: '#1a1a2e', color: 'white', transition: 'width 0.2s ease', overflow: 'hidden' } }}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} onMouseEnter={() => setHoverExpand(true)} onMouseLeave={() => setHoverExpand(false)}>
            <Box sx={{ p: isExpanded ? 2 : 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isExpanded ? 1.5 : 0, borderBottom: '1px solid rgba(255,255,255,0.08)', minHeight: 56 }}>
              <Box sx={{ bgcolor: '#6c5ce7', borderRadius: 1.5, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🏢</Box>
              {isExpanded && <Typography sx={{ fontWeight: 700, fontSize: 13, color: 'white' }}>CondoManager</Typography>}
            </Box>
            <List sx={{ flex: 1, px: 0.5, pt: 1 }}>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Tooltip key={item.path} title={!isExpanded ? item.text : ''} placement="right" arrow>
                    <ListItemButton onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                      sx={{ borderRadius: 1.5, mb: 0.3, minHeight: 40, justifyContent: isExpanded ? 'initial' : 'center', px: isExpanded ? 1.5 : 1, bgcolor: isActive ? '#6c5ce7' : 'transparent', color: isActive ? 'white' : 'rgba(255,255,255,0.55)', '&:hover': { bgcolor: isActive ? '#5a4bd1' : 'rgba(108,92,231,0.12)', color: 'white' } }}>
                      <ListItemIcon sx={{ minWidth: 0, mr: isExpanded ? 1.5 : 0, justifyContent: 'center', color: isActive ? 'white' : 'rgba(255,255,255,0.45)' }}>{item.icon}</ListItemIcon>
                      {isExpanded && <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 12 }} />}
                    </ListItemButton>
                  </Tooltip>
                );
              })}
            </List>
            <Box sx={{ p: 1.5, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <Button fullWidth onClick={() => { logout(); navigate('/login'); }} startIcon={isExpanded ? <ExitToApp /> : undefined}
                sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, justifyContent: 'center', textTransform: 'none', borderRadius: 1.5, minWidth: 'auto', p: 0.5, '&:hover': { bgcolor: 'rgba(231,76,60,0.12)', color: '#e74c3c' } }}>
                {isExpanded ? 'Sair' : <ExitToApp sx={{ fontSize: 16 }} />}
              </Button>
            </Box>
          </Box>
        </Drawer>
      )}
      {isMobile && (
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, bgcolor: '#1a1a2e', color: 'white' } }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <Box sx={{ bgcolor: '#6c5ce7', borderRadius: 1.5, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏢</Box>
            <Typography sx={{ fontWeight: 700, fontSize: 13, color: 'white' }}>CondoManager</Typography>
          </Box>
          <List sx={{ px: 0.5, pt: 1 }}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <ListItemButton key={item.path} onClick={() => { navigate(item.path); setMobileOpen(false); }}
                  sx={{ borderRadius: 1.5, mb: 0.3, minHeight: 40, px: 1.5, bgcolor: isActive ? '#6c5ce7' : 'transparent', color: isActive ? 'white' : 'rgba(255,255,255,0.55)' }}>
                  <ListItemIcon sx={{ minWidth: 0, mr: 1.5, color: isActive ? 'white' : 'rgba(255,255,255,0.45)' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 12 }} />
                </ListItemButton>
              );
            })}
          </List>
        </Drawer>
      )}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #e8eaed', zIndex: 1100 }}>
          <Toolbar sx={{ minHeight: 52, px: { xs: 1.5, md: 2.5 } }}>
            {isMobile && <IconButton onClick={() => setMobileOpen(true)} sx={{ mr: 1, color: '#6c5ce7' }}><MenuIcon /></IconButton>}
            <Typography sx={{ flexGrow: 1, fontWeight: 600, fontSize: 15, color: '#1a1a2e' }}>{menuItems.find(m => m.path === location.pathname)?.text || 'Dashboard'}</Typography>
            <IconButton sx={{ mr: 1, color: '#636e72' }} size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Badge badgeContent={notifications.total} color="error"><Notifications fontSize="small" /></Badge>
            </IconButton>
            <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
              <Box sx={{ p: 2, minWidth: 250 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>🔔 Notificações</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                  <Inventory fontSize="small" sx={{ color: '#f39c12' }} />
                  <Typography variant="caption">{notifications.packages} encomenda(s) pendente(s)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                  <Build fontSize="small" sx={{ color: '#e74c3c' }} />
                  <Typography variant="caption">{notifications.maintenance} chamado(s) aberto(s)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                  <Warning fontSize="small" sx={{ color: '#e74c3c' }} />
                  <Typography variant="caption">{notifications.overdueExpenses} despesa(s) vencida(s)</Typography>
                </Box>
                {notifications.total === 0 && <Typography variant="caption" color="textSecondary">✅ Nenhuma notificação</Typography>}
              </Box>
            </Popover>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: { xs: 1.5, md: 2.5 }, flex: 1 }}><Outlet /></Box>
      </Box>
    </Box>
  );
}
