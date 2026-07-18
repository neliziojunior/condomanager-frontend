import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Typography, Card, CardContent, TextField, Button, Box, Alert
} from '@mui/material';
import { Apartment } from '@mui/icons-material';

export default function SetupCondominium() {
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [address, setAddress] = useState('');
  const [monthlyFee, setMonthlyFee] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
        cnpj: cnpj || undefined,
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
      bgcolor: '#F7F9FC' 
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
              label="CNPJ (opcional)"
              value={cnpj}
              onChange={e => setCnpj(e.target.value)}
              size="small"
              sx={{ mb: 2 }}
              placeholder="00.000.000/0000-00"
            />
            <TextField
              fullWidth
              label="Endereço"
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
              size="small"
              sx={{ mb: 2 }}
              placeholder="Rua das Flores, 123"
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
              InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#6B7280' }}>R$</Typography> }}
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
