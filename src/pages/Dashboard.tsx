import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import KpiCard from '../components/KpiCard';
import { 
  Typography, Card, CardContent, Grid, Box, Button, Chip, Skeleton,
  LinearProgress, Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, BarChart, Bar, Legend
} from 'recharts';
import { 
  AttachMoney, Warning, CheckCircle, Apartment, TrendingDown,
  Build, People
} from '@mui/icons-material';

const COLORS = ['#00A896', '#028090', '#02C39A', '#F0A500', '#E63946', '#6C5CE7'];

export default function Dashboard() {
  const [condominium, setCondominium] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'executive' | 'tactical' | 'operational'>('executive');
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

  const expensesByCategory = expenses.reduce((acc: any, exp) => {
    const catName = exp.category?.name || 'Outros';
    acc[catName] = (acc[catName] || 0) + exp.amount;
    return acc;
  }, {});
  const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value: Number(value) }));

  const barData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name: name.substring(0, 10),
    valor: Number(value),
    orcamento: Number(value) * (0.8 + Math.random() * 0.4),
  }));

  const lineData = [
    { month: 'Jan', receitas: 12500, despesas: 8900 },
    { month: 'Fev', receitas: 12500, despesas: 9200 },
    { month: 'Mar', receitas: 12500, despesas: 8350 },
    { month: 'Abr', receitas: 12500, despesas: 9100 },
    { month: 'Mai', receitas: 12500, despesas: totalExpenses },
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
      {/* Cabeçalho com alternador de visão */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontSize: { xs: 18, md: 22 }, fontWeight: 700 }}>
            👋 {condominium?.name || 'Dashboard'}
          </Typography>
          <Typography variant="body2" color="textSecondary">Visão {view === 'executive' ? 'Executiva' : view === 'tactical' ? 'Tática' : 'Operacional'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip label="📊 Executiva" onClick={() => setView('executive')} color={view === 'executive' ? 'primary' : 'default'} variant={view === 'executive' ? 'filled' : 'outlined'} size="small" sx={{ borderRadius: 2 }} />
          <Chip label="📈 Tática" onClick={() => setView('tactical')} color={view === 'tactical' ? 'primary' : 'default'} variant={view === 'tactical' ? 'filled' : 'outlined'} size="small" sx={{ borderRadius: 2 }} />
          <Chip label="🔧 Operacional" onClick={() => setView('operational')} color={view === 'operational' ? 'primary' : 'default'} variant={view === 'operational' ? 'filled' : 'outlined'} size="small" sx={{ borderRadius: 2 }} />
        </Box>
      </Box>

      {/* CAMADA EXECUTIVA - KPIs */}
      {view === 'executive' && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} md={3}>
              <KpiCard title="Saldo em Caixa" value="R$ 4.150" trend={12} icon={<AttachMoney sx={{ color: '#00A896' }} />} color="#00A896" subtitle="Saldo disponível" />
            </Grid>
            <Grid item xs={6} md={3}>
              <KpiCard title="Inadimplência" value="4,2%" trend={-2} icon={<TrendingDown sx={{ color: '#02C39A' }} />} color="#02C39A" subtitle="Meta: abaixo de 5%" />
            </Grid>
            <Grid item xs={6} md={3}>
              <KpiCard title="Chamados Abertos" value={3} trend={-1} icon={<Warning sx={{ color: '#F0A500' }} />} color="#F0A500" subtitle="Resolução: 85%" />
            </Grid>
            <Grid item xs={6} md={3}>
              <KpiCard title="Satisfação (NPS)" value="78" trend={5} icon={<People sx={{ color: '#6C5CE7' }} />} color="#6C5CE7" subtitle="Zona de qualidade" />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontSize: 15, fontWeight: 600 }}>📈 Fluxo de Caixa Projetado</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v/1000}k`} />
                      <Tooltip formatter={(value: number) => `R$ ${value?.toFixed(2)}`} />
                      <Legend />
                      <Line type="monotone" dataKey="receitas" stroke="#00A896" strokeWidth={3} dot={false} name="Receitas" />
                      <Line type="monotone" dataKey="despesas" stroke="#E63946" strokeWidth={3} dot={false} name="Despesas" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={5}>
              <Card sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontSize: 15, fontWeight: 600 }}>🎯 Saúde Financeira</Typography>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption">Inadimplência</Typography>
                      <Typography variant="caption" color="success.main">4.2% (Meta: 5%)</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={4.2} sx={{ height: 8, borderRadius: 4, bgcolor: '#F0F0F0', '& .MuiLinearProgress-bar': { bgcolor: '#02C39A', borderRadius: 4 } }} />
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption">Fundo de Reserva</Typography>
                      <Typography variant="caption">R$ 25.000 / R$ 30.000</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={83} sx={{ height: 8, borderRadius: 4, bgcolor: '#F0F0F0', '& .MuiLinearProgress-bar': { bgcolor: '#00A896', borderRadius: 4 } }} />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption">Resolução de Chamados</Typography>
                      <Typography variant="caption">85%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={85} sx={{ height: 8, borderRadius: 4, bgcolor: '#F0F0F0', '& .MuiLinearProgress-bar': { bgcolor: '#6C5CE7', borderRadius: 4 } }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* CAMADA TÁTICA */}
      {view === 'tactical' && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontSize: 15, fontWeight: 600 }}>📊 Orçado vs Realizado</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `R$${v}`} />
                    <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="orcamento" fill="#00A896" name="Orçado" radius={[4,4,0,0]} />
                    <Bar dataKey="valor" fill="#E63946" name="Realizado" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontSize: 15, fontWeight: 600 }}>📋 Despesas por Categoria</Typography>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 8 }}><Typography color="textSecondary">Sem dados</Typography></Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* CAMADA OPERACIONAL */}
      {view === 'operational' && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontSize: 15, fontWeight: 600 }}>🔧 Manutenções Pendentes</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Título</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Prioridade</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontSize: 12 }}>Elevador Bloco A</TableCell>
                      <TableCell><Chip label="Alta" size="small" color="error" sx={{ fontSize: 10 }} /></TableCell>
                      <TableCell><Chip label="Em andamento" size="small" color="warning" sx={{ fontSize: 10 }} /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontSize: 12 }}>Vazamento Ap 204</TableCell>
                      <TableCell><Chip label="Urgente" size="small" color="error" sx={{ fontSize: 10 }} /></TableCell>
                      <TableCell><Chip label="Aberto" size="small" color="error" sx={{ fontSize: 10 }} /></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontSize: 15, fontWeight: 600 }}>⚠️ Alertas do Mês</Typography>
                <Box sx={{ bgcolor: '#FFF5F5', p: 2, borderRadius: 2, mb: 1.5 }}>
                  <Typography variant="body2" sx={{ color: '#E63946', fontWeight: 600, fontSize: 12 }}>🔴 Consumo de água 15% acima da média</Typography>
                </Box>
                <Box sx={{ bgcolor: '#FFFBF0', p: 2, borderRadius: 2, mb: 1.5 }}>
                  <Typography variant="body2" sx={{ color: '#F0A500', fontWeight: 600, fontSize: 12 }}>🟡 AVCB vence em 60 dias</Typography>
                </Box>
                <Box sx={{ bgcolor: '#F0FDF9', p: 2, borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ color: '#00A896', fontWeight: 600, fontSize: 12 }}>🟢 Todas as inspeções em dia</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Últimas Despesas */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontSize: 15, fontWeight: 600 }}>📋 Últimas Despesas</Typography>
          {expenses.slice(0, 5).map(exp => (
            <Box key={exp.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.2, borderBottom: '1px solid #F0F0F0', '&:last-child': { borderBottom: 'none' } }}>
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
          {expenses.length === 0 && <Typography color="textSecondary">Nenhuma despesa</Typography>}
        </CardContent>
      </Card>
    </Box>
  );
}
