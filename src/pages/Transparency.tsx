import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  Typography, Card, CardContent, Grid, Box, Skeleton,
  LinearProgress, CircularProgress, Chip, Table, TableBody, 
  TableCell, TableHead, TableRow
} from '@mui/material';
import { 
  Visibility, AttachMoney, CheckCircle, Warning, 
  EmojiEvents, TrendingDown
} from '@mui/icons-material';

export default function Transparency() {
  const [condominium, setCondominium] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [condoScore, setCondoScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [condRes, expRes, scoreRes] = await Promise.all([
        api.get('/condominium/me'),
        api.get('/expenses'),
        api.get('/condoscore').catch(() => ({ data: null }))
      ]);
      setCondominium(condRes.data);
      setExpenses(expRes.data);
      setCondoScore(scoreRes.data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const paidExpenses = expenses.filter(e => e.status === 'PAID');
  const pendingExpenses = expenses.filter(e => e.status === 'PENDING');
  const overdueExpenses = expenses.filter(e => e.status === 'OVERDUE');

  const byCategory = expenses.reduce((acc: any, exp) => {
    const cat = exp.category?.name || 'Outros';
    if (!acc[cat]) acc[cat] = { total: 0, count: 0, paid: 0 };
    acc[cat].total += exp.amount;
    acc[cat].count++;
    if (exp.status === 'PAID') acc[cat].paid++;
    return acc;
  }, {});

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={40} />
        <Grid container spacing={2}>
          {[1,2,3,4].map(i => (
            <Grid item xs={12} sm={6} key={i}><Skeleton variant="rectangular" height={150} sx={{ borderRadius: 3 }} /></Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Visibility sx={{ color: '#00A896', fontSize: 30 }} />
          <Typography variant="h5" fontWeight={700}>Transparência Financeira</Typography>
        </Box>
        <Typography variant="body2" color="textSecondary">
          Acompanhe como o dinheiro do condomínio está sendo utilizado
        </Typography>
      </Box>

      {condoScore && (
        <Card sx={{ mb: 3, borderRadius: 3, border: `2px solid ${condoScore.color}` }}>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                <CircularProgress variant="determinate" value={condoScore.score} size={120} thickness={6} sx={{ color: condoScore.color }} />
                <Typography variant="h3" fontWeight={800} color={condoScore.color}>{condoScore.score}</Typography>
                <Typography variant="h6" fontWeight={700} color={condoScore.color}>{condoScore.emoji} {condoScore.category}</Typography>
                <Chip label="CondoScore™" size="small" color="info" sx={{ mt: 1 }} />
              </Grid>
              <Grid item xs={12} md={8}>
                <EmojiEvents sx={{ color: condoScore.color, mr: 1 }} />
                <Typography variant="h6" fontWeight={600} display="inline">Índice de Saúde do Condomínio</Typography>
                <Grid container spacing={2} mt={1}>
                  {Object.entries(condoScore.details).map(([key, val]: any) => (
                    <Grid item xs={6} key={key}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" fontWeight={600}>{key}</Typography>
                        <Typography variant="caption">{val}/40</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={val} sx={{ height: 8, borderRadius: 4 }} />
                    </Grid>
                  ))}
                </Grid>
                {condoScore.recommendations?.map((rec: string, i: number) => (
                  <Typography key={i} variant="caption" display="block" mt={1}>💡 {rec}</Typography>
                ))}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ borderRadius: 3, bgcolor: '#F0FDF9', textAlign: 'center', p: 2 }}>
            <AttachMoney sx={{ color: '#00A896', fontSize: 30 }} />
            <Typography variant="h5" fontWeight={700} color="#00A896">R$ {totalExpenses.toFixed(0)}</Typography>
            <Typography variant="caption">Total de Despesas</Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ borderRadius: 3, bgcolor: '#F0FDF9', textAlign: 'center', p: 2 }}>
            <CheckCircle sx={{ color: '#02C39A', fontSize: 30 }} />
            <Typography variant="h5" fontWeight={700} color="success.main">{paidExpenses.length}</Typography>
            <Typography variant="caption">Pagas</Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ borderRadius: 3, bgcolor: '#FFFBF0', textAlign: 'center', p: 2 }}>
            <Warning sx={{ color: '#F0A500', fontSize: 30 }} />
            <Typography variant="h5" fontWeight={700} color="warning.main">{pendingExpenses.length}</Typography>
            <Typography variant="caption">Pendentes</Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ borderRadius: 3, bgcolor: '#FFF5F5', textAlign: 'center', p: 2 }}>
            <TrendingDown sx={{ color: '#E63946', fontSize: 30 }} />
            <Typography variant="h5" fontWeight={700} color="error.main">{overdueExpenses.length}</Typography>
            <Typography variant="caption">Vencidas</Typography>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>📊 Despesas por Categoria</Typography>
          <Table size="small">
            <TableHead><TableRow><TableCell>Categoria</TableCell><TableCell align="center">Qtd</TableCell><TableCell align="center">Pagas</TableCell><TableCell align="right">Total</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
            <TableBody>
              {Object.entries(byCategory).map(([cat, data]: any) => (
                <TableRow key={cat}>
                  <TableCell><Typography variant="body2" fontWeight={600}>{cat}</Typography></TableCell>
                  <TableCell align="center">{data.count}</TableCell>
                  <TableCell align="center">{data.paid}</TableCell>
                  <TableCell align="right">R$ {data.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <LinearProgress variant="determinate" value={(data.paid / data.count) * 100} sx={{ height: 6, borderRadius: 3, width: 80 }} color={data.paid === data.count ? 'success' : 'warning'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>📋 Todas as Despesas</Typography>
          <Table size="small">
            <TableHead><TableRow><TableCell>Descrição</TableCell><TableCell>Categoria</TableCell><TableCell align="right">Valor</TableCell><TableCell>Vencimento</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
            <TableBody>
              {expenses.map(exp => (
                <TableRow key={exp.id}>
                  <TableCell><Typography variant="body2" fontWeight={600} fontSize={13}>{exp.description}</Typography></TableCell>
                  <TableCell>{exp.category?.name || '-'}</TableCell>
                  <TableCell align="right">R$ {exp.amount.toFixed(2)}</TableCell>
                  <TableCell>{new Date(exp.dueDate).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell><Chip label={exp.status === 'PAID' ? 'Pago' : exp.status === 'OVERDUE' ? 'Vencido' : 'Pendente'} size="small" color={exp.status === 'PAID' ? 'success' : exp.status === 'OVERDUE' ? 'error' : 'warning'} sx={{ fontSize: 10 }} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
