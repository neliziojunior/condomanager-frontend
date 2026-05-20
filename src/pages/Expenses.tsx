import { useState, useEffect, useRef } from 'react';
import api, { uploadFile } from '../services/api';
import { 
  Typography, Card, CardContent, Grid, TextField, Button, Select, MenuItem, 
  Table, TableBody, TableCell, TableHead, TableRow, Box, Chip, IconButton, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar, Tooltip,
  Checkbox
} from '@mui/material';
import { Search, AttachFile, CheckCircle, PictureAsPdf, Download, Edit, Delete, AutoAwesome, CameraAlt } from '@mui/icons-material';

export default function Expenses() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showInvoices, setShowInvoices] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
  const [scanning, setScanning] = useState(false); // ✅ NOVO: Estado para scan de recibo

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [condRes, expRes] = await Promise.all([api.get('/condominium/me'), api.get('/expenses')]);
      setCategories(condRes.data.categories.filter((c: any) => c.type === 'EXPENSE'));
      setExpenses(expRes.data);
    } catch (error) { console.error('Erro ao carregar dados:', error); }
  }

  async function suggestCategory() {
    if (!description) return;
    try {
      const { data } = await api.post('/expenses/suggest-category', { description });
      setAiSuggestion(data);
      if (data.suggestion?.categoryId) setCategoryId(data.suggestion.categoryId);
    } catch (error) {}
  }

  // ✅ NOVO: Função para scan de recibo com OCR
  async function scanReceipt(file: File) {
    setScanning(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await api.post('/expenses/ocr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.success) {
        setSnackbar({ open: true, message: `Recibo processado! Despesa criada: ${data.expense.description}`, severity: 'success' });
        loadData();
      } else {
        setSnackbar({ open: true, message: 'Não foi possível ler o recibo', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao processar recibo', severity: 'error' });
    }
    setScanning(false);
  }

  async function fetchInvoices() {
    try {
      const { data } = await api.get('/expenses/fetch-invoices');
      setInvoices(data.invoices);
      setSelectedInvoices(data.invoices.map((_: any, i: number) => i));
      setShowInvoices(true);
    } catch (error) { setSnackbar({ open: true, message: 'Erro ao buscar notas', severity: 'error' }); }
  }

  async function importInvoices() {
    const toImport = selectedInvoices.map(i => invoices[i]).filter(inv => inv.categoryId);
    if (toImport.length === 0) { setSnackbar({ open: true, message: 'Nenhuma nota selecionada', severity: 'warning' }); return; }
    try {
      await api.post('/expenses/import-invoices', { invoices: toImport });
      setSnackbar({ open: true, message: `${toImport.length} nota(s) importada(s)!`, severity: 'success' });
      setShowInvoices(false); loadData();
    } catch (error) { setSnackbar({ open: true, message: 'Erro ao importar', severity: 'error' }); }
  }

  function toggleInvoice(index: number) { setSelectedInvoices(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]); }
  function openEditModal(exp: any) { setEditingId(exp.id); setDescription(exp.description); setAmount(exp.amount.toString()); setDueDate(new Date(exp.dueDate).toISOString().split('T')[0]); setCategoryId(exp.categoryId || ''); setShowForm(true); }
  function closeModal() { setShowForm(false); setEditingId(null); setDescription(''); setAmount(''); setDueDate(''); setCategoryId(''); setAiSuggestion(null); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId) { setSnackbar({ open: true, message: 'Selecione uma categoria!', severity: 'error' }); return; }
    try {
      if (editingId) { await api.put(`/expenses/${editingId}`, { description, amount: Number(amount), dueDate, categoryId }); setSnackbar({ open: true, message: 'Atualizada!', severity: 'success' }); }
      else { await api.post('/expenses', { description, amount: Number(amount), dueDate, categoryId }); setSnackbar({ open: true, message: 'Criada!', severity: 'success' }); }
      closeModal(); loadData();
    } catch (error: any) { setSnackbar({ open: true, message: error.response?.data?.message || 'Erro', severity: 'error' }); }
  }

  async function deleteExpense(id: string) { if (!confirm('Excluir?')) return; await api.delete(`/expenses/${id}`); setSnackbar({ open: true, message: 'Excluída!', severity: 'success' }); loadData(); }
  async function handleFileUpload(expenseId: string, file: File) { try { setUploadingId(expenseId); await uploadFile(expenseId, file); setSnackbar({ open: true, message: 'Anexado!', severity: 'success' }); loadData(); } catch (error) { setSnackbar({ open: true, message: 'Erro', severity: 'error' }); } finally { setUploadingId(null); } }
  async function markAsPaid(expenseId: string) { await api.post(`/expenses/${expenseId}/mark-paid`, { paymentDate: new Date().toISOString() }); setSnackbar({ open: true, message: 'Paga!', severity: 'success' }); loadData(); }

  const filteredExpenses = expenses.filter(exp => {
    const m = exp.description.toLowerCase().includes(searchTerm.toLowerCase()) || exp.category?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const s = filterStatus === 'ALL' || exp.status === filterStatus;
    return m && s;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18 }}>💰 Despesas</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* ✅ NOVO: Botão de Scan de Recibo */}
          <Button variant="outlined" component="label" startIcon={<CameraAlt />} disabled={scanning} size="small" color="secondary">
            📸 Recibo
            <input type="file" hidden accept="image/*" capture="environment" onChange={(e) => { const file = e.target.files?.[0]; if (file) scanReceipt(file); }} />
          </Button>
          <Button variant="outlined" size="small" startIcon={<AutoAwesome />} onClick={fetchInvoices} color="secondary">🔍 Notas</Button>
          <Button variant="outlined" size="small" startIcon={<Download />} onClick={() => window.open('http://192.168.0.3:3333/expenses/report/pdf', '_blank')}>PDF</Button>
          <Button variant="contained" size="small" onClick={() => { setEditingId(null); setShowForm(true); }}>+ Nova</Button>
        </Box>
      </Box>

      {/* Filtros, Tabela, Modais... (mantidos) */}
      <Card sx={{ mb: 3, borderRadius: 2 }}><CardContent sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}><TextField fullWidth size="small" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} /></Grid>
          <Grid item xs={12} md={3}><Select fullWidth size="small" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}><MenuItem value="ALL">Todos</MenuItem><MenuItem value="PENDING">Pendentes</MenuItem><MenuItem value="PAID">Pagas</MenuItem><MenuItem value="OVERDUE">Vencidas</MenuItem></Select></Grid>
          <Grid item xs={12} md={3}><Typography variant="caption" color="textSecondary">{filteredExpenses.length} despesa(s)</Typography></Grid>
        </Grid>
      </CardContent></Card>

      <Card sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead><TableRow><TableCell>Descrição</TableCell><TableCell>Categoria</TableCell><TableCell>Valor</TableCell><TableCell>Vencimento</TableCell><TableCell>Comp.</TableCell><TableCell>Status</TableCell><TableCell>Ações</TableCell></TableRow></TableHead>
          <TableBody>
            {filteredExpenses.map(exp => (
              <TableRow key={exp.id} hover>
                <TableCell><Typography variant="body2" fontWeight={600} fontSize={12}>{exp.description}</Typography>{exp.documentUrl && <Button size="small" href={`http://192.168.0.3:3333${exp.documentUrl}`} target="_blank" startIcon={<PictureAsPdf />} sx={{ mt: 0.5, fontSize: 10 }}>Ver</Button>}</TableCell>
                <TableCell>{exp.category?.name || '-'}</TableCell>
                <TableCell>R$ {exp.amount.toFixed(2)}</TableCell>
                <TableCell>{new Date(exp.dueDate).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell><Tooltip title="Anexar"><IconButton size="small" onClick={() => fileInputRef.current?.click()}><AttachFile fontSize="small" color={exp.documentUrl ? 'success' : 'action'} /></IconButton></Tooltip><input type="file" hidden ref={fileInputRef} accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) { handleFileUpload(exp.id, f); e.target.value = ''; } }} /></TableCell>
                <TableCell><Chip label={exp.status === 'PAID' ? 'Pago' : 'Pendente'} color={exp.status === 'PAID' ? 'success' : 'warning'} size="small" sx={{ fontSize: 11 }} /></TableCell>
                <TableCell>
                  {exp.status !== 'PAID' && <Tooltip title="Pagar"><IconButton size="small" color="success" onClick={() => markAsPaid(exp.id)}><CheckCircle fontSize="small" /></IconButton></Tooltip>}
                  <Tooltip title="Editar"><IconButton size="small" color="primary" onClick={() => openEditModal(exp)}><Edit fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Excluir"><IconButton size="small" color="error" onClick={() => deleteExpense(exp.id)}><Delete fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} />
    </Box>
  );
}
