import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TextField, Button, Card, CardContent, Typography, Box, Divider, useTheme } from '@mui/material';
import { Google, Business } from '@mui/icons-material';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  // Cores vindas do theme central — nada de hex hardcoded aqui.
  const c = {
    accent: theme.palette.primary.main,
    accentSoft: theme.palette.primary.light ?? '#EFF6FF',
    textPrimary: theme.palette.text.primary,
    textSecondary: theme.palette.text.secondary,
    divider: theme.palette.divider,
    bg: theme.palette.background.default,
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (error) {
      alert('Erro ao autenticar. Verifique os dados.');
    }
  }

  function handleGoogleLogin() {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      'http://localhost:3333/auth/google',
      'Google Login',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    window.addEventListener('message', (event) => {
      if (event.data.token) {
        localStorage.setItem('@condomanager:token', event.data.token);
        if (popup) popup.close();
        navigate('/dashboard');
      }
    });
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: c.bg }}>
      <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <Box sx={{
              bgcolor: c.accent, borderRadius: 2, width: 48, height: 48,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
            }}>
              <Business />
            </Box>
          </Box>
          <Typography variant="h4" textAlign="center" gutterBottom sx={{ fontWeight: 700, color: c.textPrimary }}>
            CondoPro
          </Typography>
          <Typography variant="body2" textAlign="center" color="textSecondary" mb={3}>
            Gestão Profissional de Condomínios
          </Typography>

          <Button
            variant="outlined"
            fullWidth
            onClick={handleGoogleLogin}
            startIcon={<Google />}
            sx={{
              mb: 2, py: 1.5, borderColor: c.divider, color: c.textPrimary,
              '&:hover': { borderColor: c.accent, bgcolor: c.accentSoft },
            }}
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

            <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 3, mb: 2, py: 1.5 }}>
              {isRegister ? 'Cadastrar' : 'Entrar'}
            </Button>
          </form>

          <Button fullWidth onClick={() => setIsRegister(!isRegister)} color="inherit" sx={{ fontSize: 13, color: c.textSecondary }}>
            {isRegister ? 'Já tem conta? Faça login' : 'Novo síndico? Cadastre-se'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}