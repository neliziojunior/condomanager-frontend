import { useState, useEffect } from 'react';
import api from '../services/api';
import { Typography, Card, CardContent, Grid, TextField, Button, Select, MenuItem, Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar } from '@mui/material';
import { Add, ExitToApp, People } from '@mui/icons-material';

export default function Visitors() {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [activeCount, setActiveCount] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [reason, setReason] = useState('');
  const [unitId, setUnitId] = useState('');

  useEffect(() => { loadData(); }, [filterStatus]);

  async function loadData() {
    const [visRes, unitRes, countRes] = await Promise.all([
      api.get('/visitors', { params: { status: filterStatus } }),
      api.get('/units'),
      api.get('/visitors/active-count')
    ]);
    setVisitors(visRes.data);
    setUnits(unitRes.data);
    setActiveCount(countRes.data);
  }

  async function createVisitor(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/visitors', { name, document, reason, unitId });
    setSnackbar({ open: true, message: 'Visitante registrado!', severity: 'success' });
    setShowForm(false); setName(''); setDocument(''); setReason(''); setUnitId('');
    loadData();
  }

  async function registerExit(id: string) {
    await api.put(`/visitors/${id}/exit`);
    loadData();
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h6" fontWeight={700}>📹 Visitantes</Typography>
          <Typography variant="caption" color="textSecondary">{activeCount} ativo(s) no momento</Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<Add />} onClick={() => setShowForm(true)}>Registrar Entrada</Button>
      </Box>

      <Card sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Select fullWidth size="small" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} displayEmpty>
            <MenuItem value="">Todos</MenuItem><MenuItem value="ACTIVE">Ativos</MenuItem><MenuItem value="INACTIVE">Finalizados</MenuItem>
          </Select>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {visitors.map(v => (
          <Grid item xs={12} sm={6} md={4} key={v.id}>
            <Card sx={{ borderRadius: 2, borderLeft: `4px solid ${v.status === 'ACTIVE' ? '#27ae60' : '#636e72'}` }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Chip icon={<People />} label={v.name} size="small" color={v.status === 'ACTIVE' ? 'success' : 'default'} />
                  {v.status === 'ACTIVE' && (
                    <Button size="small" color="error" startIcon={<ExitToApp />} onClick={() => registerExit(v.id)}>Saída</Button>
                  )}
                </Box>
                <Box mt={1}>
                  <Typography variant="caption" display="block">🏠 Unidade {v.unit?.number}</Typography>
                  {v.document && <Typography variant="caption" display="block">📄 {v.document}</Typography>}
                  {v.reason && <Typography variant="caption" display="block">📝 {v.reason}</Typography>}
                  <Typography variant="caption" color="textSecondary" display="block">
                    Entrada: {new Date(v.entryAt).toLocaleTimeString('pt-BR')}
                  </Typography>
                  {v.exitAt && (
                    <Typography variant="caption" color="textSecondary" display="block">
                      Saída: {new Date(v.exitAt).toLocaleTimeString('pt-BR')}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>📹 Registrar Visitante</DialogTitle>
        <form onSubmit={createVisitor}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Select fullWidth value={unitId} onChange={e => setUnitId(e.target.value)} displayEmpty required size="small">
                  <MenuItem value="" disabled>Unidade que recebe</MenuItem>
                  {units.map(u => <MenuItem key={u.id} value={u.id}>Unidade {u.number}</MenuItem>)}
                </Select>
              </Grid>
              <Grid item xs={12}><TextField fullWidth label="Nome do visitante" size="small" value={name} onChange={e => setName(e.target.value)} required /></Grid>
              <Grid item xs={6}><TextField fullWidth label="Documento" size="small" value={document} onChange={e => setDocument(e.target.value)} /></Grid>
              <Grid item xs={6}><TextField fullWidth label="Motivo" size="small" value={reason} onChange={e => setReason(e.target.value)} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions><Button onClick={() => setShowForm(false)}>Cancelar</Button><Button type="submit" variant="contained">Registrar</Button></DialogActions>
        </form>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
