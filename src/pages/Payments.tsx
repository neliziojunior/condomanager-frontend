import { useState, useEffect } from 'react';
import api from '../services/api';
import { Typography, Card, CardContent, Grid, TextField, Button, Select, MenuItem, Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar } from '@mui/material';
import { Pix, AttachMoney, QrCode, WhatsApp, ContentCopy } from '@mui/icons-material';

export default function Payments() {
  const [units, setUnits] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [unitId, setUnitId] = useState('');
  const [description, setDescription] = useState('Taxa Condominial');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [type, setType] = useState<'PIX' | 'BOLETO'>('PIX');

  useEffect(() => { loadUnits(); }, []);

  async function loadUnits() {
    const { data } = await api.get('/units');
    setUnits(data);
  }

  async function createPayment(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data } = await api.post('/payments', { unitId, description, amount: Number(amount), dueDate, type });
      setPaymentResult(data);
      setSnackbar({ open: true, message: 'Cobrança gerada!', severity: 'success' });
      setShowForm(false);
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao gerar cobrança. Configure a chave Asaas.', severity: 'error' });
    }
  }

  // ✅ NOVO: Enviar cobrança por WhatsApp
  function sendViaWhatsApp() {
    if (!paymentResult) return;
    const message = type === 'PIX' 
      ? `💳 *CondoPro - Cobrança*\n\n📝 ${description}\n💰 Valor: R$ ${amount}\n📅 Vencimento: ${new Date(dueDate).toLocaleDateString('pt-BR')}\n\n🔑 *Pix Copia e Cola:*\n${paymentResult.pixCopiaCola || ''}\n\nOu acesse o QR Code no app.`
      : `📄 *CondoPro - Cobrança*\n\n📝 ${description}\n💰 Valor: R$ ${amount}\n📅 Vencimento: ${new Date(dueDate).toLocaleDateString('pt-BR')}\n\n🔗 Boleto: ${paymentResult.bankSlipUrl || ''}`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  }

  function copyPixCode() {
    if (paymentResult?.pixCopiaCola) {
      navigator.clipboard.writeText(paymentResult.pixCopiaCola);
      setSnackbar({ open: true, message: 'Pix copiado!', severity: 'success' });
    }
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={1}>💳 Cobranças</Typography>
      <Typography variant="caption" color="textSecondary" mb={3} display="block">
        Gere cobranças Pix ou Boleto para os moradores
      </Typography>

      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Button variant="contained" startIcon={<Pix />} onClick={() => { setType('PIX'); setShowForm(true); }} fullWidth sx={{ bgcolor: '#00A896' }}>
                Gerar Pix
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button variant="outlined" startIcon={<AttachMoney />} onClick={() => { setType('BOLETO'); setShowForm(true); }} fullWidth>
                Gerar Boleto
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Resultado */}
      {paymentResult && (
        <Card sx={{ borderRadius: 2, mb: 3, bgcolor: '#F0FDF9' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>✅ Cobrança Gerada!</Typography>
            
            <Grid container spacing={3}>
              {paymentResult.pixQrCodeUrl && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" gutterBottom display="block">QR Code Pix:</Typography>
                    <img src={paymentResult.pixQrCodeUrl} alt="QR Code" style={{ width: 200, height: 200, borderRadius: 8 }} />
                  </Box>
                </Grid>
              )}
              
              <Grid item xs={12} md={6}>
                {paymentResult.pixCopiaCola && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" gutterBottom display="block">Pix Copia e Cola:</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField fullWidth size="small" value={paymentResult.pixCopiaCola} multiline rows={3} InputProps={{ readOnly: true }} />
                      <Button variant="outlined" onClick={copyPixCode} size="small"><ContentCopy /></Button>
                    </Box>
                  </Box>
                )}
                
                {paymentResult.bankSlipUrl && (
                  <Box sx={{ mb: 2 }}>
                    <Button variant="contained" href={paymentResult.bankSlipUrl} target="_blank" startIcon={<AttachMoney />} fullWidth>
                      📄 Baixar Boleto
                    </Button>
                  </Box>
                )}

                {/* ✅ NOVO: Botão WhatsApp */}
                <Button 
                  variant="contained" 
                  startIcon={<WhatsApp />} 
                  onClick={sendViaWhatsApp} 
                  fullWidth 
                  sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#1ebe57' } }}
                >
                  📱 Enviar por WhatsApp
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{type === 'PIX' ? '💳 Gerar Pix' : '📄 Gerar Boleto'}</DialogTitle>
        <form onSubmit={createPayment}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Select fullWidth value={unitId} onChange={e => setUnitId(e.target.value)} displayEmpty required size="small">
                  <MenuItem value="" disabled>Selecione a unidade</MenuItem>
                  {units.map(u => <MenuItem key={u.id} value={u.id}>Unidade {u.number}</MenuItem>)}
                </Select>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Descrição" size="small" value={description} onChange={e => setDescription(e.target.value)} required />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Valor R$" type="number" size="small" value={amount} onChange={e => setAmount(e.target.value)} required inputProps={{ step: "0.01" }} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Vencimento" type="date" size="small" value={dueDate} onChange={e => setDueDate(e.target.value)} required InputLabelProps={{ shrink: true }} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">Gerar Cobrança</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} />
    </Box>
  );
}
