import { useState, useEffect } from 'react';
import api from '../services/api';
import { Typography, Card, CardContent, Grid, TextField, Button, Select, MenuItem, Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar } from '@mui/material';
import { Add, MeetingRoom } from '@mui/icons-material';

export default function Reservations() {
  const [spaces, setSpaces] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [spaceId, setSpaceId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [sp, un, re] = await Promise.all([api.get('/reservations/spaces'), api.get('/units'), api.get('/reservations')]);
    setSpaces(sp.data); setUnits(un.data); setReservations(re.data);
  }

  async function createReservation(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/reservations', { spaceId, unitId, date, startTime, endTime, purpose });
    setSnackbar({ open: true, message: 'Reserva criada!', severity: 'success' });
    setShowForm(false); loadData();
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>📅 Reservas</Typography>
        <Button variant="contained" size="small" startIcon={<Add />} onClick={() => setShowForm(true)}>Nova Reserva</Button>
      </Box>
      <Grid container spacing={2}>
        {reservations.map(res => (
          <Grid item xs={12} sm={6} md={4} key={res.id}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Chip icon={<MeetingRoom />} label={res.space?.name} size="small" color="primary" sx={{ mb: 1 }} />
                <Typography fontWeight={600}>{res.purpose || 'Reserva'}</Typography>
                <Typography variant="caption">{res.unit?.number} - {res.person?.name}</Typography>
                <Typography variant="caption" display="block">{new Date(res.date).toLocaleDateString('pt-BR')} {res.startTime}-{res.endTime}</Typography>
                <Chip label={res.status} size="small" color={res.status === 'APPROVED' ? 'success' : 'warning'} sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>📅 Nova Reserva</DialogTitle>
        <form onSubmit={createReservation}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}><Select fullWidth value={spaceId} onChange={e => setSpaceId(e.target.value)} displayEmpty required><MenuItem value="" disabled>Espaço</MenuItem>{spaces.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}</Select></Grid>
              <Grid item xs={12}><Select fullWidth value={unitId} onChange={e => setUnitId(e.target.value)} displayEmpty required><MenuItem value="" disabled>Unidade</MenuItem>{units.map(u => <MenuItem key={u.id} value={u.id}>{u.number}</MenuItem>)}</Select></Grid>
              <Grid item xs={6}><TextField fullWidth label="Data" type="date" value={date} onChange={e => setDate(e.target.value)} required InputLabelProps={{ shrink: true }} /></Grid>
              <Grid item xs={3}><TextField fullWidth label="Início" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required /></Grid>
              <Grid item xs={3}><TextField fullWidth label="Fim" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Finalidade" value={purpose} onChange={e => setPurpose(e.target.value)} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions><Button onClick={() => setShowForm(false)}>Cancelar</Button><Button type="submit" variant="contained">Reservar</Button></DialogActions>
        </form>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
