import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Typography, Card, CardContent, Grid, TextField, Button, Select, MenuItem,
  Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar,
  Alert, IconButton, Divider, Avatar
} from '@mui/material';
import {
  Add, Delete, Edit, Warning, Lightbulb, CheckCircle, Close,
  LowPriority, PriorityHigh, Schedule
} from '@mui/icons-material';

const TYPE_OPTIONS = [
  { value: 'COMPLAINT', label: '⚠️ Reclamação', color: '#e74c3c' },
  { value: 'SUGGESTION', label: '💡 Sugestão', color: '#6c5ce7' },
  { value: 'COMPLIMENT', label: '👏 Elogio', color: '#02C39A' },
  { value: 'MAINTENANCE', label: '🔧 Manutenção', color: '#F0A500' },
];

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Aberto', color: '#e74c3c' },
  { value: 'IN_PROGRESS', label: 'Em Análise', color: '#F0A500' },
  { value: 'RESOLVED', label: 'Resolvido', color: '#02C39A' },
  { value: 'CLOSED', label: 'Fechado', color: '#636e72' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: '🟢 Baixa', color: '#02C39A' },
  { value: 'MEDIUM', label: '🟡 Média', color: '#F0A500' },
  { value: 'HIGH', label: '🟠 Alta', color: '#e67e22' },
  { value: 'URGENT', label: '🔴 Urgente', color: '#e74c3c' },
];

