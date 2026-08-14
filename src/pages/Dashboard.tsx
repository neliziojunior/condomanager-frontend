import { useState, useEffect, useMemo, memo } from 'react';
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

// ---------------------------------------------------------------------------
// Paleta única: neutros (cinza) + 1 cor de destaque (accent).
// Cores semânticas (verde/amarelo/vermelho) ficam restritas a status, não decoração.
// ---------------------------------------------------------------------------
const colors = {
  bg: '#FFFFFF',
  border: '#E5E7EB',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  accent: '#2563EB',      // única cor "viva" do sistema
  accentSoft: '#EFF6FF',
  track: '#F3F4F6',
};

interface Expense {
  id: string | number;
  description: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  category?: { name: string };
}

// ---------------------------------------------------------------------------
// Subcomponentes memoizados: evitam re-render desnecessário do card inteiro
// quando o estado do Dashboard muda por outro motivo (ex: loading de outra parte)
// ---------------------------------------------------------------------------

const StatCard = memo(function StatCard({
  icon, label, value, caption, children,
}: {
  icon: React.ReactNode; label: string; value: string; caption: string; children?: React.ReactNode;
}) {
  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: 2, p: 2.5, borderColor: colors.border, boxShadow: 'none' }}
    >
      <Box sx={{ color: colors.textSecondary, mb: 1 }}>{icon}</Box>
      <Typography variant="overline" fontWeight={600} color={colors.textSecondary} display="block">
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={700} color={colors.textPrimary}>
        {value}
      </Typography>
      <Typography variant="caption" color={colors.textSecondary}>{caption}</Typography>
      {children}
    </Card>
  );
});

const CategoryRow = memo(function CategoryRow({
  category, amount, percent,
}: { category: string; amount: number; percent: number }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" fontSize={13} color={colors.textPrimary}>{category}</Typography>
        <Typography variant="body2" fontWeight={600} fontSize={13} color={colors.textPrimary}>
          R$ {amount.toFixed(0)}
        </Typography>
      </Box>
      <Box sx={{ bgcolor: colors.track, borderRadius: 2, height: 6, overflow: 'hidden' }}>
        <Box sx={{
          bgcolor: colors.accent, height: '100%', borderRadius: 2,
          width: `${percent}%`, transition: 'width 0.4s ease',
        }} />
      </Box>
    </Box>
  );
});

const ExpenseRow = memo(function ExpenseRow({ expense }: { expense: Expense }) {
  return (
    <Box sx={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      py: 1.25, borderBottom: `1px solid ${colors.track}`,
      '&:last-of-type': { borderBottom: 'none' },
    }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={500} fontSize={13} noWrap color={colors.textPrimary}>
          {expense.description}
        </Typography>
        <Typography variant="caption" color={colors.textSecondary}>
          {new Date(expense.dueDate).toLocaleDateString('pt-BR')}
        </Typography>
      </Box>
      <Typography variant="body2" fontWeight={700} fontSize={13} sx={{ ml: 2 }} color={colors.textPrimary}>
        R$ {expense.amount.toFixed(2)}
      </Typography>
    </Box>
  );
});

