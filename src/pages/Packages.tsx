import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Typography, Card, CardContent, Grid, TextField, Button, Select, MenuItem,
  Table, TableBody, TableCell, TableHead, TableRow, Box, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, InputAdornment,
  Tooltip
} from '@mui/material';
import { Search, CheckCircle, QrCode, ContentCopy, WhatsApp } from '@mui/icons-material';

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
  const [pickupCode, setPickupCode] = useState(''); // ✅ NOVO: Código de retirada gerado
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

  // ✅ NOVO: Gerar código de retirada aleatório
  function generatePickupCode() {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setPickupCode(code);
  }

  async function createPackage(e: React.FormEvent) {
    e.preventDefault();
    if (!pickupCode) generatePickupCode(); // Gera se não tiver
    
    const code = pickupCode || Math.random().toString(36).substring(2, 8).toUpperCase();
    
    try {
      await api.post('/packages', { 
        unitId, description, carrier, trackingCode, 
        notes: code // Salvar código de retirada nas notas
      });
      setSnackbar({ open: true, message: 'Encomenda registrada!', severity: 'success' });
      setShowForm(false);
      setUnitId(''); setDescription(''); setCarrier(''); setTrackingCode(''); setPickupCode(''); setNotes('');
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

  // ✅ NOVO: Enviar código pelo WhatsApp
  function sendWhatsApp(phone: string, code: string, description: string) {
    const message = `📦 *CondoPro - Encomenda*\n\nSua encomenda "${description}" chegou!\n\n🔑 *Código de Retirada:* ${code}\n\nApresente este código na portaria.`;
    const url = `https://wa.me/55${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  // ✅ NOVO: Copiar código
  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setSnackbar({ open: true, message: 'Código copiado!', severity: 'success' });
  }

  const filteredPackages = packages.filter(pkg =>
    pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.unit?.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18 }}>📦 Encomendas</Typography>
          <Typography variant="caption" color="textSecondary">{pendingCount} pendente(s) de retirada</Typography>
        </Box>
        <Button variant="contained" size="small" onClick={() => setShowForm(true)}>
          + Registrar Encomenda
        </Button>
      </Box>

      <Card sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField fullWidth size="small" placeholder="Buscar por descrição, unidade ou código..." value={searchTerm}
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
              <TableCell>Código</TableCell>
              <TableCell>Transportadora</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPackages.map(pkg => (
              <TableRow key={pkg.id} hover sx={{ bgcolor: pkg.status === 'PENDING' ? '#FFFBF0' : 'transparent' }}>
                <TableCell>
                  <Typography variant="caption">{new Date(pkg.arrivedAt).toLocaleDateString('pt-BR')}</Typography>
                  <br />
                  <Typography variant="caption" color="textSecondary">
                    {new Date(pkg.arrivedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={`Unid. ${pkg.unit?.number}`} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: 12 }}>{pkg.description}</Typography>
                  {pkg.trackingCode && (
                    <Typography variant="caption" color="textSecondary">📮 {pkg.trackingCode}</Typography>
                  )}
                </TableCell>
                {/* ✅ NOVO: Coluna de Código */}
                <TableCell>
                  {pkg.notes && pkg.status === 'PENDING' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Chip 
                        label={pkg.notes} 
                        size="small" 
                        color="warning" 
                        sx={{ fontWeight: 700, fontSize: 12, letterSpacing: 1 }} 
                      />
                      <Tooltip title="Copiar código">
                        <IconButton size="small" onClick={() => copyCode(pkg.notes)}>
                          <ContentCopy sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="caption">{pkg.carrier || '-'}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={pkg.status === 'PENDING' ? 'Pendente' : 'Retirado'}
                    color={pkg.status === 'PENDING' ? 'warning' : 'success'} size="small" sx={{ fontSize: 11 }} />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {pkg.status === 'PENDING' && (
                      <>
                        {/* ✅ NOVO: Botão WhatsApp */}
                        <Tooltip title="Enviar código por WhatsApp">
                          <IconButton size="small" color="success" onClick={() => sendWhatsApp('11999999999', pkg.notes, pkg.description)}>
                            <WhatsApp fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Confirmar retirada">
                          <IconButton size="small" color="primary" onClick={() => markRetrieved(pkg.id)}>
                            <CheckCircle fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {filteredPackages.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="caption" color="textSecondary" sx={{ py: 4, display: 'block' }}>
                    📦 Nenhuma encomenda encontrada
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal Nova Encomenda */}
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>📦 Registrar Encomenda</DialogTitle>
        <form onSubmit={createPackage}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Select fullWidth value={unitId} onChange={e => setUnitId(e.target.value)} displayEmpty required size="small">
                  <MenuItem value="" disabled>Selecione a unidade</MenuItem>
                  {units.map(u => <MenuItem key={u.id} value={u.id}>Unidade {u.number}</MenuItem>)}
                </Select>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Descrição" value={description} onChange={e => setDescription(e.target.value)} required size="small" placeholder="Ex: Caixa dos Correios" />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Transportadora" value={carrier} onChange={e => setCarrier(e.target.value)} size="small" placeholder="Correios, Amazon..." />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Código de Rastreio" value={trackingCode} onChange={e => setTrackingCode(e.target.value)} size="small" />
              </Grid>
              {/* ✅ NOVO: Código de Retirada */}
              <Grid item xs={8}>
                <TextField fullWidth label="Código de Retirada" value={pickupCode} onChange={e => setPickupCode(e.target.value)} size="small" placeholder="Código para o morador retirar" />
              </Grid>
              <Grid item xs={4}>
                <Button fullWidth variant="outlined" onClick={generatePickupCode} sx={{ mt: 1 }} size="small">
                  🔑 Gerar
                </Button>
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

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} />
    </Box>
  );
}
