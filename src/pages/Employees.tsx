import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Typography, Card, CardContent, Grid, TextField, Button, Select, MenuItem,
  Box, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Divider
} from '@mui/material';
import { Add, Edit, Delete, Badge, Calculate } from '@mui/icons-material';

const ROLES = ['Porteiro', 'Zelador', 'Faxineira', 'Vigia', 'Jardineiro', 'Auxiliar', 'Outro'];

export default function Employees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Dados Pessoais
  const [name, setName] = useState('');
  const [role, setRole] = useState('Porteiro');
  const [cpf, setCpf] = useState('');
  const [pis, setPis] = useState('');
  const [ctps, setCtps] = useState('');
  const [dataAdmissao, setDataAdmissao] = useState('');
  const [status, setStatus] = useState('ATIVO');

  // Remuneração
  const [salarioBase, setSalarioBase] = useState('');
  const [adicionalNoturno, setAdicionalNoturno] = useState('');
  const [periculosidade, setPericulosidade] = useState('');
  const [insalubridade, setInsalubridade] = useState('');

  // Benefícios
  const [valeTransporte, setValeTransporte] = useState('');
  const [valeRefeicao, setValeRefeicao] = useState('');
  const [planoSaude, setPlanoSaude] = useState('');
  const [planoOdonto, setPlanoOdonto] = useState('');
  const [seguroVida, setSeguroVida] = useState('');

  // Encargos
  const [fgtsPercentual, setFgtsPercentual] = useState('8');
  const [inssPercentual, setInssPercentual] = useState('');

  // Variáveis
  const [horasExtras, setHorasExtras] = useState('');
  const [faltas, setFaltas] = useState('');

  useEffect(() => { loadEmployees(); }, []);

  async function loadEmployees() {
    const { data } = await api.get('/employees');
    setEmployees(data);
  }

  function openEdit(emp: any) {
    setEditingId(emp.id);
    setName(emp.name || ''); setRole(emp.role || 'Porteiro'); setCpf(emp.cpf || ''); setPis(emp.pis || '');
    setCtps(emp.ctps || ''); setDataAdmissao(emp.dataAdmissao?.split('T')[0] || ''); setStatus(emp.status || 'ATIVO');
    setSalarioBase(emp.salarioBase?.toString() || ''); setAdicionalNoturno(emp.adicionalNoturno?.toString() || '');
    setPericulosidade(emp.periculosidade?.toString() || ''); setInsalubridade(emp.insalubridade?.toString() || '');
    setValeTransporte(emp.valeTransporte?.toString() || ''); setValeRefeicao(emp.valeRefeicao?.toString() || '');
    setPlanoSaude(emp.planoSaude?.toString() || ''); setPlanoOdonto(emp.planoOdonto?.toString() || '');
    setSeguroVida(emp.seguroVida?.toString() || '');
    setFgtsPercentual(emp.fgtsPercentual?.toString() || '8'); setInssPercentual(emp.inssPercentual?.toString() || '');
    setHorasExtras(emp.horasExtras?.toString() || ''); setFaltas(emp.faltas?.toString() || '');
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name, role, cpf, pis, ctps, dataAdmissao: dataAdmissao || undefined, status,
      salarioBase: Number(salarioBase), adicionalNoturno: Number(adicionalNoturno),
      periculosidade: Number(periculosidade), insalubridade: Number(insalubridade),
      valeTransporte: Number(valeTransporte), valeRefeicao: Number(valeRefeicao),
      planoSaude: Number(planoSaude), planoOdonto: Number(planoOdonto), seguroVida: Number(seguroVida),
      fgtsPercentual: Number(fgtsPercentual), inssPercentual: Number(inssPercentual),
      horasExtras: Number(horasExtras), faltas: Number(faltas),
    };

    try {
      if (editingId) {
        await api.put(`/employees/${editingId}`, payload);
        setSnackbar({ open: true, message: 'Funcionário atualizado!', severity: 'success' });
      } else {
        await api.post('/employees', payload);
        setSnackbar({ open: true, message: 'Funcionário cadastrado!', severity: 'success' });
      }
      setShowForm(false); setEditingId(null);
      loadEmployees();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao salvar', severity: 'error' });
    }
  }

  async function calcularFolha(id: string) {
    await api.post(`/employees/${id}/calcular`);
    setSnackbar({ open: true, message: '🧮 Folha calculada!', severity: 'success' });
    loadEmployees();
  }

  async function deleteEmployee(id: string) {
    if (!confirm('Excluir este funcionário?')) return;
    await api.delete(`/employees/${id}`);
    loadEmployees();
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>👥 Funcionários</Typography>
          <Typography variant="caption" color="textSecondary">
            {employees.length} funcionário(s) cadastrado(s)
          </Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<Add />} onClick={() => { setEditingId(null); setShowForm(true); }}>
          Novo Funcionário
        </Button>
      </Box>

      <Grid container spacing={2}>
        {employees.map(emp => (
          <Grid item xs={12} md={6} lg={4} key={emp.id}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Badge sx={{ color: '#00A896' }} />
                    <Box>
                      <Typography fontWeight={600}>{emp.name}</Typography>
                      <Chip label={emp.role} size="small" color="primary" variant="outlined" />
                      <Chip label={emp.status} size="small" color={emp.status === 'ATIVO' ? 'success' : 'error'} sx={{ ml: 0.5 }} />
                    </Box>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => calcularFolha(emp.id)} title="Calcular Folha"><Calculate fontSize="small" color="warning" /></IconButton>
                    <IconButton size="small" color="primary" onClick={() => openEdit(emp)}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => deleteEmployee(emp.id)}><Delete fontSize="small" /></IconButton>
                  </Box>
                </Box>
                <Grid container spacing={1}>
                  <Grid item xs={6}><Typography variant="caption">Salário: R$ {emp.salarioBase?.toFixed(2)}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="caption">Líquido: R$ {emp.totalLiquido?.toFixed(2)}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="caption">FGTS: R$ {emp.fgtsValor?.toFixed(2)}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="caption">INSS: R$ {emp.inssValor?.toFixed(2)}</Typography></Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Modal completo */}
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? '✏️ Editar Funcionário' : '👥 Novo Funcionário'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {/* Dados Pessoais */}
            <Typography variant="subtitle2" fontWeight={600} mb={1}>📋 Dados Pessoais</Typography>
            <Grid container spacing={1.5} mb={2}>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Nome completo" size="small" value={name} onChange={e => setName(e.target.value)} required /></Grid>
              <Grid item xs={6} sm={3}>
                <Select fullWidth size="small" value={role} onChange={e => setRole(e.target.value)}>
                  {ROLES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                </Select>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Select fullWidth size="small" value={status} onChange={e => setStatus(e.target.value)}>
                  <MenuItem value="ATIVO">Ativo</MenuItem>
                  <MenuItem value="FERIAS">Férias</MenuItem>
                  <MenuItem value="AFASTADO">Afastado</MenuItem>
                  <MenuItem value="DEMITIDO">Demitido</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={4}><TextField fullWidth label="CPF" size="small" value={cpf} onChange={e => setCpf(e.target.value)} /></Grid>
              <Grid item xs={4}><TextField fullWidth label="PIS" size="small" value={pis} onChange={e => setPis(e.target.value)} /></Grid>
              <Grid item xs={4}><TextField fullWidth label="CTPS" size="small" value={ctps} onChange={e => setCtps(e.target.value)} /></Grid>
              <Grid item xs={6}><TextField fullWidth label="Admissão" type="date" size="small" value={dataAdmissao} onChange={e => setDataAdmissao(e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
            </Grid>

            <Divider sx={{ mb: 2 }} />

            {/* Remuneração */}
            <Typography variant="subtitle2" fontWeight={600} mb={1}>💰 Remuneração</Typography>
            <Grid container spacing={1.5} mb={2}>
              <Grid item xs={6} sm={3}><TextField fullWidth label="Salário Base" size="small" type="number" value={salarioBase} onChange={e => setSalarioBase(e.target.value)} /></Grid>
              <Grid item xs={6} sm={3}><TextField fullWidth label="Adic. Noturno" size="small" type="number" value={adicionalNoturno} onChange={e => setAdicionalNoturno(e.target.value)} /></Grid>
              <Grid item xs={6} sm={3}><TextField fullWidth label="Periculosidade" size="small" type="number" value={periculosidade} onChange={e => setPericulosidade(e.target.value)} helperText="30% do salário base" /></Grid>
              <Grid item xs={6} sm={3}><TextField fullWidth label="Insalubridade" size="small" type="number" value={insalubridade} onChange={e => setInsalubridade(e.target.value)} helperText="10%/20%/40%" /></Grid>
            </Grid>

            {/* Benefícios */}
            <Typography variant="subtitle2" fontWeight={600} mb={1}>🎁 Benefícios</Typography>
            <Grid container spacing={1.5} mb={2}>
              <Grid item xs={6} sm={3}><TextField fullWidth label="Vale Transporte" size="small" type="number" value={valeTransporte} onChange={e => setValeTransporte(e.target.value)} /></Grid>
              <Grid item xs={6} sm={3}><TextField fullWidth label="Vale Refeição" size="small" type="number" value={valeRefeicao} onChange={e => setValeRefeicao(e.target.value)} /></Grid>
              <Grid item xs={6} sm={3}><TextField fullWidth label="Plano Saúde" size="small" type="number" value={planoSaude} onChange={e => setPlanoSaude(e.target.value)} /></Grid>
              <Grid item xs={6} sm={3}><TextField fullWidth label="Plano Odonto" size="small" type="number" value={planoOdonto} onChange={e => setPlanoOdonto(e.target.value)} /></Grid>
            </Grid>

            {/* Encargos e Variáveis */}
            <Typography variant="subtitle2" fontWeight={600} mb={1}>📊 Encargos e Variáveis</Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={6} sm={3}><TextField fullWidth label="FGTS %" size="small" type="number" value={fgtsPercentual} onChange={e => setFgtsPercentual(e.target.value)} /></Grid>
              <Grid item xs={6} sm={3}><TextField fullWidth label="INSS %" size="small" type="number" value={inssPercentual} onChange={e => setInssPercentual(e.target.value)} /></Grid>
              <Grid item xs={6} sm={3}><TextField fullWidth label="Horas Extras" size="small" type="number" value={horasExtras} onChange={e => setHorasExtras(e.target.value)} /></Grid>
              <Grid item xs={6} sm={3}><TextField fullWidth label="Faltas (R$)" size="small" type="number" value={faltas} onChange={e => setFaltas(e.target.value)} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">{editingId ? 'Atualizar' : 'Cadastrar'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} />
    </Box>
  );
}
