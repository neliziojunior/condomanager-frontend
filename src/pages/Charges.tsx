import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Typography, Card, CardContent, Grid, TextField, Button, Select, MenuItem,
  Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar,
  Table, TableBody, TableCell, TableHead, TableRow, Alert, IconButton,
  InputAdornment
} from '@mui/material';
import { 
  Add, Pix, Receipt, ContentCopy, WhatsApp, 
  CheckCircle, Download, Visibility
} from '@mui/icons-material';

export default function Charges() {
  const [charges, setCharges] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chargeResult, setChargeResult] = useState<any>(null);
  const [showPixModal, setShowPixModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [unitId, setUnitId] = useState('');
  const [description, setDescription] = useState('Taxa Condominial');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [type, setType] = useState<'PIX' | 'BOLETO'>('PIX');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [chargesRes, unitsRes] = await Promise.all([
        api.get('/charges'),
        api.get('/units'),
      ]);
      setCharges(chargesRes.data);
      setUnits(unitsRes.data);
    } catch (error) {
      console.error('Erro:', error);
    }
  }

  async function createCharge(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/charges', {
        unitId,
        description,
        amount: Number(amount),
        dueDate,
        type,
      });

      setChargeResult(data);
      setShowForm(false);
      setShowPixModal(true);
      loadData();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Erro ao gerar cobrança',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  function copyPix() {
    if (chargeResult?.asaas?.pixCopiaCola) {
      navigator.clipboard.writeText(chargeResult.asaas.pixCopiaCola);
      setSnackbar({ open: true, message: '✅ Pix copiado!', severity: 'success' });
    }
  }

  function sendWhatsApp() {
    if (!chargeResult) return;
    const message = type === 'PIX'
      ? `💳 *Cobrança CondoPro*\n\n📝 ${description}\n💰 Valor: R$ ${Number(amount).toFixed(2)}\n📅 Vencimento: ${new Date(dueDate).toLocaleDateString('pt-BR')}\n\n🔑 Pix Copia e Cola:\n${chargeResult.asaas?.pixCopiaCola || ''}`
      : `📄 *Cobrança CondoPro*\n\n📝 ${description}\n💰 Valor: R$ ${Number(amount).toFixed(2)}\n📅 Vencimento: ${new Date(dueDate).toLocaleDateString('pt-BR')}\n\n🔗 Boleto: ${chargeResult.asaas?.bankSlipUrl || ''}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>💳 Cobranças</Typography>
          <Typography variant="caption" color="textSecondary">
            {charges.length} cobrança(s) gerada(s)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<Pix />}
            onClick={() => { setType('PIX'); setShowForm(true); }}
            sx={{ bgcolor: '#00A896' }}
          >
            Gerar Pix
          </Button>
          <Button
            variant="contained"
            startIcon={<Receipt />}
            onClick={() => { setType('BOLETO'); setShowForm(true); }}
            color="primary"
          >
            Gerar Boleto
          </Button>
        </Box>
      </Box>

      {/* Tabela de Cobranças */}
      <Card sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Unidade</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell align="right">Valor</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {charges.map(charge => (
              <TableRow key={charge.id} hover>
                <TableCell>{new Date(charge.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>
                  <Chip label={`Unid. ${charge.unit?.number}`} size="small" variant="outlined" />
                </TableCell>
                <TableCell>{charge.description}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>R$ {charge.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    label={charge.type === 'PIX' ? '💠 Pix' : '📄 Boleto'}
                    size="small"
                    color={charge.type === 'PIX' ? 'success' : 'primary'}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={charge.status === 'PENDING' ? 'Pendente' : charge.status === 'RECEIVED' ? 'Recebido' : charge.status}
                    size="small"
                    color={charge.status === 'RECEIVED' ? 'success' : 'warning'}
                  />
                </TableCell>
                <TableCell>
                  {charge.invoiceUrl && (
                    <IconButton size="small" href={charge.invoiceUrl} target="_blank">
                      <Visibility fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {charges.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="textSecondary" py={3}>Nenhuma cobrança gerada</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal Gerar Cobrança */}
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {type === 'PIX' ? '💠 Gerar Pix' : '📄 Gerar Boleto'}
        </DialogTitle>
        <form onSubmit={createCharge}>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              A cobrança será gerada na conta Asaas do condomínio
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Select fullWidth value={unitId} onChange={e => setUnitId(e.target.value)} displayEmpty required size="small">
                  <MenuItem value="" disabled>Selecione a unidade</MenuItem>
                  {units.map(u => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.block && `${u.block} - `}Unidade {u.number}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descrição"
                  size="small"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Valor R$"
                  type="number"
                  size="small"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                  inputProps={{ step: "0.01", min: "0" }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Vencimento"
                  type="date"
                  size="small"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={type === 'PIX' ? <Pix /> : <Receipt />}
            >
              {loading ? 'Gerando...' : 'Gerar Cobrança'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal Resultado (Pix/Boleto) */}
      <Dialog open={showPixModal} onClose={() => setShowPixModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          ✅ Cobrança Gerada!
        </DialogTitle>
        <DialogContent>
          {chargeResult && (
            <Box>
              <Grid container spacing={3}>
                {chargeResult.asaas?.pixQrCode && (
                  <Grid item xs={12} sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="textSecondary">QR Code Pix:</Typography>
                    <Box sx={{ mt: 1 }}>
                      <img
                        src={`data:image/png;base64,${chargeResult.asaas.pixQrCode}`}
                        alt="QR Code"
                        style={{ width: 250, height: 250, borderRadius: 8 }}
                      />
                    </Box>
                  </Grid>
                )}

                <Grid item xs={12}>
                  {chargeResult.asaas?.pixCopiaCola && (
                    <Box>
                      <Typography variant="caption" color="textSecondary">Pix Copia e Cola:</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={chargeResult.asaas.pixCopiaCola}
                        multiline
                        rows={3}
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={copyPix}><ContentCopy /></IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                  )}

                  {chargeResult.asaas?.bankSlipUrl && (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        href={chargeResult.asaas.bankSlipUrl}
                        target="_blank"
                        startIcon={<Download />}
                        fullWidth
                      >
                        📄 Baixar Boleto
                      </Button>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<WhatsApp />}
                    onClick={sendWhatsApp}
                    fullWidth
                    sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#1ebe57' } }}
                  >
                    📱 Enviar por WhatsApp
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPixModal(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity as any}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
