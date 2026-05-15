import { useState, useEffect, useRef } from 'react';
import api, { uploadFile } from '../services/api';
import { 
  Typography, Card, CardContent, Grid, TextField, Button, Select, MenuItem, 
  Table, TableBody, TableCell, TableHead, TableRow, Box, Chip, IconButton, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar, Tooltip
} from '@mui/material';
import { Search, AttachFile, CheckCircle, PictureAsPdf, Download } from '@mui/icons-material';

export default function Expenses() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [condRes, expRes] = await Promise.all([
        api.get('/condominium/me'),
        api.get('/expenses')
      ]);
      const expenseCategories = condRes.data.categories.filter((c: any) => c.type === 'EXPENSE');
      setCategories(expenseCategories);
      setExpenses(expRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
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

  async function createExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId) { setSnackbar({ open: true, message: 'Selecione uma categoria!', severity: 'error' }); return; }
    try {
      await api.post('/expenses', { description, amount: Number(amount), dueDate, categoryId });
      setSnackbar({ open: true, message: 'Despesa criada!', severity: 'success' });
      setDescription(''); setAmount(''); setDueDate(''); setCategoryId(''); setAiSuggestion(null);
      setShowForm(false);
      loadData();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Erro', severity: 'error' });
    }
  }

  async function handleFileUpload(expenseId: string, file: File) {
    try {
      setUploadingId(expenseId);
      await uploadFile(expenseId, file);
      setSnackbar({ open: true, message: 'Comprovante anexado!', severity: 'success' });
      loadData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao anexar', severity: 'error' });
    } finally {
      setUploadingId(null);
    }
  }

  async function markAsPaid(expenseId: string) {
    try {
      await api.post(`/expenses/${expenseId}/mark-paid`, { paymentDate: new Date().toISOString() });
      setSnackbar({ open: true, message: 'Marcada como paga!', severity: 'success' });
      loadData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro', severity: 'error' });
    }
  }

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exp.category?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || exp.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18 }}>💰 Despesas</Typography>
        <Box>
          <Button variant="outlined" size="small" startIcon={<Download />} onClick={() => window.open('http://localhost:3333/expenses/report/pdf', '_blank')} sx={{ mr: 1 }}>
            PDF
          </Button>
          <Button variant="contained" size="small" onClick={() => setShowForm(true)}>+ Nova Despesa</Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField fullWidth size="small" placeholder="Buscar despesas..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <Select fullWidth size="small" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <MenuItem value="ALL">Todos</MenuItem>
                <MenuItem value="PENDING">Pendentes</MenuItem>
                <MenuItem value="PAID">Pagas</MenuItem>
                <MenuItem value="OVERDUE">Vencidas</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">{filteredExpenses.length} despesa(s)</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
                  <Typography variant="body2" fontWeight={600} fontSize={12}>{exp.description}</Typography>
                  {exp.documentUrl && (
                    <Button size="small" href={`http://localhost:3333${exp.documentUrl}`} target="_blank" startIcon={<PictureAsPdf />} sx={{ mt: 0.5, fontSize: 10 }}>
                      Ver
                    </Button>
                  )}
                </TableCell>
                <TableCell>{exp.category?.name || '-'}</TableCell>
                <TableCell>R$ {exp.amount.toFixed(2)}</TableCell>
                <TableCell>{new Date(exp.dueDate).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>
                  <Tooltip title="Anexar comprovante">
                    <IconButton size="small" onClick={() => fileInputRef.current?.click()} disabled={uploadingId === exp.id}>
                      <AttachFile fontSize="small" color={exp.documentUrl ? 'success' : 'action'} />
                    </IconButton>
                  </Tooltip>
                  <input type="file" hidden ref={fileInputRef} accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => { const file = e.target.files?.[0]; if (file) { handleFileUpload(exp.id, file); e.target.value = ''; } }} />
                </TableCell>
                <TableCell>
                  <Chip label={exp.status === 'PAID' ? 'Pago' : exp.status === 'OVERDUE' ? 'Vencido' : 'Pendente'}
                    color={exp.status === 'PAID' ? 'success' : exp.status === 'OVERDUE' ? 'error' : 'warning'} size="small" sx={{ fontSize: 11 }} />
                </TableCell>
                <TableCell>
                  {exp.status !== 'PAID' && (
                    <Tooltip title="Marcar como pago">
                      <IconButton size="small" color="success" onClick={() => markAsPaid(exp.id)}>
                        <CheckCircle fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredExpenses.length === 0 && (
              <TableRow><TableCell colSpan={7} align="center"><Typography color="textSecondary" sx={{ py: 4 }}>Nenhuma despesa</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>Nova Despesa</DialogTitle>
        <form onSubmit={createExpense}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Descrição" size="small" value={description} onChange={e => setDescription(e.target.value)} required autoFocus />
                <Button onClick={suggestCategory} sx={{ mt: 1 }} variant="outlined" size="small" color="secondary" disabled={!description}>
                  🤖 Sugerir Categoria
                </Button>
                {aiSuggestion?.suggestion && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    IA: <strong>{categories.find(c => c.id === aiSuggestion.suggestion.categoryId)?.name}</strong> ({(aiSuggestion.suggestion.confidence * 100).toFixed(0)}%)
                  </Alert>
                )}
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Valor R$" type="number" size="small" value={amount} onChange={e => setAmount(e.target.value)} required inputProps={{ step: "0.01", min: "0" }} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Vencimento" type="date" size="small" value={dueDate} onChange={e => setDueDate(e.target.value)} required InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12}>
                <Select fullWidth size="small" value={categoryId} onChange={e => setCategoryId(e.target.value)} displayEmpty required>
                  <MenuItem value="" disabled>Selecione a categoria</MenuItem>
                  {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.icon} {c.name}</MenuItem>)}
                </Select>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowForm(false)} size="small">Cancelar</Button>
            <Button type="submit" variant="contained" size="small" disabled={!categoryId || !description || !amount || !dueDate}>Salvar</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} />
    </Box>
  );
}
