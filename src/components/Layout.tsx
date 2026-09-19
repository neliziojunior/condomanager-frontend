import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemText, 
  ListItemIcon, Box, Button, IconButton, useMediaQuery, useTheme,
  Badge, Popover, Avatar, Divider, BottomNavigation, BottomNavigationAction,
  Paper, Collapse, Chip,
} from '@mui/material';
import {
  Dashboard, AttachMoney, Apartment, Build, Inventory, Campaign, ExitToApp,
  Menu as MenuIcon, Notifications, Warning,
  Event, Description, ReportProblem, Search, SmartToy, HowToVote, Store, People, Chat,
  AccountBalance, Draw, Inventory as InventoryIcon, Home, MoreHoriz,
  Visibility, Payments, ExpandLess, ExpandMore, Badge as BadgeIcon, Calculate,
  Settings, Receipt, AutoAwesome
} from '@mui/icons-material';

const DRAWER_WIDTH = 260;

export default function Layout() {
  const { logout, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState({ packages: 0, maintenance: 0, overdueExpenses: 0, total: 0 });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [bottomTab, setBottomTab] = useState(0);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const getProfile = (r: string | null): 'admin' | 'resident' | 'staff' => {
    if (r === 'SYNDIC' || r === 'ADMIN') return 'admin';
    if (r === 'RESIDENT' || r === 'OWNER') return 'resident';
    return 'staff';
  };
  const userProfile = getProfile(role);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadNotifications() {
    try { const { data } = await api.get('/notifications'); setNotifications(data); } catch (error) {}
  }

  const toggleMenu = (key: string) => {
    setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const menuGroups = {
    admin: [
      { key: 'dashboard', label: '📊 Dashboard', icon: <Dashboard />, items: [
        { text: 'Visão Geral', icon: <Dashboard />, path: '/dashboard' },
        { text: 'Transparência', icon: <Visibility />, path: '/transparency' },
      ]},
      { key: 'gestao', label: '🏢 Gestão', icon: <Apartment />, items: [
        { text: 'Unidades', icon: <Apartment />, path: '/units' },
        { text: 'Funcionários', icon: <BadgeIcon />, path: '/employees' },
        { text: 'Manutenção', icon: <Build />, path: '/maintenance' },
        { text: 'Estoque', icon: <InventoryIcon />, path: '/inventory' },
      ]},
      { key: 'financeiro', label: '💰 Financeiro', icon: <AttachMoney />, items: [
        { text: 'Despesas', icon: <AttachMoney />, path: '/expenses' },
        { text: 'Folha de Pagamento', icon: <Calculate />, path: '/payroll' },
        { text: 'Cobranças', icon: <Receipt />, path: '/charges' },
        { text: 'Conciliação IA', icon: <AutoAwesome />, path: '/reconciliation' },
        { text: 'Contabilidade', icon: <AccountBalance />, path: '/accounting' },
      ]},
      { key: 'social', label: '👥 Social', icon: <Campaign />, items: [
        { text: 'Assembleias', icon: <HowToVote />, path: '/assemblies' },
        { text: 'Avisos', icon: <Campaign />, path: '/notices' },
        { text: 'Enquetes', icon: <HowToVote />, path: '/polls' },
        { text: 'Ocorrências', icon: <ReportProblem />, path: '/occurrences' },
        { text: 'Chat', icon: <Chat />, path: '/chat' },
      ]},
      { key: 'documentos', label: '📄 Documentos', icon: <Description />, items: [
        { text: 'Documentos', icon: <Description />, path: '/documents' },
        { text: 'Assinatura Digital', icon: <Draw />, path: '/signatures' },
      ]},
      { key: 'ia', label: '🤖 IA', icon: <SmartToy />, items: [
        { text: 'Concierge IA', icon: <SmartToy />, path: '/chatbot' },
      ]},
      { key: 'config', label: '⚙️ Configurações', icon: <Settings />, items: [
        { text: 'Configurações', icon: <Settings />, path: '/settings' },
      ]},
      
    ],
    resident: [
      { key: 'dashboard', label: '📊 Dashboard', icon: <Dashboard />, items: [
        { text: 'Visão Geral', icon: <Dashboard />, path: '/dashboard' },
        { text: 'Transparência', icon: <Visibility />, path: '/transparency' },
      ]},
      { key: 'conveniencia', label: '🏠 Conveniência', icon: <Home />, items: [
        { text: 'Reservas', icon: <Event />, path: '/reservations' },
        { text: 'Encomendas', icon: <Inventory />, path: '/packages' },
        { text: 'Visitantes/QR', icon: <People />, path: '/visitors' },
        { text: 'Classificados', icon: <Store />, path: '/listings' },
      ]},
      { key: 'social', label: '👥 Social', icon: <Campaign />, items: [
        { text: 'Assembleias', icon: <HowToVote />, path: '/assemblies' },
        { text: 'Avisos', icon: <Campaign />, path: '/notices' },
        { text: 'Enquetes', icon: <HowToVote />, path: '/polls' },
        { text: 'Chat', icon: <Chat />, path: '/chat' },
        { text: 'Ocorrências', icon: <ReportProblem />, path: '/occurrences' },
        { text: 'Achados/Perdidos', icon: <Search />, path: '/lostfound' },
      ]},
      { key: 'documentos', label: '📄 Documentos', icon: <Description />, items: [
        { text: 'Documentos', icon: <Description />, path: '/documents' },
        { text: 'Assinatura', icon: <Draw />, path: '/signatures' },
      ]},
      { key: 'ia', label: '🤖 IA', icon: <SmartToy />, items: [
        { text: 'Concierge IA', icon: <SmartToy />, path: '/chatbot' },
      ]},
      
    ],
    staff: [
      { key: 'dashboard', label: '📊 Dashboard', icon: <Dashboard />, items: [
        { text: 'Visão Geral', icon: <Dashboard />, path: '/dashboard' },
      ]},
      { key: 'operacional', label: '🔧 Operacional', icon: <Build />, items: [
        { text: 'Encomendas', icon: <Inventory />, path: '/packages' },
        { text: 'Visitantes/QR', icon: <People />, path: '/visitors' },
        { text: 'Manutenção', icon: <Build />, path: '/maintenance' },
        { text: 'Estoque', icon: <InventoryIcon />, path: '/inventory' },
        { text: 'Achados/Perdidos', icon: <Search />, path: '/lostfound' },
        { text: 'Chat', icon: <Chat />, path: '/chat' },
      ]},
    ],
  };

  const currentMenu = menuGroups[userProfile];
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
      <Divider sx={{ borderColor: '#F0F0F0' }} />
      <List sx={{ flex: 1, px: 1.5, pt: 1, overflow: 'auto' }}>
        {currentMenu.map((group) => (
          <Box key={group.key}>
            <ListItemButton onClick={() => toggleMenu(group.key)} sx={{ borderRadius: 2, mb: 0.2, minHeight: 42, px: 2, color: '#374151', '&:hover': { bgcolor: '#F7F9FC' } }}>
              <ListItemIcon sx={{ minWidth: 0, mr: 1.5, color: '#00A896' }}>{group.icon}</ListItemIcon>
              <ListItemText primary={group.label} primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
              {openMenus[group.key] ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </ListItemButton>
            <Collapse in={openMenus[group.key]}>
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <ListItemButton key={item.path} onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                    sx={{ borderRadius: 2, mb: 0.2, minHeight: 38, px: 2, ml: 2, bgcolor: isActive ? '#F0FDF9' : 'transparent', color: isActive ? '#00A896' : '#6B7280', '&:hover': { bgcolor: '#F7F9FC', color: '#00A896' } }}>
                    <ListItemIcon sx={{ minWidth: 0, mr: 2, color: isActive ? '#00A896' : '#9CA3AF' }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 12.5, fontWeight: isActive ? 600 : 400 }} />
                  </ListItemButton>
                );
              })}
            </Collapse>
          </Box>
        ))}
      </List>
      <Box sx={{ p: 2, borderTop: '1px solid #F0F0F0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, p: 1.5, bgcolor: '#F7F9FC', borderRadius: 2 }}>
          <Avatar sx={{ bgcolor: '#00A896', width: 36, height: 36, fontSize: 15, fontWeight: 600 }}>S</Avatar>
          <Box><Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E' }}>{userProfile === 'admin' ? 'Administrador' : userProfile === 'resident' ? 'Condômino' : 'Colaborador'}</Typography></Box>
        </Box>
        <Button fullWidth onClick={() => { logout(); navigate('/login'); }} startIcon={<ExitToApp />} sx={{ color: '#6B7280', fontSize: 12, textTransform: 'none', borderRadius: 2, py: 1, '&:hover': { bgcolor: '#FFF5F5', color: '#E63946' } }}>Sair</Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: '#F7F9FC', minHeight: '100vh', pb: isMobile ? 7 : 0 }}>
      {!isMobile && <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, borderRight: 'none' } }}>{drawerContent}</Drawer>}
      {isMobile && <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}>{drawerContent}</Drawer>}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #F0F0F0' }}>
          <Toolbar sx={{ minHeight: 56, px: 2 }}>
            {isMobile && <IconButton onClick={() => setMobileOpen(true)} sx={{ mr: 1, color: '#00A896' }}><MenuIcon /></IconButton>}
            <Typography sx={{ flexGrow: 1, fontWeight: 600, fontSize: 15, color: '#1A1A2E' }}>CondoPro</Typography>
            <Chip label={userProfile === 'admin' ? '👔 Admin' : userProfile === 'resident' ? '👤 Condômino' : '🔑 Colaborador'} size="small" sx={{ mr: 1, bgcolor: '#F0FDF9', color: '#00A896', fontWeight: 600, fontSize: 11 }} />
            <IconButton sx={{ color: '#6B7280' }} size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Badge badgeContent={notifications.total} color="error"><Notifications fontSize="small" /></Badge>
            </IconButton>
            <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} PaperProps={{ sx: { borderRadius: 3, mt: 1 } }}>
              <Box sx={{ p: 2.5, minWidth: 260 }}>
                <Typography variant="subtitle2" fontWeight={600} mb={2}>🔔 Notificações</Typography>
                <Box display="flex" alignItems="center" gap={1.5} py={1}><Inventory fontSize="small" sx={{ color: '#F0A500' }} /><Typography variant="caption">{notifications.packages} encomenda(s) pendente(s)</Typography></Box>
                <Box display="flex" alignItems="center" gap={1.5} py={1}><Build fontSize="small" sx={{ color: '#E63946' }} /><Typography variant="caption">{notifications.maintenance} chamado(s) aberto(s)</Typography></Box>
                <Box display="flex" alignItems="center" gap={1.5} py={1}><Warning fontSize="small" sx={{ color: '#E63946' }} /><Typography variant="caption">{notifications.overdueExpenses} despesa(s) vencida(s)</Typography></Box>
                {notifications.total === 0 && <Typography variant="caption" color="textSecondary">✅ Nenhuma notificação</Typography>}
              </Box>
            </Popover>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: isMobile ? 1.5 : 2, flex: 1 }}><Outlet /></Box>
        {isMobile && (
          <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1200, borderTop: '1px solid #F0F0F0' }} elevation={3}>
            <BottomNavigation value={bottomTab} onChange={(_, v) => { if (v === 4) setMobileOpen(true); else { setBottomTab(v); navigate(mainMobileItems[v].path); } }} showLabels sx={{ height: 60 }}>
              {mainMobileItems.map((item, i) => <BottomNavigationAction key={i} label={item.text} icon={item.icon} sx={{ '&.Mui-selected': { color: '#00A896' } }} />)}
            </BottomNavigation>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
