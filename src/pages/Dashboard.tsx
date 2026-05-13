import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Typography, Card, CardContent, Grid, Box, Button, Skeleton } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#6c5ce7', '#00cec9', '#fdcb6e', '#e17055', '#74b9ff', '#e74c3c', '#2ecc71'];

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

  const expensesByCategory = expenses.reduce((acc: any, exp) => {
    const catName = exp.category?.name || 'Sem categoria';
    if (!acc[catName]) acc[catName] = 0;
    acc[catName] += exp.amount;
    return acc;
  }, {});

  const chartData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value: Number(value)
  }));

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'PENDING').length;
  const paidExpenses = expenses.filter(e => e.status === 'PAID').length;

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={32} />
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1,2,3,4].map(i => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: 18 }}>
          👋 {condominium?.name || 'Dashboard'}
        </Typography>
        <Button 
          variant="contained" 
          size="small" 
          onClick={() => navigate('/expenses')}
          sx={{ textTransform: 'none', borderRadius: 2, fontSize: 12 }}
        >
          + Nova Despesa
        </Button>
      </Box>
      
      {/* Cards compactos */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="textSecondary" sx={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                💰 Total Despesas
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18, mt: 0.5 }}>
                R$ {totalExpenses.toFixed(0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="textSecondary" sx={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                ⚠️ Pendentes
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18, mt: 0.5 }}>
                {pendingExpenses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="textSecondary" sx={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                ✅ Pagas
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18, mt: 0.5 }}>
                {paidExpenses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="textSecondary" sx={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                🏠 Unidades
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18, mt: 0.5 }}>
                {condominium?.units?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: 13 }}>
                📊 Despesas por Categoria
              </Typography>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                    <Legend 
                      wrapperStyle={{ fontSize: 11 }}
                      iconSize={8}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="caption" color="textSecondary" sx={{ py: 4, textAlign: 'center', display: 'block' }}>
                  Nenhuma despesa cadastrada
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: 13 }}>
                📋 Últimas Despesas
              </Typography>
              {expenses.slice(0, 6).map(exp => (
                <Box key={exp.id} sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  py: 0.8, 
                  borderBottom: '1px solid #f0f0f0',
                  '&:last-child': { borderBottom: 'none' }
                }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 12 }}>
                      {exp.description}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: 10 }}>
                      {exp.category?.name} • {new Date(exp.dueDate).toLocaleDateString('pt-BR')}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 12 }}>
                      R$ {exp.amount.toFixed(2)}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: 10,
                        color: exp.status === 'PAID' ? '#27ae60' : '#e74c3c',
                        fontWeight: 500
                      }}
                    >
                      {exp.status === 'PAID' ? '✅ Pago' : '⏳ Pendente'}
                    </Typography>
                  </Box>
                </Box>
              ))}
              {expenses.length === 0 && (
                <Typography variant="caption" color="textSecondary" sx={{ py: 3, textAlign: 'center', display: 'block' }}>
                  Nenhuma despesa registrada
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
