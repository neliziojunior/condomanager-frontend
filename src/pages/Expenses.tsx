import { useState, useEffect, useRef } from 'react';
import api, { uploadFile } from '../services/api';
import {
  Typography, Card, CardContent, Grid, TextField, Button, Select, MenuItem,
  Table, TableBody, TableCell, TableHead, TableRow, Box, Chip, IconButton,
  InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  Snackbar, Tooltip, Checkbox, FormControlLabel, Switch, Divider, Tabs, Tab
} from '@mui/material';
import {
  Search, AttachFile, CheckCircle, PictureAsPdf, Download,
  Edit, Delete, AutoAwesome, CameraAlt, TrendingUp, TrendingDown,
  AccountBalance, Warning, Add, FilterList, Refresh
} from '@mui/icons-material';

export default function Expenses() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [tab, setTab] = useState(0);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [installments, setInstallments] = useState(1);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);

  const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3333'
    : 'https://condpro.onrender.com';

  useEffect(() => { loadData(); }, [filterMonth]);

  async function loadData() {
    try {
      const [condRes, expRes, sumRes] = await Promise.all([
        api.get('/condominium/me'),
        api.get('/expenses'),
        api.get('/expenses/summary', { params: { month: filterMonth } }),
      ]);
      setCategories(condRes.data.categories.filter((c: any) => c.type === 'EXPENSE'));
      setExpenses(expRes.data);
      setSummary(sumRes.data);
    } catch (error) {
      console.error('Erro:', error);
    }
  }

  async function suggestCategory() {
    if (!description) return;
    try {
      const { data } = await api.post('/expenses/suggest-category', { description });
      setAiSuggestion(data);
      if (data.suggestion?.categoryId) setCategoryId(data.suggestion.categoryId);
    } catch (error) {}
  }

  function openEditModal(exp: any) {
    setEditingId(exp.id);
    setDescription(exp.description);
    setAmount(exp.amount.toString());
    setDueDate(new Date(exp.dueDate).toISOString().split('T')[0]);
    setCategoryId(exp.categoryId || '');
    setNotes(exp.notes || '');
    setShowForm(true);
  }

  function closeModal() {
    setShowForm(false);
    setEditingId(null);
    setDescription(''); setAmount(''); setDueDate('');
    setCategoryId(''); setNotes(''); setIsRecurring(false);
    setInstallments(1); setAiSuggestion(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId) {
      setSnackbar({ open: true, message: 'Selecione uma categoria!', severity: 'error' });
      return;
    }
    try {
      const payload = {
        description, amount: Number(amount), dueDate, categoryId, notes,
        isRecurring,
        ...(installments > 1 && { totalInstallments: installments }),
      };

      if (editingId) {
        await api.put(`/expenses/${editingId}`, payload);
        setSnackbar({ open: true, message: '✅ Atualizada!', severity: 'success' });
      } else {
        await api.post('/expenses', payload);
        setSnackbar({
          open: true,
          message: installments > 1
            ? `✅ ${installments} parcelas criadas!`
            : '✅ Criada!',
          severity: 'success',
        });
      }
      closeModal();
      loadData();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Erro', severity: 'error' });
    }
  }

  async function deleteExpense(id: string) {
    if (!confirm('Excluir?')) return;
    await api.delete(`/expenses/${id}`);
    setSnackbar({ open: true, message: 'Excluída!', severity: 'success' });
    loadData();
  }

  async function handleFileUpload(expenseId: string, file: File) {
    try {
      setUploadingId(expenseId);
      await uploadFile(expenseId, file);
      setSnackbar({ open: true, message: 'Comprovante anexado!', severity: 'success' });
      loadData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro', severity: 'error' });
    } finally {
      setUploadingId(null);
    }
  }

  async function markAsPaid(expenseId: string) {
    await api.post(`/expenses/${expenseId}/mark-paid`, { paymentDate: new Date().toISOString() });
    setSnackbar({ open: true, message: '✅ Paga!', severity: 'success' });
    loadData();
  }

  const filteredExpenses = expenses.filter(exp => {
    const m = exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
              exp.category?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const s = filterStatus === 'ALL' || exp.status === filterStatus;
    const c = !filterCategory || exp.categoryId === filterCategory;
    return m && s && c;
  });

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>💰 Despesas</Typography>
          <Typography variant="caption" color="textSecondary">
            Controle completo das despesas do condomínio
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined" size="small" startIcon={<Download />}
            onClick={() => window.open(`${API_URL}/expenses/report/pdf`, '_blank')}
          >
            PDF
          </Button>
          <Button
            variant="contained" size="small"
            onClick={() => { setEditingId(null); setShowForm(true); }}
            startIcon={<Add />}
            sx={{ bgcolor: '#00A896' }}
          >
            Nova Despesa
          </Button>
        </Box>
      </Box>

      {/* Cards de Resumo */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: 2, bgcolor: '#F0FDF9', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccountBalance sx={{ color: '#00A896' }} />
                <Typography variant="caption" color="textSecondary">TOTAL DO MÊS</Typography>
              </Box>
              <Typography variant="h6" fontWeight={700} color="#00A896">
                R$ {summary.total.toFixed(2)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {summary.count} lançamento(s)
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: 2, bgcolor: '#F0FDF9', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircle sx={{ color: '#02C39A' }} />
                <Typography variant="caption" color="textSecondary">PAGAS</Typography>
              </Box>
              <Typography variant="h6" fontWeight={700} color="#02C39A">
                R$ {summary.paid.toFixed(2)}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: 2, bgcolor: '#FFFBF0', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Warning sx={{ color: '#F0A500' }} />
                <Typography variant="caption" color="textSecondary">PENDENTES</Typography>
              </Box>
              <Typography variant="h6" fontWeight={700} color="#F0A500">
                R$ {summary.pending.toFixed(2)}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: 2, bgcolor: '#FFF5F5', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingDown sx={{ color: '#E63946' }} />
                <Typography variant="caption" color="textSecondary">VENCIDAS</Typography>
              </Box>
              <Typography variant="h6" fontWeight={700} color="#E63946">
                R$ {summary.overdue.toFixed(2)}
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filtros */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth size="small" type="month"
                value={filterMonth}
                onChange={e => setFilterMonth(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth size="small" placeholder="Buscar..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Select fullWidth size="small" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} displayEmpty>
                <MenuItem value="ALL">Todos</MenuItem>
                <MenuItem value="PENDING">Pendentes</MenuItem>
                <MenuItem value="PAID">Pagas</MenuItem>
                <MenuItem value="OVERDUE">Vencidas</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} md={2}>
              <Select fullWidth size="small" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} displayEmpty>
                <MenuItem value="">Todas categorias</MenuItem>
                {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="caption" color="textSecondary">
                {filteredExpenses.length} despesa(s)
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Descrição</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Vencimento</TableCell>
              <TableCell>Comprovante</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredExpenses.map(exp => (
              <TableRow key={exp.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600} fontSize={12}>
                    {exp.description}
                  </Typography>
                  {exp.totalInstallments > 1 && (
                    <Chip
                      label={`${exp.installment}/${exp.totalInstallments} parcelas`}
                      size="small"
                      color="info"
                      sx={{ mt: 0.5, fontSize: 10 }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Chip label={exp.category?.name || '-'} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    R$ {exp.amount.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell>{new Date(exp.dueDate).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>
                  <Tooltip title="Anexar comprovante">
                    <IconButton size="small" onClick={() => fileInputRef.current?.click()} disabled={uploadingId === exp.id}>
                      <AttachFile fontSize="small" color={exp.documentUrl ? 'success' : 'action'} />
                    </IconButton>
                  </Tooltip>
                  <input type="file" hidden ref={fileInputRef} accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) { handleFileUpload(exp.id, f); e.target.value = ''; }
                    }} />
                </TableCell>
                <TableCell>
                  <Chip
                    label={exp.status === 'PAID' ? 'Pago' : exp.status === 'OVERDUE' ? 'Vencido' : 'Pendente'}
                    color={exp.status === 'PAID' ? 'success' : exp.status === 'OVERDUE' ? 'error' : 'warning'}
                    size="small"
                    sx={{ fontSize: 11 }}
                  />
                </TableCell>
                <TableCell>
                  {exp.status !== 'PAID' && (
                    <Tooltip title="Marcar como pago">
                      <IconButton size="small" color="success" onClick={() => markAsPaid(exp.id)}>
                        <CheckCircle fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Editar">
                    <IconButton size="small" color="primary" onClick={() => openEditModal(exp)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton size="small" color="error" onClick={() => deleteExpense(exp.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filteredExpenses.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="textSecondary" sx={{ py: 4 }}>Nenhuma despesa encontrada</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal Nova/Editar Despesa */}
      <Dialog open={showForm} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? '✏️ Editar Despesa' : '💰 Nova Despesa'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Descrição" size="small" value={description} onChange={e => setDescription(e.target.value)} required />
                <Button onClick={suggestCategory} sx={{ mt: 1 }} variant="outlined" size="small" color="secondary" disabled={!description}>
                  🤖 Sugerir Categoria
                </Button>
                {aiSuggestion?.suggestion && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    IA: <strong>{categories.find(c => c.id === aiSuggestion.suggestion.categoryId)?.name}</strong>
                  </Alert>
                )}
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Valor R$" type="number" size="small" value={amount} onChange={e => setAmount(e.target.value)} required />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Vencimento" type="date" size="small" value={dueDate} onChange={e => setDueDate(e.target.value)} required InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12}>
                <Select fullWidth size="small" value={categoryId} onChange={e => setCategoryId(e.target.value)} displayEmpty required>
                  <MenuItem value="" disabled>Selecione a categoria</MenuItem>
                  {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Observações" size="small" value={notes} onChange={e => setNotes(e.target.value)} multiline rows={2} />
              </Grid>
              {!editingId && (
                <>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Switch checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} />}
                      label="🔁 Despesa recorrente mensal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth label="Parcelas" type="number" size="small"
                      value={installments}
                      onChange={e => setInstallments(Number(e.target.value))}
                      inputProps={{ min: 1, max: 36 }}
                      helperText={installments > 1 ? `Serão criadas ${installments} parcelas automaticamente` : 'Deixe 1 para não parcelar'}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeModal}>Cancelar</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#00A896' }}>
              {editingId ? 'Atualizar' : 'Salvar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} />
    </Box>
  );
}
