import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  Typography, Card, CardContent, Grid, Box, Chip, Skeleton,
  Button, LinearProgress
} from '@mui/material';
import { 
  AttachMoney, TrendingUp, Assessment, 
  Add, Description, ExitToApp
} from '@mui/icons-material';

export default function Dashboard() {
  const [condominium, setCondominium] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [condoScore, setCondoScore] = useState<any>(null);
  const [predictions, setPredictions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const condRes = await api.get('/condominium/me');
      if (!condRes.data) { setLoading(false); return; }
      setCondominium(condRes.data);
      const [expRes, scoreRes, predRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/condoscore').catch(() => ({ data: null })),
        api.get('/condoai/predictions').catch(() => ({ data: null }))
      ]);
      setExpenses(expRes.data);
      setCondoScore(scoreRes.data);
      setPredictions(predRes.data);
    } catch (error) { console.error('Erro:', error); }
    finally { setLoading(false); }
  }

  if (loading) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        <Grid container spacing={2}>
          {[1,2,3].map(i => (
            <Grid item xs={12} sm={4} key={i}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (!condominium) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>Bem-vindo ao CondoPro!</Typography>
        <Button variant="contained" size="large" startIcon={<Add />} onClick={() => navigate('/setup')} sx={{ borderRadius: 2, bgcolor: '#00A896' }}>
          Cadastrar Condomínio
        </Button>
      </Box>
    );
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'PENDING').length;
  const paidExpenses = expenses.filter(e => e.status === 'PAID').length;
  const overdueExpenses = expenses.filter(e => e.status === 'OVERDUE').length;

  const byCategory = expenses.reduce((acc: any, exp) => {
    const cat = exp.category?.name || 'Outros';
    if (!acc[cat]) acc[cat] = 0;
    acc[cat] += exp.amount;
    return acc;
  }, {});
  const maxCategory = Math.max(...Object.values(byCategory), 1);

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      
      {/* Cabeçalho */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} fontSize={{ xs: 18, md: 22 }}>
          🏢 {condominium?.name}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
        </Typography>
      </Box>

      {/* 3 Cards - Linha 1 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, p: 2.5, bgcolor: '#F0FDF9' }}>
            <AttachMoney sx={{ color: '#00A896', mb: 1 }} />
            <Typography variant="overline" fontWeight={600} color="textSecondary" display="block">
              DESPESAS
            </Typography>
            <Typography variant="h5" fontWeight={700} color="#00A896">
              R$ {totalExpenses.toFixed(0)}
            </Typography>
            <Typography variant="caption" color="textSecondary">este mês</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
              <Chip label={`${paidExpenses} pagas`} size="small" color="success" variant="outlined" />
              <Chip label={`${pendingExpenses} pendentes`} size="small" color="warning" variant="outlined" />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, p: 2.5, bgcolor: '#F5F0FF' }}>
            <TrendingUp sx={{ color: '#6C5CE7', mb: 1 }} />
            <Typography variant="overline" fontWeight={600} color="textSecondary" display="block">
              PREVISÃO IA
            </Typography>
            <Typography variant="h5" fontWeight={700} color="#6C5CE7">
              R$ {predictions?.totalPredicted?.toFixed(0) || '---'}
            </Typography>
            <Typography variant="caption" color="textSecondary">IA estima próximo mês</Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, p: 2.5, bgcolor: '#FFFBF0' }}>
            <Assessment sx={{ color: '#F0A500', mb: 1 }} />
            <Typography variant="overline" fontWeight={600} color="textSecondary" display="block">
              STATUS
            </Typography>
            <Typography variant="h5" fontWeight={700} color="warning.main">
              {condoScore ? `${condoScore.score}%` : '--'}
            </Typography>
            <Typography variant="caption" color="textSecondary">saúde financeira</Typography>
            <LinearProgress 
              variant="determinate" 
              value={condoScore?.score || 0} 
              sx={{ mt: 1, height: 4, borderRadius: 2 }}
              color={condoScore?.score >= 70 ? 'success' : condoScore?.score >= 50 ? 'warning' : 'error'}
            />
          </Card>
        </Grid>
      </Grid>

      {/* 📊 Gráfico de Barras - Linha 2 */}
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="overline" fontWeight={600} color="textSecondary" mb={2} display="block">
            📊 DESPESAS POR CATEGORIA
          </Typography>
          {Object.entries(byCategory).length > 0 ? (
            Object.entries(byCategory).map(([cat, amount]: any) => (
              <Box key={cat} sx={{ mb: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" fontSize={13}>{cat}</Typography>
                  <Typography variant="body2" fontWeight={600} fontSize={13}>R$ {amount.toFixed(0)}</Typography>
                </Box>
                <Box sx={{ bgcolor: '#F0F0F0', borderRadius: 2, height: 8, overflow: 'hidden' }}>
                  <Box sx={{ 
                    bgcolor: '#00A896', height: '100%', borderRadius: 2,
                    width: `${(amount / maxCategory) * 100}%`,
                    transition: 'width 0.5s ease'
                  }} />
                </Box>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary" textAlign="center" py={3}>
              Nenhuma despesa cadastrada
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* 📋 Últimas Despesas - Linha 3 */}
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="overline" fontWeight={600} color="textSecondary">
              📋 ÚLTIMAS DESPESAS
            </Typography>
            <Button size="small" onClick={() => navigate('/expenses')} sx={{ fontSize: 11 }}>
              Ver todas →
            </Button>
          </Box>
          {expenses.slice(0, 5).map(exp => (
            <Box key={exp.id} sx={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
              py: 1, borderBottom: '1px solid #F5F5F5',
              '&:last-child': { borderBottom: 'none' }
            }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={500} fontSize={13}>
                  {exp.description}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {new Date(exp.dueDate).toLocaleDateString('pt-BR')}
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight={700} fontSize={13} sx={{ ml: 2 }}>
                R$ {exp.amount.toFixed(2)}
              </Typography>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Botões de Ação - Linha 4 */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/expenses')} sx={{ borderRadius: 2, bgcolor: '#00A896' }}>
          Nova Despesa
        </Button>
        <Button variant="outlined" startIcon={<Description />} onClick={() => navigate('/assemblies')} sx={{ borderRadius: 2 }}>
          Nova Ata
        </Button>
        <Button variant="text" startIcon={<ExitToApp />} onClick={() => { logout(); navigate('/login'); }} sx={{ borderRadius: 2, color: '#6B7280' }}>
          Sair
        </Button>
      </Box>

    </Box>
  );
}
