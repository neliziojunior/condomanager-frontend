import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Typography, Card, CardContent, TextField, Button, Box, Alert, 
  InputAdornment, CircularProgress, Chip
} from '@mui/material';
import { Apartment, Search, CheckCircle } from '@mui/icons-material';

export default function SetupCondominium() {
  const [cnpj, setCnpj] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [monthlyFee, setMonthlyFee] = useState('');
  const [loading, setLoading] = useState(false);
  const [buscandoCnpj, setBuscandoCnpj] = useState(false);
  const [error, setError] = useState('');
  const [cnpjEncontrado, setCnpjEncontrado] = useState(false);
  const navigate = useNavigate();

  // ✅ Buscar CNPJ na BrasilAPI
  async function buscarCnpj() {
    if (!cnpj) return;
    setBuscandoCnpj(true);
    setError('');
    
    try {
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      const { data } = await api.get(`/company/cnpj/${cnpjLimpo}`);
      
      setName(data.razaoSocial);
      setAddress(data.endereco.enderecoCompleto);
      setCnpjEncontrado(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'CNPJ não encontrado');
      setCnpjEncontrado(false);
    } finally {
      setBuscandoCnpj(false);
    }
  }

  // Formatar CNPJ visualmente
  function formatarCnpj(valor: string) {
    const limpo = valor.replace(/\D/g, '').slice(0, 14);
    return limpo
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !address) {
      setError('Nome e endereço são obrigatórios');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await api.post('/condominium', {
        name,
        cnpj: cnpj.replace(/\D/g, '') || undefined,
        address,
        monthlyFee: monthlyFee ? Number(monthlyFee) : undefined,
      });
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao cadastrar condomínio');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      bgcolor: '#F7F9FC',
      py: 4
    }}>
      <Card sx={{ maxWidth: 500, width: '100%', mx: 2, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ 
              bgcolor: '#00A896', 
              borderRadius: 3, 
              width: 60, 
              height: 60, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mx: 'auto',
              mb: 2
            }}>
              <Apartment sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Typography variant="h5" fontWeight={700}>
              🏢 Bem-vindo ao CondoPro!
            </Typography>
            <Typography variant="body2" color="textSecondary" mt={1}>
              Cadastre seu condomínio para começar
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}

          <form onSubmit={handleSubmit}>
            {/* ✅ CAMPO CNPJ COM BUSCA */}
            <TextField
              fullWidth
              label="CNPJ do Condomínio"
              value={cnpj}
              onChange={e => setCnpj(formatarCnpj(e.target.value))}
              size="small"
              sx={{ mb: 2 }}
              placeholder="00.000.000/0000-00"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button 
                      onClick={buscarCnpj}
                      disabled={buscandoCnpj || cnpj.replace(/\D/g, '').length !== 14}
                      size="small"
                      startIcon={buscandoCnpj ? <CircularProgress size={16} /> : <Search />}
                    >
                      Buscar
                    </Button>
                  </InputAdornment>
                )
              }}
            />

            {cnpjEncontrado && (
              <Chip 
                icon={<CheckCircle />} 
                label="Dados preenchidos automaticamente" 
                color="success" 
                size="small" 
                sx={{ mb: 2 }} 
              />
            )}

            <TextField
              fullWidth
              label="Nome do Condomínio"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              size="small"
              sx={{ mb: 2 }}
              placeholder="Ex: Residencial Primavera"
            />

            <TextField
              fullWidth
              label="Endereço Completo"
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
              size="small"
              sx={{ mb: 2 }}
              multiline
              rows={2}
              placeholder="Rua das Flores, 123 - Centro, São Paulo/SP"
            />

            <TextField
              fullWidth
              label="Taxa Condominial Mensal (opcional)"
              value={monthlyFee}
              onChange={e => setMonthlyFee(e.target.value)}
              type="number"
              size="small"
              sx={{ mb: 3 }}
              placeholder="350.00"
              InputProps={{ 
                startAdornment: <Typography sx={{ mr: 1, color: '#6B7280' }}>R$</Typography> 
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ py: 1.5, borderRadius: 2, bgcolor: '#00A896', '&:hover': { bgcolor: '#028090' } }}
            >
              {loading ? 'Cadastrando...' : '🏢 Cadastrar Condomínio'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
