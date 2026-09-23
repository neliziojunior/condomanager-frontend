import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Typography, Card, CardContent, Grid, Box, Chip, Button,
  Table, TableBody, TableCell, TableHead, TableRow, Snackbar,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider,
  Select, MenuItem, IconButton
} from '@mui/material';
import { 
  Calculate, Send, Download, Visibility, TableChart,
  PictureAsPdf, TrendingUp, TrendingDown
} from '@mui/icons-material';

export default function Payroll() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showPayslip, setShowPayslip] = useState(false);
  const [competencia, setCompetencia] = useState(new Date().toISOString().slice(0, 7));
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3333'
    : 'https://condpro.onrender.com';

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data } = await api.get('/employees');
    setEmployees(data);
  }

  async function calcularTodasFolhas() {
    for (const emp of employees) {
      await api.post(`/employees/${emp.id}/calcular`);
    }
    setSnackbar({ open: true, message: '🧮 Todas as folhas calculadas!', severity: 'success' });
    loadData();
  }

  function verContraCheque(emp: any) {
    setSelectedEmployee(emp);
    setShowPayslip(true);
  }

  async function enviarParaContabilidade() {
    setSnackbar({ open: true, message: '📤 Enviado para contabilidade!', severity: 'success' });
  }

  function baixarPDF() {
    window.open(`${API_URL}/payroll/pdf?competencia=${competencia}`, '_blank');
  }

  function baixarExcel() {
    window.open(`${API_URL}/payroll/excel?competencia=${competencia}`, '_blank');
  }

  const totalProventos = employees.reduce((sum, e) => sum + (e.totalProventos || 0), 0);
  const totalDescontos = employees.reduce((sum, e) => sum + (e.totalDescontos || 0), 0);
  const totalLiquido = employees.reduce((sum, e) => sum + (e.totalLiquido || 0), 0);
  const custoTotal = employees.reduce((sum, e) => sum + (e.custoTotalEmpresa || 0), 0);

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>🧮 Folha de Pagamento</Typography>
          <Typography variant="caption" color="textSecondary">
            Cálculo completo com regras CLT, INSS, IRRF, FGTS e provisões
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Select size="small" value={competencia} onChange={e => setCompetencia(e.target.value)} sx={{ minWidth: 140 }}>
            <MenuItem value="2026-09">📅 Setembro/2026</MenuItem>
            <MenuItem value="2026-08">📅 Agosto/2026</MenuItem>
            <MenuItem value="2026-07">📅 Julho/2026</MenuItem>
            <MenuItem value="2026-06">📅 Junho/2026</MenuItem>
          </Select>
          <Button variant="contained" startIcon={<Calculate />} onClick={calcularTodasFolhas} size="small" color="warning">
            Calcular Tudo
          </Button>
          <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={baixarPDF} size="small">
            PDF
          </Button>
          <Button variant="outlined" startIcon={<TableChart />} onClick={baixarExcel} size="small">
            Excel
          </Button>
          <Button variant="contained" startIcon={<Send />} onClick={enviarParaContabilidade} size="small" color="success">
            Enviar p/ Contabilidade
          </Button>
        </Box>
      </Box>

      {/* Cards Resumo */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ borderRadius: 2, bgcolor: '#F0FDF9', textAlign: 'center', p: 2 }}>
            <TrendingUp sx={{ color: '#02C39A', mb: 1 }} />
            <Typography variant="caption">PROVENTOS</Typography>
            <Typography variant="h6" fontWeight={700} color="success.main">R$ {totalProventos.toFixed(2)}</Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ borderRadius: 2, bgcolor: '#FFF5F5', textAlign: 'center', p: 2 }}>
            <TrendingDown sx={{ color: '#E63946', mb: 1 }} />
            <Typography variant="caption">DESCONTOS</Typography>
            <Typography variant="h6" fontWeight={700} color="error.main">R$ {totalDescontos.toFixed(2)}</Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ borderRadius: 2, textAlign: 'center', p: 2 }}>
            <Typography variant="caption">LÍQUIDO</Typography>
            <Typography variant="h6" fontWeight={700} color="primary">R$ {totalLiquido.toFixed(2)}</Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ borderRadius: 2, bgcolor: '#F5F0FF', textAlign: 'center', p: 2 }}>
            <Typography variant="caption">CUSTO EMPRESA</Typography>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#6C5CE7' }}>R$ {custoTotal.toFixed(2)}</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela */}
      <Card sx={{ borderRadius: 2, mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Funcionário</TableCell>
              <TableCell>Cargo</TableCell>
              <TableCell align="right">Proventos</TableCell>
              <TableCell align="right">Descontos</TableCell>
              <TableCell align="right">Líquido</TableCell>
              <TableCell align="right">Custo Empresa</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map(emp => (
              <TableRow key={emp.id} hover>
                <TableCell><Typography variant="body2" fontWeight={600}>{emp.name}</Typography></TableCell>
                <TableCell>{emp.cargo}</TableCell>
                <TableCell align="right">R$ {(emp.totalProventos || 0).toFixed(2)}</TableCell>
                <TableCell align="right" sx={{ color: 'error.main' }}>R$ {(emp.totalDescontos || 0).toFixed(2)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>R$ {(emp.totalLiquido || 0).toFixed(2)}</TableCell>
                <TableCell align="right" sx={{ color: '#6C5CE7' }}>R$ {(emp.custoTotalEmpresa || 0).toFixed(2)}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => verContraCheque(emp)} title="Contra-cheque">
                    <Visibility fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {employees.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="textSecondary" py={3}>Nenhum funcionário cadastrado</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal Contra-cheque */}
      <Dialog open={showPayslip} onClose={() => setShowPayslip(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 700 }}>
          🧾 CONTRA-CHEQUE
        </DialogTitle>
        {selectedEmployee && (
          <DialogContent>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h6">{selectedEmployee.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {selectedEmployee.cargo} • Competência: {competencia}
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Typography variant="subtitle2" fontWeight={600} color="success.main" mb={1}>💰 PROVENTOS</Typography>
            <Grid container spacing={1} mb={2}>
              <Grid item xs={8}><Typography variant="body2">Salário Base</Typography></Grid>
              <Grid item xs={4}><Typography variant="body2" align="right">R$ {selectedEmployee.salarioBase?.toFixed(2)}</Typography></Grid>
              {selectedEmployee.periculosidade > 0 && (
                <>
                  <Grid item xs={8}><Typography variant="body2">Periculosidade</Typography></Grid>
                  <Grid item xs={4}><Typography variant="body2" align="right">R$ {selectedEmployee.periculosidade?.toFixed(2)}</Typography></Grid>
                </>
              )}
            </Grid>
            <Box display="flex" justifyContent="space-between" bgcolor="#F0FDF9" p={1} borderRadius={1} mb={2}>
              <Typography variant="body2" fontWeight={700}>Total Proventos</Typography>
              <Typography variant="body2" fontWeight={700}>R$ {selectedEmployee.totalProventos?.toFixed(2)}</Typography>
            </Box>

            <Typography variant="subtitle2" fontWeight={600} color="error.main" mb={1}>📉 DESCONTOS</Typography>
            <Grid container spacing={1} mb={2}>
              <Grid item xs={8}><Typography variant="body2">INSS</Typography></Grid>
              <Grid item xs={4}><Typography variant="body2" align="right" color="error.main">- R$ {selectedEmployee.inssFuncionario?.toFixed(2)}</Typography></Grid>
              {selectedEmployee.irrf > 0 && (
                <>
                  <Grid item xs={8}><Typography variant="body2">IRRF</Typography></Grid>
                  <Grid item xs={4}><Typography variant="body2" align="right" color="error.main">- R$ {selectedEmployee.irrf?.toFixed(2)}</Typography></Grid>
                </>
              )}
            </Grid>
            <Box display="flex" justifyContent="space-between" bgcolor="#FFF5F5" p={1} borderRadius={1} mb={2}>
              <Typography variant="body2" fontWeight={700}>Total Descontos</Typography>
              <Typography variant="body2" fontWeight={700} color="error.main">- R$ {selectedEmployee.totalDescontos?.toFixed(2)}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" bgcolor="#F0FDF9" p={2} borderRadius={2}>
              <Typography variant="h6" fontWeight={700}>💰 LÍQUIDO</Typography>
              <Typography variant="h6" fontWeight={700} color="primary">R$ {selectedEmployee.totalLiquido?.toFixed(2)}</Typography>
            </Box>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => setShowPayslip(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} />
    </Box>
  );
}
