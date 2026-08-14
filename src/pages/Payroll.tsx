import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Typography, Card, CardContent, Grid, Box, Chip, Button,
  Table, TableBody, TableCell, TableHead, TableRow, Snackbar, useTheme
} from '@mui/material';
import { Calculate, Send, Badge } from '@mui/icons-material';

export default function Payroll() {
  const theme = useTheme();
  const c = {
    accent: theme.palette.primary.main,
    textSecondary: theme.palette.text.secondary,
  };

  const [employees, setEmployees] = useState<any[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data } = await api.get('/employees');
    setEmployees(data);
  }

  async function calcularTodasFolhas() {
    for (const emp of employees) {
      await api.post(`/employees/${emp.id}/calcular`);
    }
    setSnackbar({ open: true, message: 'Todas as folhas calculadas!', severity: 'success' });
    loadData();
  }

  async function enviarParaContabilidade() {
    // Aqui futuramente cria os lançamentos contábeis automaticamente
    setSnackbar({ open: true, message: 'Resumo enviado para Contabilidade!', severity: 'success' });
  }

  const totalProventos = employees.reduce((sum, e) => sum + (e.totalProventos || 0), 0);
  const totalDescontos = employees.reduce((sum, e) => sum + (e.totalDescontos || 0), 0);
  const totalLiquido = employees.reduce((sum, e) => sum + (e.totalLiquido || 0), 0);
  const totalFgts = employees.reduce((sum, e) => sum + (e.fgtsValor || 0), 0);
  const totalInss = employees.reduce((sum, e) => sum + (e.inssValor || 0), 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Folha de Pagamento</Typography>
          <Typography variant="caption" color="textSecondary">
            Resumo consolidado de todos os funcionários
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Calculate />} onClick={calcularTodasFolhas} size="small">
            Calcular Tudo
          </Button>
          <Button variant="contained" startIcon={<Send />} onClick={enviarParaContabilidade} size="small" color="success">
            Enviar p/ Contabilidade
          </Button>
        </Box>
      </Box>

      {/* Cards Resumo */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="caption" color="textSecondary">TOTAL PROVENTOS</Typography>
            <Typography variant="h5" fontWeight={700} color="success.main">R$ {totalProventos.toFixed(2)}</Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="caption" color="textSecondary">TOTAL DESCONTOS</Typography>
            <Typography variant="h5" fontWeight={700} color="error.main">R$ {totalDescontos.toFixed(2)}</Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="caption" color="textSecondary">LÍQUIDO A PAGAR</Typography>
            <Typography variant="h5" fontWeight={700} color="primary">R$ {totalLiquido.toFixed(2)}</Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="caption" color="textSecondary">FUNCIONÁRIOS</Typography>
            <Typography variant="h5" fontWeight={700}>{employees.length}</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela detalhada */}
      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Funcionário</TableCell>
              <TableCell>Cargo</TableCell>
              <TableCell align="right">Proventos</TableCell>
              <TableCell align="right">Descontos</TableCell>
              <TableCell align="right">Líquido</TableCell>
              <TableCell align="right">FGTS</TableCell>
              <TableCell align="right">INSS</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map(emp => (
              <TableRow key={emp.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Badge sx={{ color: c.accent }} />
                    <Typography variant="body2" fontWeight={600}>{emp.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{emp.role}</TableCell>
                <TableCell align="right">R$ {(emp.totalProventos || 0).toFixed(2)}</TableCell>
                <TableCell align="right" sx={{ color: 'error.main' }}>R$ {(emp.totalDescontos || 0).toFixed(2)}</TableCell>
                <TableCell align="right" fontWeight={700}>R$ {(emp.totalLiquido || 0).toFixed(2)}</TableCell>
                <TableCell align="right">R$ {(emp.fgtsValor || 0).toFixed(2)}</TableCell>
                <TableCell align="right">R$ {(emp.inssValor || 0).toFixed(2)}</TableCell>
                <TableCell>
                  <Chip label={emp.status} size="small" color={emp.status === 'ATIVO' ? 'success' : emp.status === 'FERIAS' ? 'warning' : 'error'} />
                </TableCell>
              </TableRow>
            ))}
            {employees.length === 0 && (
              <TableRow><TableCell colSpan={8} align="center"><Typography color="textSecondary" py={4}>Nenhum funcionário cadastrado</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} />
    </Box>
  );
}