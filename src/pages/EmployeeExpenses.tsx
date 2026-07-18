import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { 
  Typography, Card, CardContent, Grid, TextField, Button, Select, MenuItem, 
  Table, TableBody, TableCell, TableHead, TableRow, Box, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, InputAdornment
} from '@mui/material';
import { Search, Edit, Delete, Add, Badge } from '@mui/icons-material';

export default function EmployeeExpenses() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filterCategory, setFilterCategory] = useState('Funcionários');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [condRes, expRes] = await Promise.all([
      api.get('/condominium/me'),
      api.get('/expenses')
    ]);
    const allCategories = condRes.data.categories.filter((c: any) => c.type === 'EXPENSE');
    setCategories(allCategories);
    
    // Filtrar apenas despesas de funcionários
    const funcCategory = allCategories.find((c: any) => c.name === 'Funcionários');
    const filtered = funcCategory 
      ? expRes.data.filter((e: any) => e.categoryId === funcCategory.id)
      : [];
    setExpenses(filtered);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { description, amount: Number(amount), dueDate, categoryId: categoryId || getFuncCategoryId(), notes };
    
    try {
      if (editingId) {
        await api.put(`/expenses/${editingId}`, payload);
        setSnackbar({ open: true, message: 'Atualizado!', severity: 'success' });
      } else {
        await api.post('/expenses', payload);
        setSnackbar({ open: true, message: 'Criado!', severity: 'success' });
      }
      setShowForm(false); setEditingId(null);
      setDescription(''); setAmount(''); setDueDate(''); setNotes('');
      loadData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao salvar', severity: 'error' });
    }
  }

  function getFuncCategoryId() {
    return categories.find(c => c.name === 'Funcionários')?.id || '';
  }

  function openEdit(exp: any) {
    setEditingId(exp.id);
    setDescription(exp.description);
    setAmount(exp.amount.toString());
    setDueDate(new Date(exp.dueDate).toISOString().split('T')[0]);
    setCategoryId(exp.categoryId);
    setNotes(exp.notes || '');
    setShowForm(true);
  }

  async function deleteExpense(id: string) {
    if (!confirm('Excluir esta despesa?')) return;
    await api.delete(`/expenses/${id}`);
    setSnackbar({ open: true, message: 'Excluída!', severity: 'success' });
    loadData();
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>👥 Despesas com Funcionários</Typography>
          <Typography variant="caption" color="textSecondary">
            Total: <strong>R$ {totalExpenses.toFixed(2)}</strong> • {expenses.length} lançamento(s)
          </Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<Add />} onClick={() => { setEditingId(null); setShowForm(true); }}>
          Nova Despesa
        </Button>
      </Box>

      {/* Tabela */}
      <Card sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Funcionário / Descrição</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Vencimento</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map(exp => (
              <TableRow key={exp.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Badge sx={{ color: '#00A896' }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{exp.description}</Typography>
                      {exp.notes && <Typography variant="caption" color="textSecondary">{exp.notes}</Typography>}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={700}>R$ {exp.amount.toFixed(2)}</Typography>
                </TableCell>
                <TableCell>{new Date(exp.dueDate).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>
                  <Chip 
                    label={exp.status === 'PAID' ? 'Pago' : exp.status === 'OVERDUE' ? 'Vencido' : 'Pendente'} 
                    size="small" 
                    color={exp.status === 'PAID' ? 'success' : exp.status === 'OVERDUE' ? 'error' : 'warning'} 
                    sx={{ fontSize: 11 }} 
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" color="primary" onClick={() => openEdit(exp)}><Edit fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => deleteExpense(exp.id)}><Delete fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {expenses.length === 0 && (
              <TableRow><TableCell colSpan={5} align="center"><Typography color="textSecondary" py={4}>Nenhuma despesa com funcionários</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal */}
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? '✏️ Editar' : '👥 Nova Despesa'} - Funcionário</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Nome do Funcionário / Descrição" size="small" value={description} onChange={e => setDescription(e.target.value)} required placeholder="Ex: João Silva - Salário" />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Valor R$" type="number" size="small" value={amount} onChange={e => setAmount(e.target.value)} required inputProps={{ step: "0.01" }} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Vencimento" type="date" size="small" value={dueDate} onChange={e => setDueDate(e.target.value)} required InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Observações" size="small" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ex: Salário, Vale transporte, Férias..." />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">{editingId ? 'Atualizar' : 'Salvar'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} />
    </Box>
  );
}