export default function Occurrences() {
  const [occurrences, setOccurrences] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [showResolveForm, setShowResolveForm] = useState<any>(null);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('COMPLAINT');
  const [priority, setPriority] = useState('MEDIUM');
  const [unitId, setUnitId] = useState('');

  // Resolve
  const [response, setResponse] = useState('');
  const [newStatus, setNewStatus] = useState('RESOLVED');

  useEffect(() => {
    loadData();
  }, [filterType, filterStatus, filterPriority]);

  async function loadData() {
    const [occRes, unitRes] = await Promise.all([
      api.get('/occurrences', {
        params: { type: filterType, status: filterStatus, priority: filterPriority },
      }),
      api.get('/units'),
    ]);
    setOccurrences(occRes.data);
    setUnits(unitRes.data);
  }

  async function createOccurrence(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/occurrences', {
        title, description, type, priority,
        unitId: unitId || undefined,
      });
      setSnackbar({ open: true, message: '✅ Ocorrência registrada!', severity: 'success' });
      setShowForm(false);
      resetForm();
      loadData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao registrar', severity: 'error' });
    }
  }

  function resetForm() {
    setTitle(''); setDescription(''); setType('COMPLAINT');
    setPriority('MEDIUM'); setUnitId('');
  }

  function openResolveModal(occ: any) {
    setShowResolveForm(occ);
    setResponse(occ.response || '');
    setNewStatus(occ.status === 'OPEN' ? 'IN_PROGRESS' : 'RESOLVED');
  }

  async function submitResponse() {
    if (!response.trim()) {
      setSnackbar({ open: true, message: 'Digite uma resposta', severity: 'warning' });
      return;
    }

    try {
      await api.put(`/occurrences/${showResolveForm.id}`, {
        status: newStatus,
        response,
      });
      setSnackbar({ open: true, message: '✅ Ocorrência atualizada!', severity: 'success' });
      setShowResolveForm(null);
      setResponse('');
      loadData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao atualizar', severity: 'error' });
    }
  }

  async function deleteOccurrence(id: string) {
    if (!confirm('Excluir esta ocorrência?')) return;
    await api.delete(`/occurrences/${id}`);
    setSnackbar({ open: true, message: 'Excluída!', severity: 'success' });
    loadData();
  }

  function getTypeInfo(type: string) {
    return TYPE_OPTIONS.find(t => t.value === type) || TYPE_OPTIONS[0];
  }

  function getStatusInfo(status: string) {
    return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
  }

  function getPriorityInfo(priority: string) {
    return PRIORITY_OPTIONS.find(p => p.value === priority) || PRIORITY_OPTIONS[1];
  }

  const stats = {
    total: occurrences.length,
    open: occurrences.filter(o => o.status === 'OPEN').length,
    inProgress: occurrences.filter(o => o.status === 'IN_PROGRESS').length,
    resolved: occurrences.filter(o => o.status === 'RESOLVED').length,
    urgent: occurrences.filter(o => o.priority === 'URGENT' || o.priority === 'HIGH').length,
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>⚠️ Ocorrências</Typography>
          <Typography variant="caption" color="textSecondary">
            Reclamações, sugestões e elogios dos moradores
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setShowForm(true)} sx={{ bgcolor: '#00A896' }}>
          Nova Ocorrência
        </Button>
      </Box>

      {/* Cards de Estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ borderRadius: 2, textAlign: 'center', p: 1.5 }}>
            <Typography variant="h5" fontWeight={700}>{stats.total}</Typography>
            <Typography variant="caption" color="textSecondary">Total</Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ borderRadius: 2, textAlign: 'center', p: 1.5, bgcolor: '#FFF5F5' }}>
            <Typography variant="h5" fontWeight={700} color="#e74c3c">{stats.open}</Typography>
            <Typography variant="caption" color="textSecondary">Abertas</Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ borderRadius: 2, textAlign: 'center', p: 1.5, bgcolor: '#FFFBF0' }}>
            <Typography variant="h5" fontWeight={700} color="#F0A500">{stats.inProgress}</Typography>
            <Typography variant="caption" color="textSecondary">Em Análise</Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ borderRadius: 2, textAlign: 'center', p: 1.5, bgcolor: '#F0FDF9' }}>
            <Typography variant="h5" fontWeight={700} color="#02C39A">{stats.resolved}</Typography>
            <Typography variant="caption" color="textSecondary">Resolvidas</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Card sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Select fullWidth size="small" value={filterType} onChange={e => setFilterType(e.target.value)} displayEmpty>
                <MenuItem value="">Todos os tipos</MenuItem>
                {TYPE_OPTIONS.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </Select>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Select fullWidth size="small" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} displayEmpty>
                <MenuItem value="">Todos os status</MenuItem>
                {STATUS_OPTIONS.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </Select>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Select fullWidth size="small" value={filterPriority} onChange={e => setFilterPriority(e.target.value)} displayEmpty>
                <MenuItem value="">Todas as prioridades</MenuItem>
                {PRIORITY_OPTIONS.map(p => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
              </Select>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lista de Ocorrências */}
      {occurrences.length === 0 ? (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Warning sx={{ fontSize: 60, color: '#E0E0E0', mb: 2 }} />
            <Typography color="textSecondary">Nenhuma ocorrência registrada</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {occurrences.map(occ => {
            const typeInfo = getTypeInfo(occ.type);
            const statusInfo = getStatusInfo(occ.status);
            const priorityInfo = getPriorityInfo(occ.priority);

            return (
              <Grid item xs={12} key={occ.id}>
                <Card sx={{
                  borderRadius: 2,
                  borderLeft: `4px solid ${typeInfo.color}`,
                  opacity: occ.status === 'CLOSED' || occ.status === 'RESOLVED' ? 0.75 : 1,
                }}>
                  <CardContent sx={{ p: 2 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Chip
                          label={typeInfo.label}
                          size="small"
                          sx={{ bgcolor: typeInfo.color, color: 'white', fontWeight: 600 }}
                        />
                        <Chip
                          label={priorityInfo.label}
                          size="small"
                          sx={{ bgcolor: priorityInfo.color + '20', color: priorityInfo.color, fontWeight: 600 }}
                        />
                        <Chip
                          label={statusInfo.label}
                          size="small"
                          sx={{ bgcolor: statusInfo.color + '20', color: statusInfo.color, fontWeight: 600 }}
                        />
                      </Box>
                      <Box>
                        <IconButton size="small" onClick={() => setShowDetail(occ)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => deleteOccurrence(occ.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Título e Descrição */}
                    <Typography variant="subtitle1" fontWeight={600} mb={0.5}>
                      {occ.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" mb={1}>
                      {occ.description}
                    </Typography>

                    {/* Resposta do síndico */}
                    {occ.response && (
                      <Box sx={{ bgcolor: '#F0FDF9', p: 1.5, borderRadius: 2, mb: 1, mt: 1 }}>
                        <Typography variant="caption" fontWeight={600} color="#00A896" display="block">
                          ✅ Resposta do síndico:
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: 13 }}>
                          {occ.response}
                        </Typography>
                        {occ.respondedBy && (
                          <Typography variant="caption" color="textSecondary">
                            — {occ.respondedBy} em {new Date(occ.respondedAt).toLocaleDateString('pt-BR')}
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* Footer */}
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                            {occ.person?.name?.[0]}
                          </Avatar>
                          <Typography variant="caption" color="textSecondary">
                            {occ.person?.name}
                            {occ.unit?.number && ` • Unid. ${occ.unit.number}`}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          📅 {new Date(occ.createdAt).toLocaleDateString('pt-BR')}
                        </Typography>
                      </Box>

                      {/* Botões de ação */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {occ.status === 'OPEN' && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            onClick={() => openResolveModal(occ)}
                            startIcon={<Schedule />}
                          >
                            Analisar
                          </Button>
                        )}
                        {occ.status === 'IN_PROGRESS' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => openResolveModal(occ)}
                            startIcon={<CheckCircle />}
                          >
                            Responder / Resolver
                          </Button>
                        )}
                        {(occ.status === 'RESOLVED' || occ.status === 'CLOSED') && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => openResolveModal(occ)}
                          >
                            Editar Resposta
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Modal Nova Ocorrência */}
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>⚠️ Nova Ocorrência</DialogTitle>
        <form onSubmit={createOccurrence}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Título" size="small" value={title} onChange={e => setTitle(e.target.value)} required />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Descrição" size="small" value={description} onChange={e => setDescription(e.target.value)} required multiline rows={3} />
              </Grid>
              <Grid item xs={6}>
                <Select fullWidth size="small" value={type} onChange={e => setType(e.target.value)}>
                  {TYPE_OPTIONS.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                </Select>
              </Grid>
              <Grid item xs={6}>
                <Select fullWidth size="small" value={priority} onChange={e => setPriority(e.target.value)}>
                  {PRIORITY_OPTIONS.map(p => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
                </Select>
              </Grid>
              <Grid item xs={12}>
                <Select fullWidth size="small" value={unitId} onChange={e => setUnitId(e.target.value)} displayEmpty>
                  <MenuItem value="">Sem unidade específica (área comum)</MenuItem>
                  {units.map(u => <MenuItem key={u.id} value={u.id}>Unidade {u.number}</MenuItem>)}
                </Select>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#00A896' }}>Registrar</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal Responder / Resolver */}
      <Dialog open={!!showResolveForm} onClose={() => setShowResolveForm(null)} maxWidth="sm" fullWidth>
        <DialogTitle>✍️ Responder Ocorrência</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>{showResolveForm?.title}</strong>
            <br />
            {showResolveForm?.description}
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Select fullWidth size="small" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                {STATUS_OPTIONS.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </Select>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Resposta ao morador"
                value={response}
                onChange={e => setResponse(e.target.value)}
                multiline
                rows={4}
                placeholder="Explique o que foi feito ou qual será o próximo passo..."
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResolveForm(null)}>Cancelar</Button>
          <Button variant="contained" onClick={submitResponse} sx={{ bgcolor: '#00A896' }}>
            Salvar Resposta
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Detalhes */}
      <Dialog open={!!showDetail} onClose={() => setShowDetail(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{showDetail?.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" mb={2}>{showDetail?.description}</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="textSecondary">
            Registrado por: {showDetail?.person?.name}
            <br />
            Data: {showDetail && new Date(showDetail.createdAt).toLocaleString('pt-BR')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetail(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity as any}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
