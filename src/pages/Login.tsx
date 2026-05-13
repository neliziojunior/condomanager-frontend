import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TextField, Button, Card, CardContent, Typography, Box } from '@mui/material';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

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

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" textAlign="center" gutterBottom>
            🏢 CondoManager
          </Typography>
          <Typography variant="body2" textAlign="center" color="textSecondary" mb={3}>
            Gestão Inteligente de Condomínios
          </Typography>
          
          <form onSubmit={handleSubmit}>
            {isRegister && (
              <TextField fullWidth label="Nome" margin="normal" value={name} onChange={e => setName(e.target.value)} required />
            )}
            <TextField fullWidth label="Email" type="email" margin="normal" value={email} onChange={e => setEmail(e.target.value)} required />
            <TextField fullWidth label="Senha" type="password" margin="normal" value={password} onChange={e => setPassword(e.target.value)} required />
            
            <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 3, mb: 2 }}>
              {isRegister ? 'Cadastrar' : 'Entrar'}
            </Button>
          </form>
          
          <Button fullWidth onClick={() => setIsRegister(!isRegister)} color="inherit">
            {isRegister ? 'Já tem conta? Faça login' : 'Novo síndico? Cadastre-se'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}