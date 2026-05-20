import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemText, 
  ListItemIcon, Box, Button, IconButton, useMediaQuery, useTheme,
  Badge, Popover, Avatar, Divider, BottomNavigation, BottomNavigationAction,
  Paper, Tabs, Tab, Chip
} from '@mui/material';
import {
  Dashboard, AttachMoney, Apartment, Build, Inventory, Campaign, ExitToApp,
  Menu as MenuIcon, Notifications, Warning,
  Event, Description, ReportProblem, Search, SmartToy, HowToVote, Store, People, Chat,
  AccountBalance, Draw, Inventory as InventoryIcon, Home, MoreHoriz,
  AdminPanelSettings, Person, Security, Pix // ✅ NOVO: Pix
} from '@mui/icons-material';

const DRAWER_WIDTH = 260;

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState({ packages: 0, maintenance: 0, overdueExpenses: 0, total: 0 });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [bottomTab, setBottomTab] = useState(0);
  const [userProfile, setUserProfile] = useState<'syndic' | 'resident' | 'doorman'>('syndic');

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadNotifications() {
    try { const { data } = await api.get('/notifications'); setNotifications(data); } catch (error) {}
  }

  const menuByProfile = {
    syndic: [
      { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', category: 'principal' },
      { text: 'Despesas', icon: <AttachMoney />, path: '/expenses', category: 'financeiro' },
      { text: 'Cobranças', icon: <Pix />, path: '/payments', category: 'financeiro' }, // ✅ NOVO: Cobranças
      { text: 'Contabilidade', icon: <AccountBalance />, path: '/accounting', category: 'financeiro' },
      { text: 'Estoque', icon: <InventoryIcon />, path: '/inventory', category: 'operacional' },
      { text: 'Unidades', icon: <Apartment />, path: '/units', category: 'operacional' },
      { text: 'Manutenção', icon: <Build />, path: '/maintenance', category: 'operacional' },
      { text: 'Encomendas', icon: <Inventory />, path: '/packages', category: 'operacional' },
      { text: 'Visitantes', icon: <People />, path: '/visitors', category: 'seguranca' },
      { text: 'Reservas', icon: <Event />, path: '/reservations', category: 'social' },
      { text: 'Assembleias', icon: <HowToVote />, path: '/assemblies', category: 'social' },
      { text: 'Avisos', icon: <Campaign />, path: '/notices', category: 'social' },
      { text: 'Enquetes', icon: <HowToVote />, path: '/polls', category: 'social' },
      { text: 'Classificados', icon: <Store />, path: '/listings', category: 'social' },
      { text: 'Chat', icon: <Chat />, path: '/chat', category: 'social' },
      { text: 'Ocorrências', icon: <ReportProblem />, path: '/occurrences', category: 'social' },
      { text: 'Achados/Perdidos', icon: <Search />, path: '/lostfound', category: 'social' },
      { text: 'Documentos', icon: <Description />, path: '/documents', category: 'documentos' },
      { text: 'Assinatura Digital', icon: <Draw />, path: '/signatures', category: 'documentos' },
      { text: 'Concierge IA', icon: <SmartToy />, path: '/chatbot', category: 'outros' },
    ],
    resident: [
      { text: 'Início', icon: <Home />, path: '/dashboard', category: 'principal' },
      { text: 'Assembleias', icon: <HowToVote />, path: '/assemblies', category: 'principal' },
      { text: 'Reservas', icon: <Event />, path: '/reservations', category: 'principal' },
      { text: 'Avisos', icon: <Campaign />, path: '/notices', category: 'principal' },
      { text: 'Chat', icon: <Chat />, path: '/chat', category: 'principal' },
      { text: 'Classificados', icon: <Store />, path: '/listings', category: 'principal' },
      { text: 'Ocorrências', icon: <ReportProblem />, path: '/occurrences', category: 'principal' },
      { text: 'Documentos', icon: <Description />, path: '/documents', category: 'principal' },
    ],
    doorman: [
      { text: 'Visitantes', icon: <People />, path: '/visitors', category: 'principal' },
      { text: 'Encomendas', icon: <Inventory />, path: '/packages', category: 'principal' },
      { text: 'QR Code', icon: <Search />, path: '/visitors', category: 'principal' },
    ],
  };

  const currentMenu = menuByProfile[userProfile];
  const categories = [...new Set(currentMenu.map(i => i.category))];

  const mainMobileItems = [
    { text: 'Início', icon: <Home />, path: '/dashboard' },
    { text: 'Despesas', icon: <AttachMoney />, path: '/expenses' },
    { text: 'Unidades', icon: <Apartment />, path: '/units' },
    { text: 'Manutenção', icon: <Build />, path: '/maintenance' },
    { text: 'Mais', icon: <MoreHoriz />, path: '' },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF', borderRight: '1px solid #F0F0F0' }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ bgcolor: '#00A896', borderRadius: 2, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'white', flexShrink: 0 }}>🏢</Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#1A1A2E', lineHeight: 1.2 }}>CondoPro</Typography>
          <Typography sx={{ fontSize: 10, color: '#00A896', fontWeight: 600, letterSpacing: 0.5 }}>GESTÃO PROFISSIONAL</Typography>
        </Box>
      </Box>
      <Box sx={{ px: 2, pb: 1 }}>
        <Tabs value={userProfile} onChange={(_, v) => setUserProfile(v)} variant="fullWidth" sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, fontSize: 11, textTransform: 'none' } }}>
          <Tab icon={<AdminPanelSettings sx={{ fontSize: 18 }} />} label="Síndico" value="syndic" />
          <Tab icon={<Person sx={{ fontSize: 18 }} />} label="Morador" value="resident" />
          <Tab icon={<Security sx={{ fontSize: 18 }} />} label="Portaria" value="doorman" />
        </Tabs>
      </Box>
      <Divider sx={{ borderColor: '#F0F0F0' }} />
      <List sx={{ flex: 1, px: 1.5, pt: 1, overflow: 'auto' }}>
        {categories.map(cat => {
          const catItems = currentMenu.filter(i => i.category === cat);
          if (catItems.length === 0) return null;
          return (
            <Box key={cat}>
              <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: '#9CA3AF', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                {cat === 'principal' ? '⭐ Principal' : cat === 'financeiro' ? '💰 Financeiro' : cat === 'operacional' ? '🔧 Operacional' : cat === 'seguranca' ? '🔒 Segurança' : cat === 'social' ? '👥 Social' : cat === 'documentos' ? '📄 Documentos' : '📦 Outros'}
              </Typography>
              {catItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <ListItemButton key={item.path} onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                    sx={{ borderRadius: 2, mb: 0.2, minHeight: 40, px: 2, bgcolor: isActive ? '#F0FDF9' : 'transparent', color: isActive ? '#00A896' : '#374151', '&:hover': { bgcolor: isActive ? '#F0FDF9' : '#F7F9FC', color: '#00A896' } }}>
                    <ListItemIcon sx={{ minWidth: 0, mr: 2, color: isActive ? '#00A896' : '#6B7280' }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? '#00A896' : '#374151' }} />
                    {isActive && <Box sx={{ width: 3, height: 18, borderRadius: 2, bgcolor: '#00A896' }} />}
                  </ListItemButton>
                );
              })}
            </Box>
          );
        })}
      </List>
      <Box sx={{ p: 2, borderTop: '1px solid #F0F0F0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, p: 1.5, bgcolor: '#F7F9FC', borderRadius: 2 }}>
          <Avatar sx={{ bgcolor: '#00A896', width: 36, height: 36, fontSize: 15, fontWeight: 600 }}>S</Avatar>
          <Box><Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E' }}>Síndico</Typography><Typography sx={{ fontSize: 11, color: '#6B7280' }}>Administrador</Typography></Box>
        </Box>
        <Button fullWidth onClick={() => { logout(); navigate('/login'); }} startIcon={<ExitToApp />}
          sx={{ color: '#6B7280', fontSize: 12, textTransform: 'none', borderRadius: 2, py: 1, '&:hover': { bgcolor: '#FFF5F5', color: '#E63946' } }}>Sair</Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: '#F7F9FC', minHeight: '100vh', pb: isMobile ? 7 : 0 }}>
      {!isMobile && (
        <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, flexShrink: 0, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', borderRight: 'none' } }}>
          {drawerContent}
        </Drawer>
      )}
      {isMobile && (
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}>
          {drawerContent}
        </Drawer>
      )}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #F0F0F0', zIndex: 1100 }}>
          <Toolbar sx={{ minHeight: 56, px: 2 }}>
            {isMobile && <IconButton onClick={() => setMobileOpen(true)} sx={{ mr: 1, color: '#00A896' }}><MenuIcon /></IconButton>}
            <Typography sx={{ flexGrow: 1, fontWeight: 600, fontSize: 15, color: '#1A1A2E' }}>
              {currentMenu.find(m => m.path === location.pathname)?.text || 'Dashboard'}
            </Typography>
            <Chip label={userProfile === 'syndic' ? '👔 Síndico' : userProfile === 'resident' ? '👤 Morador' : '🔑 Portaria'} size="small" sx={{ mr: 1, bgcolor: '#F0FDF9', color: '#00A896', fontWeight: 600, fontSize: 11 }} />
            <IconButton sx={{ color: '#6B7280' }} size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Badge badgeContent={notifications.total} color="error"><Notifications fontSize="small" /></Badge>
            </IconButton>
            <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} PaperProps={{ sx: { borderRadius: 3, mt: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } }}>
              <Box sx={{ p: 2.5, minWidth: 260 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, fontSize: 14 }}>🔔 Notificações</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}><Inventory fontSize="small" sx={{ color: '#F0A500' }} /><Typography variant="caption">{notifications.packages} encomenda(s) pendente(s)</Typography></Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}><Build fontSize="small" sx={{ color: '#E63946' }} /><Typography variant="caption">{notifications.maintenance} chamado(s) aberto(s)</Typography></Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}><Warning fontSize="small" sx={{ color: '#E63946' }} /><Typography variant="caption">{notifications.overdueExpenses} despesa(s) vencida(s)</Typography></Box>
                {notifications.total === 0 && <Typography variant="caption" color="textSecondary">✅ Nenhuma notificação</Typography>}
              </Box>
            </Popover>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: isMobile ? 1.5 : 2, flex: 1 }}><Outlet /></Box>
        {isMobile && (
          <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1200, borderTop: '1px solid #F0F0F0' }} elevation={3}>
            <BottomNavigation value={bottomTab} onChange={(_, newValue) => {
              if (newValue === 4) { setMobileOpen(true); }
              else { setBottomTab(newValue); navigate(mainMobileItems[newValue].path); }
            }} showLabels sx={{ height: 60 }}>
              {mainMobileItems.map((item, i) => (
                <BottomNavigationAction key={i} label={item.text} icon={item.icon} sx={{ color: location.pathname === item.path ? '#00A896' : '#6B7280', '&.Mui-selected': { color: '#00A896' } }} />
              ))}
            </BottomNavigation>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
