import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import KpiCard from '../components/KpiCard';
import { 
  Typography, Card, CardContent, Grid, Box, Button, Chip, Skeleton,
  LinearProgress, CircularProgress, Alert
} from '@mui/material';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, BarChart, Bar, Legend
} from 'recharts';
import { AttachMoney, Warning, CheckCircle, Apartment, TrendingDown, Build, People, EmojiEvents, Visibility } from '@mui/icons-material';

const COLORS = ['#00A896', '#028090', '#02C39A', '#F0A500', '#E63946', '#6C5CE7'];

export default function Dashboard() {
  const [condominium, setCondominium] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [condoScore, setCondoScore] = useState<any>(null);
  const [predictions, setPredictions] = useState<any>(null);
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
      const [condRes, expRes, scoreRes, predRes] = await Promise.all([
        api.get('/condominium/me'),
        api.get('/expenses'),
        api.get('/condoscore'),
        api.get('/condoai/predictions')
      ]);
      setCondominium(condRes.data);
      setExpenses(expRes.data);
      setCondoScore(scoreRes.data);
      setPredictions(predRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'PENDING');
  const paidExpenses = expenses.filter(e => e.status === 'PAID');

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

      {/* 🏆 CONDO SCORE */}
      {condoScore && (
        <Card sx={{ mb: 3, borderRadius: 3, bgcolor: '#FFFFFF', border: `2px solid ${condoScore.color}` }}>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress variant="determinate" value={condoScore.score} size={140} thickness={8} sx={{ color: condoScore.color }} />
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: condoScore.color }}>{condoScore.score}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: condoScore.color }}>de 100</Typography>
                  </Box>
                </Box>
                <Typography variant="h6" sx={{ mt: 1, fontWeight: 700, color: condoScore.color }}>
                  {condoScore.emoji} {condoScore.category}
                </Typography>
              </Grid>
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <EmojiEvents sx={{ color: condoScore.color }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>CondoScore™</Typography>
                  <Chip icon={<Visibility />} label="Visível para todos" size="small" color="info" variant="outlined" sx={{ ml: 'auto' }} />
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">💰 Financeiro</Typography>
                    <LinearProgress variant="determinate" value={condoScore.details.financeiro} sx={{ height: 8, borderRadius: 4, mb: 1 }} />
                    <Typography variant="caption">{condoScore.details.financeiro}/40</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">🔧 Manutenção</Typography>
                    <LinearProgress variant="determinate" value={condoScore.details.manutencao} sx={{ height: 8, borderRadius: 4, mb: 1 }} />
                    <Typography variant="caption">{condoScore.details.manutencao}/25</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">👥 Participação</Typography>
                    <LinearProgress variant="determinate" value={condoScore.details.social} sx={{ height: 8, borderRadius: 4, mb: 1 }} />
                    <Typography variant="caption">{condoScore.details.social}/20</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">⚖️ Compliance</Typography>
                    <LinearProgress variant="determinate" value={condoScore.details.compliance} sx={{ height: 8, borderRadius: 4, mb: 1 }} />
                    <Typography variant="caption">{condoScore.details.compliance}/15</Typography>
                  </Grid>
                </Grid>
                {condoScore.recommendations?.map((rec: string, i: number) => (
                  <Typography key={i} variant="caption" sx={{ display: 'block', mt: 1, color: '#374151' }}>💡 {rec}</Typography>
                ))}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* 🧠 IA PREDITIVA */}
      {predictions && (
        <Card sx={{ mb: 3, borderRadius: 3, bgcolor: predictions.riskLevel === 'high' ? '#FFF5F5' : '#F0FDF9' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>🧠 Previsão de Gastos (IA)</Typography>
            <Typography variant="body2" mb={2}>{predictions.summary}</Typography>
            <Grid container spacing={2}>
              {predictions.predictions?.map((p: any, i: number) => (
                <Grid item xs={6} md={3} key={i}>
                  <Card sx={{ borderRadius: 2, bgcolor: 'white' }}>
                    <CardContent>
                      <Typography variant="caption" color="textSecondary">{p.category}</Typography>
                      <Typography variant="h6" fontWeight={700}>R$ {p.nextMonth?.toFixed(0)}</Typography>
                      <Chip label={p.alert} size="small" color={p.trend === 'up' ? 'warning' : 'success'} sx={{ mt: 1 }} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {predictions.totalPredicted > 0 && (
              <Alert severity={predictions.riskLevel === 'high' ? 'warning' : 'info'} sx={{ mt: 2 }}>
                📊 Previsão total para o próximo mês: <strong>R$ {predictions.totalPredicted.toFixed(2)}</strong>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}><KpiCard title="Saldo" value="R$ 4.150" trend={12} icon={<AttachMoney sx={{ color: '#00A896' }} />} color="#00A896" subtitle="Disponível" /></Grid>
        <Grid item xs={6} md={3}><KpiCard title="Pendentes" value={pendingExpenses.length} icon={<Warning sx={{ color: '#F0A500' }} />} color="#F0A500" subtitle="A pagar" /></Grid>
        <Grid item xs={6} md={3}><KpiCard title="Pagas" value={paidExpenses.length} icon={<CheckCircle sx={{ color: '#02C39A' }} />} color="#02C39A" subtitle="Este mês" /></Grid>
        <Grid item xs={6} md={3}><KpiCard title="Unidades" value={condominium?.units?.length || 0} icon={<Apartment sx={{ color: '#6C5CE7' }} />} color="#6C5CE7" subtitle="Total" /></Grid>
      </Grid>

      {/* Transparência */}
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Visibility sx={{ color: '#00A896' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>📢 Transparência</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" fontWeight={600}>💰 Total de Despesas:</Typography>
              <Typography variant="h6" color="primary">R$ {totalExpenses.toFixed(2)}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" fontWeight={600}>✅ Despesas Pagas:</Typography>
              <Typography variant="h6" color="success.main">{paidExpenses.length} de {expenses.length}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Últimas Despesas */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontSize: 15, fontWeight: 600 }}>📋 Últimas Despesas</Typography>
          {expenses.slice(0, 5).map(exp => (
            <Box key={exp.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.2, borderBottom: '1px solid #F0F0F0' }}>
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
        </CardContent>
      </Card>
    </Box>
  );
}
