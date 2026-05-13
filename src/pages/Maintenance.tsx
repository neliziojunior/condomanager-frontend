import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Typography, Card, CardContent, Grid, TextField, Button, Select, MenuItem,
  Table, TableBody, TableCell, TableHead, TableRow, Box, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Tooltip
} from '@mui/material';
import { Add, Edit, Delete, Build, Warning, PriorityHigh } from '@mui/icons-material';

const STATUS_COLORS: any = {
  OPEN: { color: 'error', label: 'Aberto' },
  IN_PROGRESS: { color: 'warning', label: 'Em andamento' },
  COMPLETED: { color: 'success', label: 'Concluído' },
  CANCELLED: { color: 'default', label: 'Cancelado' },
};

const PRIORITY_COLORS: any = {
  LOW: { color: 'success', label: 'Baixa', icon: '🟢' },
  MEDIUM: { color: 'warning', label: 'Média', icon: '🟡' },
  HIGH: { color: 'error', label: 'Alta', icon: '🟠' },
  URGENT: { color: 'error', label: 'Urgente', icon: '🔴' },
};

export default function Maintenance() {
  const [requests, setRequests] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [unitId, setUnitId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  useEffect(() => {
    loadData();
  }, [filterStatus, filterPriority]);

  async function loadData() {
    try {
      const [reqRes, unitRes] = await Promise.all([
        api.get('/maintenance', { params: { status: filterStatus, priority: filterPriority } }),
        api.get('/units')
      ]);
      setRequests(reqRes.data);
      setUnits(unitRes.data);
    } catch (error) {
      console.error('Erro ao carregar:', error);
    }
  }

  async function createRequest(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/maintenance', { title, description, unitId, priority });
      setSnackbar({ open: true, message: 'Chamado criado!', severity: 'success' });
      setShowForm(false);
      setTitle(''); setDescription(''); setUnitId(''); setPriority('MEDIUM');
      loadData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao criar chamado', severity: 'error' });
    }
  }

  async function updateStatus(id: string, status: string) {
    await api.put(`/maintenance/${id}/status`, { status });
    loadData();
  }

  async function deleteRequest(id: string) {
    if (!confirm('Excluir este chamado?')) return;
    await api.delete(`/maintenance/${id}`);
    setSnackbar({ open: true, message: 'Chamado excluído', severity: 'success' });
    loadData();
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4">🔧 Chamados de Manutenção</Typography>
          <Typography variant="body2" color="textSecondary">
            Gerencie solicitações de reparos e serviços
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setShowForm(true)}>
          Novo Chamado
        </Button>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Select fullWidth value={filterStatus} onChange={e => setFilterStatus(e.target.value)} displayEmpty>
                <MenuItem value="">Todos os status</MenuItem>
                <MenuItem value="OPEN">Abertos</MenuItem>
                <MenuItem value="IN_PROGRESS">Em andamento</MenuItem>
                <MenuItem value="COMPLETED">Concluídos</MenuItem>
                <MenuItem value="CANCELLED">Cancelados</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} md={4}>
              <Select fullWidth value={filterPriority} onChange={e => setFilterPriority(e.target.value)} displayEmpty>
                <MenuItem value="">Todas prioridades</MenuItem>
                <MenuItem value="LOW">Baixa</MenuItem>
                <MenuItem value="MEDIUM">Média</MenuItem>
                <MenuItem value="HIGH">Alta</MenuItem>
                <MenuItem value="URGENT">Urgente</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="textSecondary">
                {requests.length} chamado(s) encontrado(s)
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabela de chamados */}
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Prioridade</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Unidade</TableCell>
              <TableCell>Solicitante</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map(req => (
              <TableRow key={req.id} hover>
                <TableCell>
                  <Tooltip title={PRIORITY_COLORS[req.priority]?.label}>
                    <Chip 
                      icon={<Warning />}
                      label={PRIORITY_COLORS[req.priority]?.icon}
                      color={PRIORITY_COLORS[req.priority]?.color}
                      size="small"
                    />
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">{req.title}</Typography>
                  <Typography variant="caption" color="textSecondary">{req.description}</Typography>
                </TableCell>
                <TableCell>{req.unit?.number}</TableCell>
                <TableCell>{req.requester?.name}</TableCell>
                <TableCell>
                  <Select
                    value={req.status}
                    onChange={e => updateStatus(req.id, e.target.value)}
                    size="small"
                    sx={{ minWidth: 150 }}
                  >
                    <MenuItem value="OPEN">Aberto</MenuItem>
                    <MenuItem value="IN_PROGRESS">Em andamento</MenuItem>
                    <MenuItem value="COMPLETED">Concluído</MenuItem>
                    <MenuItem value="CANCELLED">Cancelado</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <IconButton size="small" color="error" onClick={() => deleteRequest(req.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="textSecondary" sx={{ py: 4 }}>
                    Nenhum chamado encontrado
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal Novo Chamado */}
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>🔧 Novo Chamado de Manutenção</DialogTitle>
        <form onSubmit={createRequest}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Título" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Ex: Vazamento na torneira" />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Descrição" value={description} onChange={e => setDescription(e.target.value)} multiline rows={3} placeholder="Detalhe o problema..." />
              </Grid>
              <Grid item xs={6}>
                <Select fullWidth value={unitId} onChange={e => setUnitId(e.target.value)} displayEmpty required>
                  <MenuItem value="">Selecione a unidade</MenuItem>
                  {units.map(u => (
                    <MenuItem key={u.id} value={u.id}>Unidade {u.number}</MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={6}>
                <Select fullWidth value={priority} onChange={e => setPriority(e.target.value)}>
                  <MenuItem value="LOW">🟢 Baixa</MenuItem>
                  <MenuItem value="MEDIUM">🟡 Média</MenuItem>
                  <MenuItem value="HIGH">🟠 Alta</MenuItem>
                  <MenuItem value="URGENT">🔴 Urgente</MenuItem>
                </Select>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">Criar Chamado</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
}
