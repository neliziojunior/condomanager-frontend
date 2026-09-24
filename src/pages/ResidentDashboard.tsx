import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
  Typography, Card, CardContent, Grid, Box, Skeleton, Button,
  CircularProgress, LinearProgress, Chip, Divider
} from '@mui/material';
import {
  TrendingDown, Visibility, AccountBalance, CheckCircle, Warning
} from '@mui/icons-material';

const colors = {
  bg: '#F7F9FC',
  border: '#E5E7EB',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  accent: '#00A896',
  track: '#F3F4F6',
};

export default function ResidentDashboard() {
  const [condominium, setCondominium] = useState<any>(null);
  const [condoScore, setCondoScore] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
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

      const [scoreRes, expRes] = await Promise.all([
        api.get('/condoscore').catch(() => ({ data: null })),
        api.get('/expenses').catch(() => ({ data: [] })),
      ]);
      setCondoScore(scoreRes.data);
      setExpenses(expRes.data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const paidExpenses = expenses.filter(e => e.status === 'PAID').length;
  const pendingExpenses = expenses.filter(e => e.status === 'PENDING').length;
  const overdueExpenses = expenses.filter(e => e.status === 'OVERDUE').length;

  if (loading) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Skeleton variant="text" width={300} height={40} />
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3, mt: 2 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>

      {/* Cabeçalho */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color={colors.textPrimary}>
          🏢 {condominium?.name}
        </Typography>
        <Typography variant="body2" color={colors.textSecondary}>
          Transparência Financeira • {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </Typography>
      </Box>

      {/* 🏆 CONDO SCORE */}
      {condoScore && (
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            mb: 3,
            borderColor: condoScore.color,
            borderWidth: 2,
            boxShadow: 'none',
            p: 2,
          }}
        >
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Chip
              icon={<Visibility />}
              label="ÍNDICE DE SAÚDE DO CONDOMÍNIO"
              size="small"
              sx={{
                mb: 3,
                bgcolor: '#F0FDF9',
                color: colors.accent,
                fontWeight: 600,
                fontSize: 11,
              }}
            />

            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
              <CircularProgress
                variant="determinate"
                value={condoScore.score}
                size={160}
                thickness={6}
                sx={{ color: condoScore.color }}
              />
              <Box sx={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}>
                <Typography variant="h3" fontWeight={800} color={condoScore.color}>
                  {condoScore.score}
                </Typography>
                <Typography variant="caption" color={colors.textSecondary}>
                  de 100
                </Typography>
              </Box>
            </Box>

            <Typography variant="h5" fontWeight={700} color={condoScore.color} gutterBottom>
              {condoScore.emoji} {condoScore.category}
            </Typography>

            <Typography variant="body2" color={colors.textSecondary} sx={{ mt: 1, maxWidth: 500, mx: 'auto' }}>
              Este índice mostra a saúde geral do condomínio, baseado em finanças,
              manutenção, participação e compliance.
            </Typography>

            <Box sx={{ mt: 3, textAlign: 'left', maxWidth: 500, mx: 'auto' }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="overline" fontWeight={600} color={colors.textSecondary}>
                DETALHES DO ÍNDICE
              </Typography>

              {Object.entries(condoScore.details).map(([key, val]: any) => (
                <Box key={key} sx={{ mt: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" fontSize={13} color={colors.textPrimary}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Typography>
                    <Typography variant="body2" fontSize={13} fontWeight={600}>
                      {val}/40
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={val}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: colors.track,
                      '& .MuiLinearProgress-bar': { borderRadius: 3 },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 💰 Transparência Financeira */}
      <Card
        variant="outlined"
        sx={{ borderRadius: 3, mb: 3, borderColor: colors.border, boxShadow: 'none' }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Visibility sx={{ color: colors.accent }} />
            <Typography variant="h6" fontWeight={600} color={colors.textPrimary}>
              Como o dinheiro está sendo usado
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ bgcolor: '#F0FDF9', p: 2, borderRadius: 2, textAlign: 'center' }}>
                <AccountBalance sx={{ color: colors.accent, mb: 1 }} />
                <Typography variant="caption" color={colors.textSecondary}>TOTAL DE DESPESAS</Typography>
                <Typography variant="h6" fontWeight={700} color={colors.accent}>
                  R$ {totalExpenses.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ bgcolor: '#F0FDF9', p: 2, borderRadius: 2, textAlign: 'center' }}>
                <CheckCircle sx={{ color: '#02C39A', mb: 1 }} />
                <Typography variant="caption" color={colors.textSecondary}>PAGAS</Typography>
                <Typography variant="h6" fontWeight={700} color="#02C39A">
                  {paidExpenses}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ bgcolor: '#FFFBF0', p: 2, borderRadius: 2, textAlign: 'center' }}>
                <Warning sx={{ color: '#F0A500', mb: 1 }} />
                <Typography variant="caption" color={colors.textSecondary}>PENDENTES</Typography>
                <Typography variant="h6" fontWeight={700} color="#F0A500">
                  {pendingExpenses}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ bgcolor: '#FFF5F5', p: 2, borderRadius: 2, textAlign: 'center' }}>
                <TrendingDown sx={{ color: '#E63946', mb: 1 }} />
                <Typography variant="caption" color={colors.textSecondary}>VENCIDAS</Typography>
                <Typography variant="h6" fontWeight={700} color="#E63946">
                  {overdueExpenses}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Typography variant="caption" color={colors.textSecondary} display="block" textAlign="center">
            💡 Este painel é atualizado automaticamente. Para ver detalhes completos,
            acesse a aba <strong>Transparência</strong> no menu.
          </Typography>
        </CardContent>
      </Card>

      {/* Ações rápidas */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={() => navigate('/transparency')}
          sx={{
            borderRadius: 2,
            bgcolor: colors.accent,
            boxShadow: 'none',
            textTransform: 'none',
          }}
        >
          Ver Transparência Completa →
        </Button>
        <Button
          variant="text"
          onClick={() => { logout(); navigate('/login'); }}
          sx={{ borderRadius: 2, color: colors.textSecondary, textTransform: 'none' }}
        >
          Sair
        </Button>
      </Box>

    </Box>
  );
}
