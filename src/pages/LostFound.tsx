import { useState, useEffect } from 'react';
import api from '../services/api';
import { Typography, Card, CardContent, Grid, TextField, Button, Select, MenuItem, Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar } from '@mui/material';
import { Add, Search, CheckCircle } from '@mui/icons-material';

export default function LostFound() {
  const [items, setItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('FOUND');
  const [location, setLocation] = useState('');

  useEffect(() => { loadItems(); }, [filterType]);

  async function loadItems() {
    const { data } = await api.get('/lostfound', { params: { type: filterType } });
    setItems(data);
  }

  async function createItem(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/lostfound', { title, description, type, location });
    setSnackbar({ open: true, message: 'Publicado!', severity: 'success' });
    setShowForm(false); setTitle(''); setDescription(''); setLocation(''); loadItems();
  }

  async function resolve(id: string) {
    await api.put(`/lostfound/${id}/resolve`);
    loadItems();
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h6" fontWeight={700}>🔍 Achados e Perdidos</Typography>
        <Button variant="contained" size="small" startIcon={<Add />} onClick={() => setShowForm(true)}>Publicar</Button>
      </Box>
      <Card sx={{ mb: 2, borderRadius: 2 }}><CardContent sx={{ p: 2 }}>
        <Select fullWidth size="small" value={filterType} onChange={e => setFilterType(e.target.value)} displayEmpty>
          <MenuItem value="">Todos</MenuItem><MenuItem value="FOUND">Achados</MenuItem><MenuItem value="LOST">Perdidos</MenuItem>
        </Select>
      </CardContent></Card>
      <Grid container spacing={2}>
        {items.map(item => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card sx={{ borderRadius: 2, opacity: item.status === 'RESOLVED' ? 0.6 : 1, borderLeft: `4px solid ${item.type === 'FOUND' ? '#27ae60' : '#e74c3c'}` }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between">
                  <Chip label={item.type === 'FOUND' ? '✅ Achado' : '❌ Perdido'} size="small" color={item.type === 'FOUND' ? 'success' : 'error'} />
                  {item.status !== 'RESOLVED' && (
                    <Button size="small" onClick={() => resolve(item.id)} startIcon={<CheckCircle />}>Resolver</Button>
                  )}
                </Box>
                <Typography fontWeight={600} mt={1}>{item.title}</Typography>
                <Typography variant="body2" color="textSecondary">{item.description}</Typography>
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography variant="caption">{item.location || 'Local não informado'}</Typography>
                  <Typography variant="caption">{item.person?.name}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>🔍 Publicar</DialogTitle>
        <form onSubmit={createItem}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}><TextField fullWidth label="Título" size="small" value={title} onChange={e => setTitle(e.target.value)} required /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Descrição" size="small" value={description} onChange={e => setDescription(e.target.value)} required multiline rows={2} /></Grid>
              <Grid item xs={6}>
                <Select fullWidth size="small" value={type} onChange={e => setType(e.target.value)}>
                  <MenuItem value="FOUND">✅ Achei</MenuItem><MenuItem value="LOST">❌ Perdi</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={6}><TextField fullWidth label="Local" size="small" value={location} onChange={e => setLocation(e.target.value)} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions><Button onClick={() => setShowForm(false)}>Cancelar</Button><Button type="submit" variant="contained">Publicar</Button></DialogActions>
        </form>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
