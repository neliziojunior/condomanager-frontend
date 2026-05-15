import { useState, useEffect } from 'react';
import api from '../services/api';
import { Typography, Card, CardContent, Grid, TextField, Button, Select, MenuItem, Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar } from '@mui/material';
import { Add, Warning, Lightbulb } from '@mui/icons-material';

export default function Occurrences() {
  const [occurrences, setOccurrences] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('COMPLAINT');
  const [unitId, setUnitId] = useState('');

  useEffect(() => { loadData(); }, [filterType]);

  async function loadData() {
    const [occ, unt] = await Promise.all([api.get('/occurrences', { params: { type: filterType } }), api.get('/units')]);
    setOccurrences(occ.data); setUnits(unt.data);
  }

  async function createOccurrence(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/occurrences', { title, description, type, unitId: unitId || undefined });
    setSnackbar({ open: true, message: 'Registrado!', severity: 'success' });
    setShowForm(false); setTitle(''); setDescription(''); loadData();
  }

  async function resolve(id: string) {
    const response = prompt('Resposta:');
    if (!response) return;
    await api.put(`/occurrences/${id}`, { status: 'RESOLVED', response });
    loadData();
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>⚠️ Ocorrências</Typography>
        <Button variant="contained" size="small" startIcon={<Add />} onClick={() => setShowForm(true)}>Registrar</Button>
      </Box>
      <Card sx={{ mb: 2, borderRadius: 2 }}><CardContent sx={{ p: 2 }}>
        <Select fullWidth size="small" value={filterType} onChange={e => setFilterType(e.target.value)} displayEmpty>
          <MenuItem value="">Todas</MenuItem><MenuItem value="COMPLAINT">Reclamações</MenuItem><MenuItem value="SUGGESTION">Sugestões</MenuItem>
        </Select>
      </CardContent></Card>
      <Grid container spacing={2}>
        {occurrences.map(occ => (
          <Grid item xs={12} key={occ.id}>
            <Card sx={{ borderRadius: 2, borderLeft: `4px solid ${occ.type === 'COMPLAINT' ? '#e74c3c' : '#6c5ce7'}` }}>
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between">
                  <Box display="flex" gap={1} alignItems="center">
                    {occ.type === 'COMPLAINT' ? <Warning color="error" /> : <Lightbulb sx={{ color: '#6c5ce7' }} />}
                    <Typography fontWeight={600} fontSize={14}>{occ.title}</Typography>
                  </Box>
                  <Chip label={occ.status} size="small" color={occ.status === 'RESOLVED' ? 'success' : 'warning'} />
                </Box>
                <Typography variant="body2" sx={{ mt: 1, fontSize: 12 }}>{occ.description}</Typography>
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography variant="caption">{occ.person?.name} {occ.unit && `• Unid. ${occ.unit.number}`}</Typography>
                  {occ.response && <Typography variant="caption" color="textSecondary">Resposta: {occ.response}</Typography>}
                </Box>
                {occ.status !== 'RESOLVED' && (
                  <Button size="small" onClick={() => resolve(occ.id)} sx={{ mt: 1 }}>Resolver</Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>⚠️ Registrar Ocorrência</DialogTitle>
        <form onSubmit={createOccurrence}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}><TextField fullWidth label="Título" size="small" value={title} onChange={e => setTitle(e.target.value)} required /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Descrição" size="small" value={description} onChange={e => setDescription(e.target.value)} required multiline rows={3} /></Grid>
              <Grid item xs={6}>
                <Select fullWidth size="small" value={type} onChange={e => setType(e.target.value)}>
                  <MenuItem value="COMPLAINT">Reclamação</MenuItem><MenuItem value="SUGGESTION">Sugestão</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={6}>
                <Select fullWidth size="small" value={unitId} onChange={e => setUnitId(e.target.value)} displayEmpty>
                  <MenuItem value="">Unidade (opcional)</MenuItem>
                  {units.map(u => <MenuItem key={u.id} value={u.id}>{u.number}</MenuItem>)}
                </Select>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions><Button onClick={() => setShowForm(false)}>Cancelar</Button><Button type="submit" variant="contained">Registrar</Button></DialogActions>
        </form>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
