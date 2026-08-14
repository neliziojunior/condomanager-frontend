import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Typography, Card, CardContent, Grid, TextField, Button, Select, MenuItem,
  Box, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Divider, Switch, FormControlLabel
} from '@mui/material';
import { Add, Edit, Delete, Badge, Calculate } from '@mui/icons-material';

const ROLES = ['Porteiro', 'Zelador', 'Faxineira', 'Vigia', 'Jardineiro', 'Auxiliar', 'Outro'];

export default function Employees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [name, setName] = useState('');
  const [role, setRole] = useState('Porteiro');
  const [cpf, setCpf] = useState('');
  const [pis, setPis] = useState('');
  const [ctps, setCtps] = useState('');
  const [dataAdmissao, setDataAdmissao] = useState('');
  const [status, setStatus] = useState('ATIVO');

  const [salarioBase, setSalarioBase] = useState('');
  
  const [temPericulosidade, setTemPericulosidade] = useState(false);
  const [temAdicionalNoturno, setTemAdicionalNoturno] = useState(false);
  const [temInsalubridade, setTemInsalubridade] = useState(false);
  const [grauInsalubridade, setGrauInsalubridade] = useState('10');

  const [temValeTransporte, setTemValeTransporte] = useState(false);
  const [temValeRefeicao, setTemValeRefeicao] = useState(false);
  const [valeTransporteValor, setValeTransporteValor] = useState('');
  const [valeRefeicaoValor, setValeRefeicaoValor] = useState('');
  
  // ✅ Apenas % de cobertura (sem valor total)
  const [temPlanoSaude, setTemPlanoSaude] = useState(false);
  const [planoSaudeCobertura, setPlanoSaudeCobertura] = useState('100');
  
  const [temPlanoOdonto, setTemPlanoOdonto] = useState(false);
  const [planoOdontoCobertura, setPlanoOdontoCobertura] = useState('100');

  const [horasExtras, setHorasExtras] = useState('');
  const [faltas, setFaltas] = useState('');

  useEffect(() => { loadEmployees(); }, []);

  async function loadEmployees() {
    const { data } = await api.get('/employees');
    setEmployees(data);
  }

  function calcularAutomatico() {
    const base = Number(salarioBase) || 0;
    const periculosidade = temPericulosidade ? base * 0.30 : 0;
    const adicionalNoturno = temAdicionalNoturno ? base * 0.20 : 0;
    const salarioMinimo = 1412;
    const insalubridade = temInsalubridade ? salarioMinimo * (Number(grauInsalubridade) / 100) : 0;
    
    return { periculosidade, adicionalNoturno, insalubridade };
  }

  function openEdit(emp: any) {
    setEditingId(emp.id);
    setName(emp.name || ''); setRole(emp.role || 'Porteiro'); setCpf(emp.cpf || ''); setPis(emp.pis || '');
    setCtps(emp.ctps || ''); setDataAdmissao(emp.dataAdmissao?.split('T')[0] || ''); setStatus(emp.status || 'ATIVO');
    setSalarioBase(emp.salarioBase?.toString() || '');
    
    setTemPericulosidade((emp.periculosidade || 0) > 0);
    setTemAdicionalNoturno((emp.adicionalNoturno || 0) > 0);
    setTemInsalubridade((emp.insalubridade || 0) > 0);
    
    setTemValeTransporte((emp.valeTransporte || 0) > 0);
    setTemValeRefeicao((emp.valeRefeicao || 0) > 0);
    setValeTransporteValor(emp.valeTransporte?.toString() || '');
    setValeRefeicaoValor(emp.valeRefeicao?.toString() || '');
    
    setTemPlanoSaude(emp.planoSaudeCobertura > 0);
    setTemPlanoOdonto(emp.planoOdontoCobertura > 0);
    setPlanoSaudeCobertura(emp.planoSaudeCobertura?.toString() || '100');
    setPlanoOdontoCobertura(emp.planoOdontoCobertura?.toString() || '100');
    
    setHorasExtras(emp.horasExtras?.toString() || ''); setFaltas(emp.faltas?.toString() || '');
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const calculado = calcularAutomatico();
    
    const payload = {
      name, role, cpf, pis, ctps, dataAdmissao: dataAdmissao || undefined, status,
      salarioBase: Number(salarioBase),
      periculosidade: temPericulosidade ? calculado.periculosidade : 0,
      adicionalNoturno: temAdicionalNoturno ? calculado.adicionalNoturno : 0,
      insalubridade: temInsalubridade ? calculado.insalubridade : 0,
      valeTransporte: temValeTransporte ? Number(valeTransporteValor) : 0,
      valeRefeicao: temValeRefeicao ? Number(valeRefeicaoValor) : 0,
      planoSaudeCobertura: temPlanoSaude ? Number(planoSaudeCobertura) : 0,
      planoOdontoCobertura: temPlanoOdonto ? Number(planoOdontoCobertura) : 0,
      horasExtras: Number(horasExtras), faltas: Number(faltas),
      fgtsPercentual: 8,
    };

    try {
      if (editingId) {
        await api.put(`/employees/${editingId}`, payload);
      } else {
        await api.post('/employees', payload);
      }
      setSnackbar({ open: true, message: editingId ? 'Atualizado!' : 'Cadastrado!', severity: 'success' });
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

  const calculado = calcularAutomatico();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>👥 Funcionários</Typography>
          <Typography variant="caption" color="textSecondary">
            {employees.length} funcionário(s)
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
                    <IconButton size="small" onClick={() => calcularFolha(emp.id)}><Calculate fontSize="small" color="warning" /></IconButton>
                    <IconButton size="small" color="primary" onClick={() => openEdit(emp)}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => deleteEmployee(emp.id)}><Delete fontSize="small" /></IconButton>
                  </Box>
                </Box>
                <Grid container spacing={1}>
                  <Grid item xs={6}><Typography variant="caption">Salário: R$ {emp.salarioBase?.toFixed(2)}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="caption">Líquido: R$ {emp.totalLiquido?.toFixed(2)}</Typography></Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Modal */}
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
                  <MenuItem value="ATIVO">Ativo</MenuItem><MenuItem value="FERIAS">Férias</MenuItem><MenuItem value="AFASTADO">Afastado</MenuItem><MenuItem value="DEMITIDO">Demitido</MenuItem>
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
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Salário Base (R$)" size="small" type="number" value={salarioBase} onChange={e => setSalarioBase(e.target.value)} required />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ bgcolor: '#F0FDF9', p: 1.5, borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="textSecondary">TOTAL CALCULADO</Typography>
                  <Typography variant="h6" fontWeight={700} color="primary">
                    R$ {(Number(salarioBase) + calculado.periculosidade + calculado.adicionalNoturno + calculado.insalubridade).toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Adicionais CLT */}
            <Typography variant="subtitle2" fontWeight={600} mb={1}>⚙️ Adicionais (CLT)</Typography>
            <Grid container spacing={1} mb={2}>
              <Grid item xs={6} sm={4}>
                <FormControlLabel
                  control={<Switch checked={temPericulosidade} onChange={e => setTemPericulosidade(e.target.checked)} color="warning" />}
                  label="Periculosidade (30%)"
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControlLabel
                  control={<Switch checked={temAdicionalNoturno} onChange={e => setTemAdicionalNoturno(e.target.checked)} color="primary" />}
                  label="Adic. Noturno (20%)"
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControlLabel
                  control={<Switch checked={temInsalubridade} onChange={e => setTemInsalubridade(e.target.checked)} color="error" />}
                  label="Insalubridade"
                />
                {temInsalubridade && (
                  <Select size="small" value={grauInsalubridade} onChange={e => setGrauInsalubridade(e.target.value)} sx={{ ml: 2, width: 80 }}>
                    <MenuItem value="10">10%</MenuItem><MenuItem value="20">20%</MenuItem><MenuItem value="40">40%</MenuItem>
                  </Select>
                )}
              </Grid>
            </Grid>

            <Divider sx={{ mb: 2 }} />

            {/* Benefícios */}
            <Typography variant="subtitle2" fontWeight={600} mb={1}>🎁 Benefícios</Typography>
            <Grid container spacing={1.5} mb={2}>
              <Grid item xs={6} sm={3}>
                <FormControlLabel
                  control={<Switch checked={temValeTransporte} onChange={e => setTemValeTransporte(e.target.checked)} />}
                  label="Vale Transporte"
                />
                {temValeTransporte && (
                  <TextField size="small" type="number" label="Valor R$" value={valeTransporteValor} onChange={e => setValeTransporteValor(e.target.value)} sx={{ ml: 2, width: 100 }} />
                )}
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControlLabel
                  control={<Switch checked={temValeRefeicao} onChange={e => setTemValeRefeicao(e.target.checked)} />}
                  label="Vale Refeição"
                />
                {temValeRefeicao && (
                  <TextField size="small" type="number" label="Valor R$" value={valeRefeicaoValor} onChange={e => setValeRefeicaoValor(e.target.value)} sx={{ ml: 2, width: 100 }} />
                )}
              </Grid>
              
              {/* ✅ Plano Saúde - só % */}
              <Grid item xs={6} sm={3}>
                <FormControlLabel
                  control={<Switch checked={temPlanoSaude} onChange={e => setTemPlanoSaude(e.target.checked)} />}
                  label="Plano Saúde"
                />
                {temPlanoSaude && (
                  <TextField 
                    size="small" 
                    type="number" 
                    label="Cobertura %" 
                    value={planoSaudeCobertura} 
                    onChange={e => setPlanoSaudeCobertura(e.target.value)} 
                    sx={{ ml: 2, width: 100 }} 
                    inputProps={{ min: 0, max: 100 }}
                  />
                )}
              </Grid>

              {/* ✅ Plano Odonto - só % */}
              <Grid item xs={6} sm={3}>
                <FormControlLabel
                  control={<Switch checked={temPlanoOdonto} onChange={e => setTemPlanoOdonto(e.target.checked)} />}
                  label="Plano Odonto"
                />
                {temPlanoOdonto && (
                  <TextField 
                    size="small" 
                    type="number" 
                    label="Cobertura %" 
                    value={planoOdontoCobertura} 
                    onChange={e => setPlanoOdontoCobertura(e.target.value)} 
                    sx={{ ml: 2, width: 100 }} 
                    inputProps={{ min: 0, max: 100 }}
                  />
                )}
              </Grid>
            </Grid>

            {/* Variáveis */}
            <Typography variant="subtitle2" fontWeight={600} mb={1}>⏰ Variáveis</Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={6} sm={3}><TextField fullWidth label="Horas Extras (R$)" size="small" type="number" value={horasExtras} onChange={e => setHorasExtras(e.target.value)} /></Grid>
              <Grid item xs={6} sm={3}><TextField fullWidth label="Faltas (R$)" size="small" type="number" value={faltas} onChange={e => setFaltas(e.target.value)} /></Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ bgcolor: '#F7F9FC', p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption">📊 CLT: FGTS 8% • INSS conforme tabela • Cálculo automático ao salvar</Typography>
                </Box>
              </Grid>
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
