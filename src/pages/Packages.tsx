import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Typography, Card, CardContent, Grid, TextField, Button, Select, MenuItem,
  Table, TableBody, TableCell, TableHead, TableRow, Box, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, InputAdornment
} from '@mui/material';
import { Search, CheckCircle } from '@mui/icons-material';

export default function Packages() {
  const [packages, setPackages] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [unitId, setUnitId] = useState('');
  const [description, setDescription] = useState('');
  const [carrier, setCarrier] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => { loadData(); }, [filterStatus]);

  async function loadData() {
    try {
      const [pkgRes, unitRes, countRes] = await Promise.all([
        api.get('/packages', { params: { status: filterStatus } }),
        api.get('/units'),
        api.get('/packages/pending-count')
      ]);
      setPackages(pkgRes.data);
      setUnits(unitRes.data);
      setPendingCount(countRes.data);
    } catch (error) {
      console.error('Erro ao carregar:', error);
    }
  }

  async function createPackage(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/packages', { unitId, description, carrier, trackingCode, notes });
      setSnackbar({ open: true, message: 'Encomenda registrada!', severity: 'success' });
      setShowForm(false);
      setUnitId(''); setDescription(''); setCarrier(''); setTrackingCode(''); setNotes('');
      loadData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao registrar', severity: 'error' });
    }
  }

  async function markRetrieved(id: string) {
    const name = prompt('Nome de quem retirou:');
    if (!name) return;
    await api.put(`/packages/${id}/retrieve`, { retrievedBy: name });
    loadData();
  }

  const filteredPackages = packages.filter(pkg =>
    pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.unit?.number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18 }}>📦 Encomendas</Typography>
          <Typography variant="caption" color="textSecondary">{pendingCount} pendente(s)</Typography>
        </Box>
        <Button variant="contained" size="small" onClick={() => setShowForm(true)}>+ Registrar Encomenda</Button>
      </Box>

      <Card sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField fullWidth size="small" placeholder="Buscar..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <Select fullWidth size="small" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} displayEmpty>
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="PENDING">Pendentes</MenuItem>
                <MenuItem value="RETRIEVED">Retiradas</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">{filteredPackages.length} encomenda(s)</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Unidade</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Transportadora</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPackages.map(pkg => (
              <TableRow key={pkg.id} hover>
                <TableCell>
                  <Typography variant="caption">{new Date(pkg.arrivedAt).toLocaleDateString('pt-BR')}</Typography>
                </TableCell>
                <TableCell><Chip label={`Unid. ${pkg.unit?.number}`} size="small" variant="outlined" /></TableCell>
                <TableCell><Typography variant="body2" sx={{ fontSize: 12 }}>{pkg.description}</Typography></TableCell>
                <TableCell><Typography variant="caption">{pkg.carrier || '-'}</Typography></TableCell>
                <TableCell>
                  <Chip label={pkg.status === 'PENDING' ? 'Pendente' : 'Retirado'}
                    color={pkg.status === 'PENDING' ? 'warning' : 'success'} size="small" sx={{ fontSize: 11 }} />
                </TableCell>
                <TableCell>
                  {pkg.status === 'PENDING' && (
                    <IconButton size="small" color="success" onClick={() => markRetrieved(pkg.id)}>
                      <CheckCircle fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>📦 Registrar Encomenda</DialogTitle>
        <form onSubmit={createPackage}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Select fullWidth value={unitId} onChange={e => setUnitId(e.target.value)} displayEmpty required>
                  <MenuItem value="" disabled>Selecione a unidade</MenuItem>
                  {units.map(u => <MenuItem key={u.id} value={u.id}>Unidade {u.number}</MenuItem>)}
                </Select>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Descrição" value={description} onChange={e => setDescription(e.target.value)} required size="small" />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Transportadora" value={carrier} onChange={e => setCarrier(e.target.value)} size="small" />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Código de Rastreio" value={trackingCode} onChange={e => setTrackingCode(e.target.value)} size="small" />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Observações" value={notes} onChange={e => setNotes(e.target.value)} size="small" multiline rows={2} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowForm(false)} size="small">Cancelar</Button>
            <Button type="submit" variant="contained" size="small">Registrar</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
