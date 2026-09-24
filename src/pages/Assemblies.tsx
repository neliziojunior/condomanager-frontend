import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Typography, Card, CardContent, Grid, TextField, Button, Box, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Table,
  TableBody, TableCell, TableHead, TableRow, Avatar
} from '@mui/material';
import { Add, HowToVote, CheckCircle, Cancel, People, Download, Edit } from '@mui/icons-material';

export default function Assemblies() {
  const [assemblies, setAssemblies] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showPresence, setShowPresence] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');

  const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3333'
    : 'https://condpro.onrender.com';

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [assRes, pendRes] = await Promise.all([
      api.get('/assemblies'),
      api.get('/assemblies/pending'),
    ]);
    setAssemblies(assRes.data);
    setPending(pendRes.data);
  }

  async function createAssembly(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/assemblies', { title, description, date, location });
    setSnackbar({ open: true, message: 'Assembleia criada!', severity: 'success' });
    setShowForm(false);
    setTitle(''); setDescription(''); setDate(''); setLocation('');
    loadData();
  }

  async function confirmPresence(assemblyId: string, status: string) {
    await api.put(`/assemblies/${assemblyId}/confirm`, { status });
    loadData();
  }

  async function loadPresenceList(assemblyId: string) {
    const { data } = await api.get(`/assemblies/${assemblyId}/presence`);
    setShowPresence({ assemblyId, list: data });
  }

  function downloadPdf(assemblyId: string) {
    window.open(`${API_URL}/assemblies/${assemblyId}/pdf`, '_blank');
  }

  async function finishAssembly(assemblyId: string) {
    if (!confirm('Finalizar esta assembleia? Os moradores poderão assinar a ata.')) return;
    await api.post(`/assemblies/${assemblyId}/finish`);
    setSnackbar({ open: true, message: '✅ Assembleia finalizada! Ata pronta para assinatura.', severity: 'success' });
    loadData();
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>🗳️ Assembleias</Typography>
          <Typography variant="caption" color="textSecondary">
            {pending.length} confirmação(ões) pendente(s)
          </Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<Add />} onClick={() => setShowForm(true)}>
          Nova Assembleia
        </Button>
      </Box>

      {pending.length > 0 && (
        <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid #F0A500' }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} color="#F0A500" mb={2}>
              📋 Confirme sua Presença
            </Typography>
            {pending.map(p => (
              <Box key={p.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #F0F0F0' }}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{p.assembly?.title}</Typography>
                  <Typography variant="caption">{new Date(p.assembly?.date).toLocaleDateString('pt-BR')} • {p.assembly?.location}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" color="success" variant="contained" startIcon={<CheckCircle />} onClick={() => confirmPresence(p.assemblyId, 'PRESENT')}>
                    Presente
                  </Button>
                  <Button size="small" color="error" variant="outlined" startIcon={<Cancel />} onClick={() => confirmPresence(p.assemblyId, 'ABSENT')}>
                    Ausente
                  </Button>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      <Grid container spacing={2}>
        {assemblies.map(ass => (
          <Grid item xs={12} md={6} key={ass.id}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography fontWeight={600}>{ass.title}</Typography>
                  <Chip
                    label={ass.status}
                    size="small"
                    color={ass.status === 'SCHEDULED' ? 'primary' : ass.status === 'FINISHED' ? 'success' : 'warning'}
                  />
                </Box>
                <Typography variant="body2" color="textSecondary">{ass.description}</Typography>
                <Typography variant="caption" display="block" mt={1}>
                  📅 {new Date(ass.date).toLocaleDateString('pt-BR')} • 📍 {ass.location || 'Salão de Festas'}
                </Typography>
                <Box mt={2} display="flex" gap={2} flexWrap="wrap">
                  <Chip icon={<People />} label={`${ass.confirmations?.filter((c: any) => c.status === 'PRESENT').length || 0} presentes`} size="small" color="success" variant="outlined" />
                  <Chip icon={<Cancel />} label={`${ass.confirmations?.filter((c: any) => c.status === 'ABSENT').length || 0} ausentes`} size="small" color="error" variant="outlined" />
                  <Chip label={`${ass.confirmations?.filter((c: any) => c.status === 'PENDING').length || 0} pendentes`} size="small" variant="outlined" />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                  <Button size="small" onClick={() => loadPresenceList(ass.id)}>Ver Lista</Button>
                  <Button size="small" startIcon={<Download />} onClick={() => downloadPdf(ass.id)} color="secondary" variant="outlined">
                    📄 Ata PDF
                  </Button>
                  {ass.status !== 'FINISHED' && (
                    <Button size="small" startIcon={<Edit />} onClick={() => finishAssembly(ass.id)} color="warning" variant="outlined">
                      ✍️ Finalizar
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Modal Nova Assembleia */}
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>🗳️ Nova Assembleia</DialogTitle>
        <form onSubmit={createAssembly}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}><TextField fullWidth label="Título" size="small" value={title} onChange={e => setTitle(e.target.value)} required /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Pauta/Descrição" size="small" value={description} onChange={e => setDescription(e.target.value)} multiline rows={2} /></Grid>
              <Grid item xs={6}><TextField fullWidth label="Data" type="datetime-local" size="small" value={date} onChange={e => setDate(e.target.value)} required InputLabelProps={{ shrink: true }} /></Grid>
              <Grid item xs={6}><TextField fullWidth label="Local" size="small" value={location} onChange={e => setLocation(e.target.value)} placeholder="Salão de festas" /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">Criar</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal Lista de Presença */}
      <Dialog open={!!showPresence} onClose={() => setShowPresence(null)} maxWidth="sm" fullWidth>
        <DialogTitle>📋 Lista de Presença</DialogTitle>
        <DialogContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Morador</TableCell>
                <TableCell>Unidade</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {showPresence?.list?.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>{c.person?.name?.[0]}</Avatar>
                      <Typography variant="body2">{c.person?.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{c.person?.unit?.number || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={c.status === 'PRESENT' ? '✅ Presente' : c.status === 'ABSENT' ? '❌ Ausente' : '⏳ Pendente'}
                      size="small"
                      color={c.status === 'PRESENT' ? 'success' : c.status === 'ABSENT' ? 'error' : 'default'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions><Button onClick={() => setShowPresence(null)}>Fechar</Button></DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
