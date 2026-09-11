import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Typography, Card, CardContent, Grid, TextField, Button, Box, 
  Alert, Snackbar, Chip, Divider, Switch, FormControlLabel, CircularProgress,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Save, Payment, Lock, CheckCircle } from '@mui/icons-material';

// ✅ Provedores suportados
const PROVIDERS = [
  { value: 'ASAAS', label: '🔵 Asaas' },
  { value: 'PJBank', label: '🟢 PJBank' },
  { value: 'MERCADO_PAGO', label: '🟡 Mercado Pago' },
  { value: 'GERENCIANET', label: '🟣 Gerencianet' },
  { value: 'EFI', label: '🔷 Efí (Gerencianet)' },
  { value: 'OUTRO', label: '⚙️ Outro' },
];

export default function Settings() {
  const [provider, setProvider] = useState('ASAAS');
  const [apiKey, setApiKey] = useState('');
  const [walletId, setWalletId] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      const { data } = await api.get('/condominium/me');
      setProvider(data.paymentProvider || 'ASAAS');
      setEnabled(data.paymentEnabled || false);
      if (data.paymentApiKey) {
        setApiKey('••••••••••••••••••••');
      }
    } catch (error) {
      console.error('Erro ao carregar config:', error);
    }
  }

  async function testConnection() {
    if (!apiKey || apiKey.includes('•')) {
      setSnackbar({ open: true, message: 'Cole a API Key primeiro', severity: 'warning' });
      return;
    }
    setTesting(true);
    
    try {
      await api.post('/condominium/test-payment', { provider, apiKey });
      setConnectionStatus('success');
      setSnackbar({ open: true, message: '✅ Conexão bem-sucedida!', severity: 'success' });
    } catch (error) {
      setConnectionStatus('error');
      setSnackbar({ open: true, message: '❌ Erro ao conectar. Verifique a API Key.', severity: 'error' });
    } finally {
      setTesting(false);
    }
  }

  async function salvar() {
    setLoading(true);
    try {
      await api.put('/condominium/payment-config', {
        provider,
        apiKey,
        walletId,
        enabled,
      });
      setSnackbar({ open: true, message: '💾 Configurações salvas!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao salvar', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={1}>
        ⚙️ Configurações
      </Typography>
      <Typography variant="caption" color="textSecondary" display="block" mb={3}>
        Configure os dados de pagamento do condomínio
      </Typography>

      {/* Pagamentos */}
      <Card sx={{ borderRadius: 2, maxWidth: 700 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Payment sx={{ color: '#00A896' }} />
            <Typography variant="h6" fontWeight={600}>
              💳 Configuração de Pagamentos
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            Escolha seu provedor de pagamentos e cole as credenciais da sua conta.
            O sistema usará essas credenciais para gerar boletos e Pix em nome do seu condomínio.
          </Alert>

          {/* Ativar/Desativar */}
          <FormControlLabel
            control={
              <Switch 
                checked={enabled} 
                onChange={e => setEnabled(e.target.checked)} 
                color="primary"
              />
            }
            label={enabled ? '✅ Pagamentos ativos' : '❌ Pagamentos desativados'}
            sx={{ mb: 2 }}
          />

          <Divider sx={{ my: 2 }} />

          {/* Provedor */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Provedor de Pagamento</InputLabel>
            <Select 
              value={provider} 
              label="Provedor de Pagamento"
              onChange={e => setProvider(e.target.value)}
            >
              {PROVIDERS.map(p => (
                <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* API Key */}
          <TextField
            fullWidth
            label="API Key / Token"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            size="small"
            sx={{ mb: 2 }}
            placeholder="Cole aqui sua chave de API"
            type="password"
            InputProps={{
              startAdornment: <Lock sx={{ mr: 1, color: '#6B7280', fontSize: 20 }} />,
            }}
            helperText="Sua chave fica criptografada no banco de dados"
          />

          {/* Wallet ID */}
          <TextField
            fullWidth
            label="Wallet ID / Client ID (opcional)"
            value={walletId}
            onChange={e => setWalletId(e.target.value)}
            size="small"
            sx={{ mb: 3 }}
            placeholder="Identificador adicional (se aplicável)"
            helperText="Usado para identificar sua conta no provedor"
          />

          {/* Status */}
          {connectionStatus === 'success' && (
            <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircle />}>
              ✅ Conexão testada com sucesso
            </Alert>
          )}
          {connectionStatus === 'error' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              ❌ Falha ao conectar. Verifique a API Key.
            </Alert>
          )}

          {/* Botões */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                fullWidth
                onClick={testConnection}
                disabled={testing}
                startIcon={testing ? <CircularProgress size={16} /> : <Payment />}
              >
                {testing ? 'Testando...' : 'Testar Conexão'}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                fullWidth
                onClick={salvar}
                disabled={loading}
                startIcon={<Save />}
                sx={{ bgcolor: '#00A896', '&:hover': { bgcolor: '#028090' } }}
              >
                {loading ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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

