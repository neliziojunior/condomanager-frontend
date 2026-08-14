import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemText,
  ListItemIcon, Box, Button, IconButton, useMediaQuery, useTheme,
  Badge, Popover, Avatar, Divider, BottomNavigation, BottomNavigationAction,
  Paper, Collapse, Chip
} from '@mui/material';
import {
  Dashboard, AttachMoney, Apartment, Build, Inventory, Campaign, ExitToApp,
  Menu as MenuIcon, Notifications, Warning,
  Event, Description, ReportProblem, Search, SmartToy, HowToVote, Store, People, Chat,
  AccountBalance, Draw, Inventory as InventoryIcon, Home, MoreHoriz,
  Visibility, Payments, ExpandLess, ExpandMore, Badge as BadgeIcon, Calculate,
  Business,
} from '@mui/icons-material';

const DRAWER_WIDTH = 260;

export default function Layout() {
  const { logout, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Atalhos para as cores do tema central (theme.ts) — evita hex hardcoded aqui.
  const c = {
    accent: theme.palette.primary.main,
    accentSoft: theme.palette.primary.light ?? '#EFF6FF',
    textPrimary: theme.palette.text.primary,
    textSecondary: theme.palette.text.secondary,
    divider: theme.palette.divider,
    bg: theme.palette.background.default,
    paper: theme.palette.background.paper,
    error: theme.palette.error.main,
  };

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

  // Labels sem emoji — o ícone do MUI já comunica a categoria.
  const menuGroups = {
    admin: [
      { key: 'dashboard', label: 'Dashboard', icon: <Dashboard />, items: [
        { text: 'Visão Geral', icon: <Dashboard />, path: '/dashboard' },
        { text: 'Transparência', icon: <Visibility />, path: '/transparency' },
      ]},
      { key: 'gestao', label: 'Gestão', icon: <Apartment />, items: [
        { text: 'Unidades', icon: <Apartment />, path: '/units' },
        { text: 'Funcionários', icon: <BadgeIcon />, path: '/employees' },
        { text: 'Manutenção', icon: <Build />, path: '/maintenance' },
        { text: 'Estoque', icon: <InventoryIcon />, path: '/inventory' },
      ]},
      { key: 'financeiro', label: 'Financeiro', icon: <AttachMoney />, items: [
        { text: 'Despesas', icon: <AttachMoney />, path: '/expenses' },
        { text: 'Folha de Pagamento', icon: <Calculate />, path: '/payroll' },
        { text: 'Cobranças', icon: <Payments />, path: '/payments' },
        { text: 'Contabilidade', icon: <AccountBalance />, path: '/accounting' },
      ]},
      { key: 'social', label: 'Social', icon: <Campaign />, items: [
        { text: 'Assembleias', icon: <HowToVote />, path: '/assemblies' },
        { text: 'Avisos', icon: <Campaign />, path: '/notices' },
        { text: 'Enquetes', icon: <HowToVote />, path: '/polls' },
        { text: 'Ocorrências', icon: <ReportProblem />, path: '/occurrences' },
        { text: 'Chat', icon: <Chat />, path: '/chat' },
      ]},
      { key: 'documentos', label: 'Documentos', icon: <Description />, items: [
        { text: 'Documentos', icon: <Description />, path: '/documents' },
        { text: 'Assinatura Digital', icon: <Draw />, path: '/signatures' },
      ]},
      { key: 'ia', label: 'IA', icon: <SmartToy />, items: [
        { text: 'Concierge IA', icon: <SmartToy />, path: '/chatbot' },
      ]},
    ],
    resident: [
      { key: 'dashboard', label: 'Dashboard', icon: <Dashboard />, items: [
        { text: 'Visão Geral', icon: <Dashboard />, path: '/dashboard' },
        { text: 'Transparência', icon: <Visibility />, path: '/transparency' },
      ]},
      { key: 'conveniencia', label: 'Conveniência', icon: <Home />, items: [
        { text: 'Reservas', icon: <Event />, path: '/reservations' },
        { text: 'Encomendas', icon: <Inventory />, path: '/packages' },
        { text: 'Visitantes/QR', icon: <People />, path: '/visitors' },
        { text: 'Classificados', icon: <Store />, path: '/listings' },
      ]},
      { key: 'social', label: 'Social', icon: <Campaign />, items: [
        { text: 'Assembleias', icon: <HowToVote />, path: '/assemblies' },
        { text: 'Avisos', icon: <Campaign />, path: '/notices' },
        { text: 'Enquetes', icon: <HowToVote />, path: '/polls' },
        { text: 'Chat', icon: <Chat />, path: '/chat' },
        { text: 'Ocorrências', icon: <ReportProblem />, path: '/occurrences' },
        { text: 'Achados/Perdidos', icon: <Search />, path: '/lostfound' },
      ]},
      { key: 'documentos', label: 'Documentos', icon: <Description />, items: [
        { text: 'Documentos', icon: <Description />, path: '/documents' },
        { text: 'Assinatura', icon: <Draw />, path: '/signatures' },
      ]},
      { key: 'ia', label: 'IA', icon: <SmartToy />, items: [
        { text: 'Concierge IA', icon: <SmartToy />, path: '/chatbot' },
      ]},
    ],
    staff: [
      { key: 'dashboard', label: 'Dashboard', icon: <Dashboard />, items: [
        { text: 'Visão Geral', icon: <Dashboard />, path: '/dashboard' },
      ]},
      { key: 'operacional', label: 'Operacional', icon: <Build />, items: [
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: c.paper, borderRight: `1px solid ${c.divider}` }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ bgcolor: c.accent, borderRadius: 2, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
          <Business fontSize="small" />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: c.textPrimary, lineHeight: 1.2 }}>CondoPro</Typography>
          <Typography sx={{ fontSize: 10, color: c.accent, fontWeight: 600, letterSpacing: 0.5 }}>GESTÃO PROFISSIONAL</Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: c.divider }} />
      <List sx={{ flex: 1, px: 1.5, pt: 1, overflow: 'auto' }}>
        {currentMenu.map((group) => (
          <Box key={group.key}>
            <ListItemButton onClick={() => toggleMenu(group.key)} sx={{ borderRadius: 2, mb: 0.2, minHeight: 42, px: 2, color: c.textPrimary, '&:hover': { bgcolor: c.bg } }}>
              <ListItemIcon sx={{ minWidth: 0, mr: 1.5, color: c.textSecondary }}>{group.icon}</ListItemIcon>
              <ListItemText primary={group.label} primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
              {openMenus[group.key] ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </ListItemButton>
            <Collapse in={openMenus[group.key]}>
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <ListItemButton
                    key={item.path}
                    onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                    sx={{
                      borderRadius: 2, mb: 0.2, minHeight: 38, px: 2, ml: 2,
                      bgcolor: isActive ? c.accentSoft : 'transparent',
                      color: isActive ? c.accent : c.textSecondary,
                      '&:hover': { bgcolor: c.bg, color: c.accent },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, mr: 2, color: isActive ? c.accent : c.textSecondary }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 12.5, fontWeight: isActive ? 600 : 400 }} />
                  </ListItemButton>
                );
              })}
            </Collapse>
          </Box>
        ))}
      </List>
      <Box sx={{ p: 2, borderTop: `1px solid ${c.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, p: 1.5, bgcolor: c.bg, borderRadius: 2 }}>
          <Avatar sx={{ bgcolor: c.accent, width: 36, height: 36, fontSize: 15, fontWeight: 600 }}>S</Avatar>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: c.textPrimary }}>
              {userProfile === 'admin' ? 'Administrador' : userProfile === 'resident' ? 'Condômino' : 'Colaborador'}
            </Typography>
          </Box>
        </Box>
        <Button
          fullWidth onClick={() => { logout(); navigate('/login'); }} startIcon={<ExitToApp />}
          sx={{ color: c.textSecondary, fontSize: 12, textTransform: 'none', borderRadius: 2, py: 1, '&:hover': { bgcolor: '#FEF2F2', color: c.error } }}
        >
          Sair
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: c.bg, minHeight: '100vh', pb: isMobile ? 7 : 0 }}>
      {!isMobile && (
        <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, borderRight: 'none' } }}>
          {drawerContent}
        </Drawer>
      )}
      {isMobile && (
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}>
          {drawerContent}
        </Drawer>
      )}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: c.paper, borderBottom: `1px solid ${c.divider}` }}>
          <Toolbar sx={{ minHeight: 56, px: 2 }}>
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} sx={{ mr: 1, color: c.accent }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography sx={{ flexGrow: 1, fontWeight: 600, fontSize: 15, color: c.textPrimary }}>CondoPro</Typography>
            <Chip
              label={userProfile === 'admin' ? 'Admin' : userProfile === 'resident' ? 'Condômino' : 'Colaborador'}
              size="small"
              sx={{ mr: 1, bgcolor: c.accentSoft, color: c.accent, fontWeight: 600, fontSize: 11 }}
            />
            <IconButton sx={{ color: c.textSecondary }} size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Badge badgeContent={notifications.total} color="error"><Notifications fontSize="small" /></Badge>
            </IconButton>
            <Popover
              open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              PaperProps={{ sx: { borderRadius: 3, mt: 1, border: `1px solid ${c.divider}`, boxShadow: 'none' } }}
            >
              <Box sx={{ p: 2.5, minWidth: 260 }}>
                <Typography variant="subtitle2" fontWeight={600} mb={2}>Notificações</Typography>
                <Box display="flex" alignItems="center" gap={1.5} py={1}>
                  <Inventory fontSize="small" sx={{ color: c.textSecondary }} />
                  <Typography variant="caption">{notifications.packages} encomenda(s) pendente(s)</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5} py={1}>
                  <Build fontSize="small" sx={{ color: c.textSecondary }} />
                  <Typography variant="caption">{notifications.maintenance} chamado(s) aberto(s)</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5} py={1}>
                  <Warning fontSize="small" sx={{ color: c.error }} />
                  <Typography variant="caption">{notifications.overdueExpenses} despesa(s) vencida(s)</Typography>
                </Box>
                {notifications.total === 0 && <Typography variant="caption" color="textSecondary">Nenhuma notificação</Typography>}
              </Box>
            </Popover>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: isMobile ? 1.5 : 2, flex: 1 }}><Outlet /></Box>
        {isMobile && (
          <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1200, borderTop: `1px solid ${c.divider}` }} elevation={0}>
            <BottomNavigation
              value={bottomTab}
              onChange={(_, v) => { if (v === 4) setMobileOpen(true); else { setBottomTab(v); navigate(mainMobileItems[v].path); } }}
              showLabels sx={{ height: 60 }}
            >
              {mainMobileItems.map((item, i) => (
                <BottomNavigationAction key={i} label={item.text} icon={item.icon} sx={{ '&.Mui-selected': { color: c.accent } }} />
              ))}
            </BottomNavigation>
          </Paper>
        )}
      </Box>
    </Box>
  );
}