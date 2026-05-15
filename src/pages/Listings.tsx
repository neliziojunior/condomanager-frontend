import { useState, useEffect } from 'react';
import api from '../services/api';
import { Typography, Card, CardContent, Grid, TextField, Button, Select, MenuItem, Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, InputAdornment } from '@mui/material';
import { Add, Store, AttachMoney } from '@mui/icons-material';

export default function Listings() {
  const [listings, setListings] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('SERVICE');

  useEffect(() => { loadListings(); }, [filterType]);

  async function loadListings() {
    const { data } = await api.get('/listings', { params: { type: filterType } });
    setListings(data);
  }

  async function createListing(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/listings', { title, description, price: price ? Number(price) : undefined, type });
    setSnackbar({ open: true, message: 'Anúncio criado!', severity: 'success' });
    setShowForm(false); setTitle(''); setDescription(''); setPrice('');
    loadListings();
  }

  async function deactivate(id: string) {
    await api.put(`/listings/${id}/deactivate`);
    loadListings();
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h6" fontWeight={700}>🛒 Classificados</Typography>
          <Typography variant="caption" color="textSecondary">Serviços e produtos entre vizinhos</Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<Add />} onClick={() => setShowForm(true)}>Anunciar</Button>
      </Box>

      <Card sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Select fullWidth size="small" value={filterType} onChange={e => setFilterType(e.target.value)} displayEmpty>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="SERVICE">Serviços</MenuItem>
            <MenuItem value="PRODUCT">Produtos</MenuItem>
            <MenuItem value="RENTAL">Aluguel</MenuItem>
          </Select>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {listings.map(item => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Chip 
                    label={item.type === 'SERVICE' ? '🔧 Serviço' : item.type === 'PRODUCT' ? '📦 Produto' : '🏠 Aluguel'} 
                    size="small" 
                    color={item.type === 'SERVICE' ? 'primary' : item.type === 'PRODUCT' ? 'secondary' : 'info'} 
                  />
                  {item.price && (
                    <Chip icon={<AttachMoney />} label={`R$ ${item.price.toFixed(2)}`} size="small" color="success" variant="outlined" />
                  )}
                </Box>
                <Typography fontWeight={600} mb={0.5}>{item.title}</Typography>
                <Typography variant="body2" color="textSecondary">{item.description}</Typography>
              </CardContent>
              <Box sx={{ p: 1.5, pt: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption">Por: {item.person?.name}</Typography>
                <Button size="small" color="error" onClick={() => deactivate(item.id)}>Remover</Button>
              </Box>
            </Card>
          </Grid>
        ))}
        {listings.length === 0 && (
          <Grid item xs={12}>
            <Card><CardContent sx={{ textAlign: 'center', py: 4 }}><Typography color="textSecondary">Nenhum anúncio</Typography></CardContent></Card>
          </Grid>
        )}
      </Grid>

      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>🛒 Novo Anúncio</DialogTitle>
        <form onSubmit={createListing}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}><TextField fullWidth label="Título" size="small" value={title} onChange={e => setTitle(e.target.value)} required /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Descrição" size="small" value={description} onChange={e => setDescription(e.target.value)} required multiline rows={2} /></Grid>
              <Grid item xs={6}>
                <Select fullWidth size="small" value={type} onChange={e => setType(e.target.value)}>
                  <MenuItem value="SERVICE">Serviço</MenuItem><MenuItem value="PRODUCT">Produto</MenuItem><MenuItem value="RENTAL">Aluguel</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Preço R$" type="number" size="small" value={price} onChange={e => setPrice(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions><Button onClick={() => setShowForm(false)}>Cancelar</Button><Button type="submit" variant="contained">Anunciar</Button></DialogActions>
        </form>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
