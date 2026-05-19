import { useState, useEffect } from 'react';
import api from '../services/api';
import { Typography, Card, CardContent, Grid, TextField, Button, Select, MenuItem, Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Table, TableBody, TableCell, TableHead, TableRow, LinearProgress } from '@mui/material';
import { Add, Delete, Edit, Warning, Inventory as InventoryIcon } from '@mui/icons-material';

export default function Inventory() {
  const [items, setItems] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [name, setName] = useState('');
  const [category, setCategory] = useState('LIMPEZA');
  const [quantity, setQuantity] = useState('');
  const [minQuantity, setMinQuantity] = useState('5');
  const [unit, setUnit] = useState('un');
  const [price, setPrice] = useState('');
  const [supplier, setSupplier] = useState('');

  useEffect(() => { loadData(); }, [filterCategory]);

  async function loadData() {
    const [itemsRes, lowRes] = await Promise.all([
      api.get('/inventory', { params: { category: filterCategory } }),
      api.get('/inventory/low-stock')
    ]);
    setItems(itemsRes.data);
    setLowStock(lowRes.data);
  }

  function openEdit(item: any) {
    setEditingId(item.id);
    setName(item.name);
    setCategory(item.category);
    setQuantity(item.quantity.toString());
    setMinQuantity(item.minQuantity.toString());
    setUnit(item.unit);
    setPrice(item.price?.toString() || '');
    setSupplier(item.supplier || '');
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { name, category, quantity: Number(quantity), minQuantity: Number(minQuantity), unit, price: price ? Number(price) : undefined, supplier };
    if (editingId) {
      await api.put(`/inventory/${editingId}`, payload);
    } else {
      await api.post('/inventory', payload);
    }
    setSnackbar({ open: true, message: editingId ? 'Atualizado!' : 'Criado!', severity: 'success' });
    setShowForm(false); setName(''); setQuantity(''); setMinQuantity('5'); setPrice(''); setSupplier(''); setEditingId(null);
    loadData();
  }

  async function deleteItem(id: string) {
    if (!confirm('Excluir este item?')) return;
    await api.delete(`/inventory/${id}`);
    loadData();
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h6" fontWeight={700}>📦 Estoque</Typography>
          <Typography variant="caption" color="textSecondary">
            {lowStock.length} item(ns) com estoque baixo
          </Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<Add />} onClick={() => { setEditingId(null); setShowForm(true); }}>
          Novo Item
        </Button>
      </Box>

      {/* Alertas de estoque baixo */}
      {lowStock.length > 0 && (
        <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid #F0A500' }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} color="#F0A500" mb={1}>⚠️ Estoque Baixo</Typography>
            <Grid container spacing={1}>
              {lowStock.map(item => (
                <Grid item key={item.id}><Chip icon={<Warning />} label={`${item.name}: ${item.quantity} ${item.unit}`} size="small" color="warning" /></Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Select fullWidth size="small" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} displayEmpty>
            <MenuItem value="">Todas categorias</MenuItem>
            <MenuItem value="LIMPEZA">Limpeza</MenuItem>
            <MenuItem value="MANUTENCAO">Manutenção</MenuItem>
            <MenuItem value="ESCRITORIO">Escritório</MenuItem>
            <MenuItem value="JARDINAGEM">Jardinagem</MenuItem>
            <MenuItem value="OUTROS">Outros</MenuItem>
          </Select>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell><TableCell>Categoria</TableCell><TableCell>Qtd</TableCell><TableCell>Estoque</TableCell><TableCell>Valor</TableCell><TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.id} sx={{ bgcolor: item.quantity <= item.minQuantity ? '#FFF5F5' : 'transparent' }}>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
                  <Typography variant="caption" color="textSecondary">{item.supplier || ''}</Typography>
                </TableCell>
                <TableCell><Chip label={item.category} size="small" /></TableCell>
                <TableCell>{item.quantity} {item.unit}</TableCell>
                <TableCell>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min((item.quantity / item.minQuantity) * 100, 100)} 
                    sx={{ height: 6, borderRadius: 3, width: 80 }}
                    color={item.quantity <= item.minQuantity ? 'error' : 'success'}
                  />
                </TableCell>
                <TableCell>{item.price ? `R$ ${item.price.toFixed(2)}` : '-'}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => openEdit(item)}><Edit fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => deleteItem(item.id)}><Delete fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? '✏️ Editar' : '📦 Novo'} Item</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={8}><TextField fullWidth label="Nome" size="small" value={name} onChange={e => setName(e.target.value)} required /></Grid>
              <Grid item xs={4}>
                <Select fullWidth size="small" value={category} onChange={e => setCategory(e.target.value)}>
                  <MenuItem value="LIMPEZA">Limpeza</MenuItem><MenuItem value="MANUTENCAO">Manutenção</MenuItem><MenuItem value="ESCRITORIO">Escritório</MenuItem><MenuItem value="JARDINAGEM">Jardinagem</MenuItem><MenuItem value="OUTROS">Outros</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={4}><TextField fullWidth label="Quantidade" type="number" size="small" value={quantity} onChange={e => setQuantity(e.target.value)} required /></Grid>
              <Grid item xs={4}><TextField fullWidth label="Mínimo" type="number" size="small" value={minQuantity} onChange={e => setMinQuantity(e.target.value)} /></Grid>
              <Grid item xs={4}><TextField fullWidth label="Unidade" size="small" value={unit} onChange={e => setUnit(e.target.value)} /></Grid>
              <Grid item xs={6}><TextField fullWidth label="Preço (R$)" type="number" size="small" value={price} onChange={e => setPrice(e.target.value)} /></Grid>
              <Grid item xs={6}><TextField fullWidth label="Fornecedor" size="small" value={supplier} onChange={e => setSupplier(e.target.value)} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">{editingId ? 'Atualizar' : 'Salvar'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} />
    </Box>
  );
}