export default function Dashboard() {
  const [condominium, setCondominium] = useState<any>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [condoScore, setCondoScore] = useState<any>(null);
  const [predictions, setPredictions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        api.get('/condoai/predictions').catch(() => ({ data: null })),
      ]);
      setExpenses(expRes.data);
      setCondoScore(scoreRes.data);
      setPredictions(predRes.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------------------
  // Antes: totalExpenses, byCategory etc. eram recalculados a CADA render.
  // Com useMemo, só recalculam quando `expenses` muda de fato.
  // ---------------------------------------------------------------------
  const { totalExpenses, pendingExpenses, paidExpenses, byCategory, maxCategory } = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const pending = expenses.filter(e => e.status === 'PENDING').length;
    const paid = expenses.filter(e => e.status === 'PAID').length;
    const cat = expenses.reduce((acc: Record<string, number>, exp) => {
      const key = exp.category?.name || 'Outros';
      acc[key] = (acc[key] || 0) + exp.amount;
      return acc;
    }, {});
    const max = Math.max(...Object.values(cat), 1);
    return { totalExpenses: total, pendingExpenses: pending, paidExpenses: paid, byCategory: cat, maxCategory: max };
  }, [expenses]);

  const recentExpenses = useMemo(() => expenses.slice(0, 5), [expenses]);

  if (loading) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        <Grid container spacing={2}>
          {[1, 2, 3].map(i => (
            <Grid item xs={12} sm={4} key={i}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (!condominium) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" fontWeight={700} color={colors.textPrimary} gutterBottom>
          Bem-vindo ao CondoPro
        </Typography>
        <Button
          variant="contained" size="large" startIcon={<Add />}
          onClick={() => navigate('/setup')}
          sx={{ borderRadius: 2, bgcolor: colors.accent, boxShadow: 'none', textTransform: 'none' }}
        >
          Cadastrar Condomínio
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>

      {/* Cabeçalho */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} fontSize={{ xs: 18, md: 22 }} color={colors.textPrimary}>
          {condominium?.name}
        </Typography>
        <Typography variant="body2" color={colors.textSecondary}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
        </Typography>
      </Box>

      {/* Cards de resumo */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={<AttachMoney />}
            label="DESPESAS"
            value={`R$ ${totalExpenses.toFixed(0)}`}
            caption="este mês"
          >
            <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
              <Chip label={`${paidExpenses} pagas`} size="small" color="success" variant="outlined" />
              <Chip label={`${pendingExpenses} pendentes`} size="small" color="warning" variant="outlined" />
            </Box>
          </StatCard>
        </Grid>

        <Grid item xs={12} sm={4}>
          <StatCard
            icon={<TrendingUp />}
            label="PREVISÃO IA"
            value={predictions?.totalPredicted ? `R$ ${predictions.totalPredicted.toFixed(0)}` : '---'}
            caption="estimativa para o próximo mês"
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <StatCard
            icon={<Assessment />}
            label="STATUS"
            value={condoScore ? `${condoScore.score}%` : '--'}
            caption="saúde financeira"
          >
            <LinearProgress
              variant="determinate"
              value={condoScore?.score || 0}
              sx={{ mt: 1, height: 4, borderRadius: 2, bgcolor: colors.track }}
              color={condoScore?.score >= 70 ? 'success' : condoScore?.score >= 50 ? 'warning' : 'error'}
            />
          </StatCard>
        </Grid>
      </Grid>

      {/* Despesas por categoria */}
      <Card variant="outlined" sx={{ borderRadius: 2, mb: 3, borderColor: colors.border, boxShadow: 'none' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="overline" fontWeight={600} color={colors.textSecondary} mb={2} display="block">
            DESPESAS POR CATEGORIA
          </Typography>
          {Object.keys(byCategory).length > 0 ? (
            Object.entries(byCategory).map(([cat, amount]) => (
              <CategoryRow
                key={cat}
                category={cat}
                amount={amount as number}
                percent={((amount as number) / maxCategory) * 100}
              />
            ))
          ) : (
            <Typography variant="body2" color={colors.textSecondary} textAlign="center" py={3}>
              Nenhuma despesa cadastrada
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Últimas despesas */}
      <Card variant="outlined" sx={{ borderRadius: 2, mb: 3, borderColor: colors.border, boxShadow: 'none' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="overline" fontWeight={600} color={colors.textSecondary}>
              ÚLTIMAS DESPESAS
            </Typography>
            <Button
              size="small" onClick={() => navigate('/expenses')}
              sx={{ fontSize: 12, textTransform: 'none', color: colors.accent }}
            >
              Ver todas →
            </Button>
          </Box>
          {recentExpenses.map(exp => (
            <ExpenseRow key={exp.id} expense={exp} />
          ))}
        </CardContent>
      </Card>

      {/* Ações */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <Button
          variant="contained" startIcon={<Add />} onClick={() => navigate('/expenses')}
          sx={{ borderRadius: 2, bgcolor: colors.accent, boxShadow: 'none', textTransform: 'none' }}
        >
          Nova Despesa
        </Button>
        <Button
          variant="outlined" startIcon={<Description />} onClick={() => navigate('/assemblies')}
          sx={{ borderRadius: 2, borderColor: colors.border, color: colors.textPrimary, textTransform: 'none' }}
        >
          Nova Ata
        </Button>
        <Button
          variant="text" startIcon={<ExitToApp />} onClick={() => { logout(); navigate('/login'); }}
          sx={{ borderRadius: 2, color: colors.textSecondary, textTransform: 'none' }}
        >
          Sair
        </Button>
      </Box>

    </Box>
  );
}