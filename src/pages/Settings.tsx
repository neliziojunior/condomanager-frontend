import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Typography, Card, CardContent, Grid, TextField, Button, Box, 
  Alert, Snackbar, Chip, Divider, Switch, FormControlLabel, CircularProgress
} from '@mui/material';
import { Save, Payment, Lock, CheckCircle } from '@mui/icons-material';

export default function Settings() {
  const [asaasApiKey, setAsaasApiKey] = useState('');
  const [asaasWalletId, setAsaasWalletId] = useState('');
  const [asaasEnabled, setAsaasEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      const { data } = await api.get('/condominium/me');
      setAsaasEnabled(data.asaasEnabled || false);
      // Não carregamos a API key por segurança - só se está configurada
      if (data.asaasApiKey) {
        setAsaasApiKey('••••••••••••••••••••');
      }
    } catch (error) {
      console.error('Erro ao carregar config:', error);
    }
  }

  async function testConnection() {
    if (!asaasApiKey || asaasApiKey.includes('•')) {
      setSnackbar({ open: true, message: 'Cole a API Key primeiro', severity: 'warning' });
      return;
    }
    setTesting(true);
    setConnectionStatus('testing');
    
    try {
      await api.post('/condominium/test-asaas', { asaasApiKey });
      setConnectionStatus('success');
      setSnackbar({ open: true, message: '✅ Conexão com Asaas bem-sucedida!', severity: 'success' });
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
        asaasApiKey,
        asaasWalletId,
        asaasEnabled,
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
              💳 Configuração de Pagamentos (Asaas)
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            Cole aqui as credenciais da sua conta Asaas. O sistema usará essas credenciais
            para gerar boletos e Pix em nome do seu condomínio.
            <br /><br />
            <strong>Como obter:</strong>
            <br />
            1. Acesse <a href="https://www.asaas.com" target="_blank" rel="noopener">asaas.com</a>
            <br />
            2. Vá em <strong>Integrações → Chave de API</strong>
            <br />
            3. Copie a chave e cole abaixo
          </Alert>

          {/* Ativar/Desativar */}
          <FormControlLabel
            control={
              <Switch 
                checked={asaasEnabled} 
                onChange={e => setAsaasEnabled(e.target.checked)} 
                color="primary"
              />
            }
            label={asaasEnabled ? '✅ Pagamentos ativos' : '❌ Pagamentos desativados'}
            sx={{ mb: 2 }}
          />

          <Divider sx={{ my: 2 }} />

          {/* API Key */}
          <TextField
            fullWidth
            label="API Key do Asaas"
            value={asaasApiKey}
            onChange={e => setAsaasApiKey(e.target.value)}
            size="small"
            sx={{ mb: 2 }}
            placeholder="$aact_xxxxxxxxxxxxxxxxxxxxx"
            type="password"
            InputProps={{
              startAdornment: <Lock sx={{ mr: 1, color: '#6B7280', fontSize: 20 }} />,
            }}
            helperText="Sua API Key fica criptografada no banco de dados"
          />

          {/* Wallet ID */}
          <TextField
            fullWidth
            label="Wallet ID (opcional)"
            value={asaasWalletId}
            onChange={e => setAsaasWalletId(e.target.value)}
            size="small"
            sx={{ mb: 3 }}
            placeholder="wallet_xxxxxxxxxxxxxx"
            helperText="Usado para identificar sua conta no Asaas"
          />

          {/* Status da conexão */}
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
