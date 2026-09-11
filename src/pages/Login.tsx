import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TextField, Button, Card, CardContent, Typography, Box, Divider, Alert } from '@mui/material';
import { Google } from '@mui/icons-material';

const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3333'
  : 'https://condpro.onrender.com';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ✅ Capturar token do Google OAuth
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('@condomanager:token', token);
      navigate('/dashboard');
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (error) {
      setError('Erro ao autenticar. Verifique os dados.');
    }
  }

  function handleGoogleLogin() {
    window.location.href = `${API_URL}/auth/google`;
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#F7F9FC' }}>
      <Card sx={{ maxWidth: 400, width: '100%', mx: 2, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" textAlign="center" gutterBottom sx={{ fontWeight: 700 }}>
            🏢 CondoPro
          </Typography>
          <Typography variant="body2" textAlign="center" color="textSecondary" mb={3}>
            Gestão Profissional de Condomínios
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* ✅ Botão Google */}
          <Button 
            variant="outlined" 
            fullWidth 
            onClick={handleGoogleLogin}
            startIcon={<Google />}
            sx={{ mb: 2, py: 1.5, borderRadius: 2, borderColor: '#E0E0E0', color: '#374151', '&:hover': { borderColor: '#00A896', bgcolor: '#F0FDF9' } }}
          >
            Entrar com Google
          </Button>

          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" color="textSecondary">ou</Typography>
          </Divider>
          
          <form onSubmit={handleSubmit}>
            {isRegister && (
              <TextField fullWidth label="Nome" margin="normal" value={name} onChange={e => setName(e.target.value)} required size="small" />
            )}
            <TextField fullWidth label="Email" type="email" margin="normal" value={email} onChange={e => setEmail(e.target.value)} required size="small" />
            <TextField fullWidth label="Senha" type="password" margin="normal" value={password} onChange={e => setPassword(e.target.value)} required size="small" />
            
            <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2, bgcolor: '#00A896', '&:hover': { bgcolor: '#028090' } }}>
              {isRegister ? 'Cadastrar' : 'Entrar'}
            </Button>
          </form>
          
          <Button fullWidth onClick={() => setIsRegister(!isRegister)} color="inherit" sx={{ fontSize: 13 }}>
            {isRegister ? 'Já tem conta? Faça login' : 'Novo síndico? Cadastre-se'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
