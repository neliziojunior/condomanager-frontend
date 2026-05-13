import { useState, useEffect, useRef } from 'react';
import api, { uploadFile } from '../services/api';
import { 
  Typography, Card, CardContent, Grid, TextField, Button, Select, MenuItem, 
  Table, TableBody, TableCell, TableHead, TableRow, Box, Chip, IconButton, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar, Tooltip
} from '@mui/material';
import { Search, AttachFile, CheckCircle, PictureAsPdf } from '@mui/icons-material';

export default function Expenses() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form
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
      
      // Filtra apenas categorias de despesa
      const expenseCategories = condRes.data.categories.filter((c: any) => c.type === 'EXPENSE');
      setCategories(expenseCategories);
      setExpenses(expRes.data);
      
      console.log('Categorias carregadas:', expenseCategories); // Debug
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setSnackbar({ open: true, message: 'Erro ao carregar dados', severity: 'error' });
    }
  }

  async function suggestCategory() {
    if (!description) return;
    try {
      const { data } = await api.post('/expenses/suggest-category', { description });
      setAiSuggestion(data);
      // Se a IA sugerir, já seleciona automaticamente
      if (data.suggestion?.categoryId) {
        setCategoryId(data.suggestion.categoryId);
      }
    } catch (error) {
      console.error('Erro IA:', error);
    }
  }

  async function createExpense(e: React.FormEvent) {
    e.preventDefault();
    
    // Validação
    if (!categoryId) {
      setSnackbar({ open: true, message: 'Selecione uma categoria!', severity: 'error' });
      return;
    }

    try {
      await api.post('/expenses', { 
        description, 
        amount: Number(amount), 
        dueDate, 
        categoryId 
      });
      
      setSnackbar({ open: true, message: 'Despesa criada com sucesso!', severity: 'success' });
      setDescription(''); 
      setAmount(''); 
      setDueDate(''); 
      setCategoryId(''); 
      setAiSuggestion(null);
      setShowForm(false);
      loadData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Erro ao criar despesa';
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
      console.error('Erro completo:', error.response?.data);
    }
  }

  async function handleFileUpload(expenseId: string, file: File) {
    try {
      setUploadingId(expenseId);
      await uploadFile(expenseId, file);
      setSnackbar({ open: true, message: 'Comprovante anexado!', severity: 'success' });
      loadData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao anexar arquivo', severity: 'error' });
    } finally {
      setUploadingId(null);
    }
  }

  async function markAsPaid(expenseId: string) {
    try {
      await api.post(`/expenses/${expenseId}/mark-paid`, { 
        paymentDate: new Date().toISOString() 
      });
      setSnackbar({ open: true, message: 'Despesa marcada como paga!', severity: 'success' });
      loadData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao atualizar status', severity: 'error' });
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
        <Typography variant="h4">💰 Despesas</Typography>
        <Button variant="contained" onClick={() => {
          setShowForm(true);
          if (categories.length === 0) loadData(); // Recarrega se vazio
        }}>
          ➕ Nova Despesa
        </Button>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                placeholder="Buscar despesas..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Select fullWidth value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <MenuItem value="ALL">Todos os status</MenuItem>
                <MenuItem value="PENDING">Pendentes</MenuItem>
                <MenuItem value="PAID">Pagas</MenuItem>
                <MenuItem value="OVERDUE">Vencidas</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="textSecondary">
                {filteredExpenses.length} despesa(s)
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <Table>
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
                  <Typography variant="body2" fontWeight="bold">{exp.description}</Typography>
                  {exp.documentUrl && (
                    <Button 
                      size="small" 
                      href={`http://localhost:3333${exp.documentUrl}`} 
                      target="_blank"
                      startIcon={<PictureAsPdf />}
                      sx={{ mt: 0.5 }}
                    >
                      Ver comprovante
                    </Button>
                  )}
                </TableCell>
                <TableCell>{exp.category?.name || '-'}</TableCell>
                <TableCell>R$ {exp.amount.toFixed(2)}</TableCell>
                <TableCell>{new Date(exp.dueDate).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>
                  <Tooltip title="Anexar comprovante">
                    <IconButton 
                      size="small" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingId === exp.id}
                    >
                      <AttachFile color={exp.documentUrl ? 'success' : 'action'} />
                    </IconButton>
                  </Tooltip>
                  <input 
                    type="file" 
                    hidden 
                    ref={fileInputRef}
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(exp.id, file);
                        e.target.value = '';
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={exp.status === 'PAID' ? 'Pago' : exp.status === 'OVERDUE' ? 'Vencido' : 'Pendente'}
                    color={exp.status === 'PAID' ? 'success' : exp.status === 'OVERDUE' ? 'error' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {exp.status !== 'PAID' && (
                    <Tooltip title="Marcar como pago">
                      <IconButton size="small" color="success" onClick={() => markAsPaid(exp.id)}>
                        <CheckCircle />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredExpenses.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="textSecondary" sx={{ py: 4 }}>
                    {searchTerm ? 'Nenhuma despesa encontrada' : 'Nenhuma despesa cadastrada'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal Nova Despesa */}
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nova Despesa</DialogTitle>
        <form onSubmit={createExpense}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Descrição" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  required 
                  autoFocus
                />
                <Button 
                  onClick={suggestCategory} 
                  sx={{ mt: 1 }} 
                  variant="outlined" 
                  size="small" 
                  color="secondary"
                  disabled={!description}
                >
                  🤖 Sugerir Categoria com IA
                </Button>
                {aiSuggestion?.suggestion && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    IA sugere: <strong>{categories.find(c => c.id === aiSuggestion.suggestion.categoryId)?.name}</strong> 
                    ({(aiSuggestion.suggestion.confidence * 100).toFixed(0)}% de confiança)
                  </Alert>
                )}
              </Grid>
              <Grid item xs={6}>
                <TextField 
                  fullWidth 
                  label="Valor R$" 
                  type="number" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  required 
                  inputProps={{ step: "0.01", min: "0" }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField 
                  fullWidth 
                  label="Vencimento" 
                  type="date" 
                  value={dueDate} 
                  onChange={e => setDueDate(e.target.value)} 
                  InputLabelProps={{ shrink: true }} 
                  required 
                />
              </Grid>
              <Grid item xs={12}>
                <Select 
                  fullWidth 
                  value={categoryId} 
                  onChange={e => setCategoryId(e.target.value)} 
                  displayEmpty 
                  required
                >
                  <MenuItem value="" disabled>
                    <em>Selecione a categoria</em>
                  </MenuItem>
                  {categories.map(c => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </MenuItem>
                  ))}
                </Select>
                {categories.length === 0 && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    ⚠️ Nenhuma categoria encontrada. Verifique se o condomínio foi criado.
                  </Typography>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={!categoryId || !description || !amount || !dueDate}
            >
              Salvar Despesa
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        message={snackbar.message}
      />
    </Box>
  );
}
