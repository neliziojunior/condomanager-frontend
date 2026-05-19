import { useState, useEffect } from 'react';
import api from '../services/api';
import { Typography, Card, CardContent, Grid, TextField, Button, Select, MenuItem, Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar } from '@mui/material';
import { Add, ExitToApp, People, QrCode, Download } from '@mui/icons-material';

export default function Visitors() {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [activeCount, setActiveCount] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [unitId, setUnitId] = useState('');
  
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrVisitor, setQrVisitor] = useState<any>(null);
  const [showQR, setShowQR] = useState(false);

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
    await api.post('/visitors', { name, document, unitId });
    setSnackbar({ open: true, message: 'Visitante registrado!', severity: 'success' });
    setShowForm(false); setName(''); setDocument(''); setUnitId('');
    loadData();
  }

  async function generateQR(e: React.FormEvent) {
    e.preventDefault();
    const { data } = await api.post('/visitors/generate-qr', { name, document, unitId });
    setQrCode(data.qrCode);
    setQrVisitor(data.visitor);
    setShowQR(true);
    setShowForm(false);
    setName(''); setDocument(''); setUnitId('');
    loadData();
  }

  async function registerExit(id: string) {
    await api.put(`/visitors/${id}/exit`);
    loadData();
  }

  function downloadQR() {
    if (!qrCode) return;
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `qr-code-${qrVisitor?.name || 'visitante'}.png`;
    link.click();
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h6" fontWeight={700}>📹 Visitantes</Typography>
          <Typography variant="caption" color="textSecondary">{activeCount} ativo(s) no momento</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" startIcon={<QrCode />} onClick={() => setShowForm(true)} color="secondary">
            Gerar QR Code
          </Button>
          <Button variant="contained" size="small" startIcon={<Add />} onClick={() => setShowForm(true)}>
            Registrar Entrada
          </Button>
        </Box>
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
                  <Typography variant="caption" color="textSecondary" display="block">
                    Entrada: {new Date(v.entryAt).toLocaleTimeString('pt-BR')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Modal de Registro */}
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>📹 Registrar Visitante</DialogTitle>
        <form onSubmit={createVisitor}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Select fullWidth value={unitId} onChange={e => setUnitId(e.target.value)} displayEmpty required size="small">
                  <MenuItem value="" disabled>Unidade do morador</MenuItem>
                  {units.map(u => <MenuItem key={u.id} value={u.id}>Unidade {u.number}</MenuItem>)}
                </Select>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Nome do visitante" size="small" value={name} onChange={e => setName(e.target.value)} required />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Documento (RG/CPF)" size="small" value={document} onChange={e => setDocument(e.target.value)} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={generateQR} variant="outlined" startIcon={<QrCode />} color="secondary">
              Gerar QR
            </Button>
            <Button type="submit" variant="contained">Registrar</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal QR Code */}
      <Dialog open={showQR} onClose={() => setShowQR(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>🔑 QR Code do Visitante</DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          {qrCode && (
            <>
              <Box sx={{ bgcolor: '#F7F9FC', p: 3, borderRadius: 3, mb: 2 }}>
                <img src={qrCode} alt="QR Code" style={{ width: '100%', maxWidth: 250 }} />
              </Box>
              <Typography variant="h6" fontWeight={600}>{qrVisitor?.name}</Typography>
              <Typography variant="body2" color="textSecondary">Unidade {qrVisitor?.unit?.number}</Typography>
              {qrVisitor?.document && <Typography variant="caption">📄 {qrVisitor.document}</Typography>}
              <Button variant="contained" startIcon={<Download />} onClick={downloadQR} sx={{ mt: 2 }} fullWidth>
                Baixar QR Code
              </Button>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                Apresente este QR Code na portaria para entrada rápida
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setShowQR(false)}>Fechar</Button></DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
