import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Typography, Card, CardContent, Grid, Box, Button, Chip, Avatar, Skeleton } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, AttachMoney, Warning, CheckCircle, Apartment } from '@mui/icons-material';

const COLORS = ['#00A896', '#028090', '#02C39A', '#F0A500', '#E63946'];

export default function Dashboard() {
  const [condominium, setCondominium] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [condRes, expRes] = await Promise.all([
        api.get('/condominium/me'),
        api.get('/expenses')
      ]);
      setCondominium(condRes.data);
      setExpenses(expRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'PENDING');
  const paidExpenses = expenses.filter(e => e.status === 'PAID');
  const overdueExpenses = expenses.filter(e => e.status === 'OVERDUE');

  // Dados para gráfico de pizza
  const expensesByCategory = expenses.reduce((acc: any, exp) => {
    const catName = exp.category?.name || 'Outros';
    if (!acc[catName]) acc[catName] = 0;
    acc[catName] += exp.amount;
    return acc;
  }, {});
  const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value: Number(value) }));

  // Dados para gráfico de linha (últimos 6 meses - simulado)
  const lineData = [
    { month: 'Jan', receitas: 12500, despesas: 8900 },
    { month: 'Fev', receitas: 12500, despesas: 9200 },
    { month: 'Mar', receitas: 12500, despesas: 8350 },
    { month: 'Abr', receitas: 12500, despesas: 9100 },
    { month: 'Mai', receitas: 12500, despesas: totalExpenses },
    { month: 'Jun', receitas: 12500, despesas: null },
  ];

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={40} />
        <Grid container spacing={2} sx={{ mb: 3, mt: 1 }}>
          {[1,2,3,4].map(i => (
            <Grid item xs={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontSize: { xs: 18, md: 22 } }}>
            👋 Bem-vindo, {condominium?.name || 'Síndico'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Resumo financeiro • Maio 2026
          </Typography>
        </Box>
        <Button variant="contained" size="small" onClick={() => navigate('/expenses')} sx={{ borderRadius: 3 }}>
          + Nova Despesa
        </Button>
      </Box>

      {/* KPIs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card sx={{ bgcolor: '#00A896', color: 'white', borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8, fontSize: 11 }}>TOTAL DESPESAS</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>R$ {totalExpenses.toFixed(0)}</Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 32, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: 11 }}>PENDENTES</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: '#F0A500' }}>{pendingExpenses.length}</Typography>
                </Box>
                <Warning sx={{ fontSize: 32, color: '#F0A500', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: 11 }}>PAGAS</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: '#02C39A' }}>{paidExpenses.length}</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 32, color: '#02C39A', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: 11 }}>UNIDADES</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>{condominium?.units?.length || 0}</Typography>
                </Box>
                <Apartment sx={{ fontSize: 32, color: '#028090', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Fluxo de Caixa */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, p: 1 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontSize: 15 }}>📈 Fluxo de Caixa</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v/1000}k`} />
                  <Tooltip formatter={(value: number) => `R$ ${value?.toFixed(2)}`} />
                  <Line type="monotone" dataKey="receitas" stroke="#02C39A" strokeWidth={3} dot={false} name="Receitas" />
                  <Line type="monotone" dataKey="despesas" stroke="#E63946" strokeWidth={3} dot={false} name="Despesas" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Despesas por Categoria */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontSize: 15 }}>📊 Despesas por Categoria</Typography>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}><Typography color="textSecondary">Sem dados</Typography></Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alertas e Últimas Despesas */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontSize: 15 }}>⚠️ Alertas</Typography>
              {overdueExpenses.length > 0 && (
                <Box sx={{ bgcolor: '#FFF5F5', p: 2, borderRadius: 2, mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#E63946', fontWeight: 600 }}>
                    {overdueExpenses.length} despesa(s) vencida(s)
                  </Typography>
                </Box>
              )}
              {pendingExpenses.length > 0 && (
                <Box sx={{ bgcolor: '#FFFBF0', p: 2, borderRadius: 2, mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#F0A500', fontWeight: 600 }}>
                    {pendingExpenses.length} despesa(s) pendente(s)
                  </Typography>
                </Box>
              )}
              {overdueExpenses.length === 0 && pendingExpenses.length === 0 && (
                <Typography variant="body2" color="textSecondary">✅ Tudo em dia!</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontSize: 15 }}>📋 Últimas Despesas</Typography>
              {expenses.slice(0, 4).map(exp => (
                <Box key={exp.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.2, borderBottom: '1px solid #F0F0F0', '&:last-child': { borderBottom: 'none' } }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>{exp.description}</Typography>
                    <Typography variant="caption" color="textSecondary">{exp.category?.name} • {new Date(exp.dueDate).toLocaleDateString('pt-BR')}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 13 }}>R$ {exp.amount.toFixed(2)}</Typography>
                    <Chip label={exp.status === 'PAID' ? 'Pago' : 'Pendente'} size="small" color={exp.status === 'PAID' ? 'success' : 'warning'} sx={{ fontSize: 10, height: 20 }} />
                  </Box>
                </Box>
              ))}
              {expenses.length === 0 && <Typography variant="body2" color="textSecondary">Nenhuma despesa</Typography>}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
