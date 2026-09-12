import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Typography, Card, CardContent, Grid, TextField, Button, Select, MenuItem,
  Box, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Divider, Switch, FormControlLabel, Accordion, AccordionSummary,
  AccordionDetails, Tabs, Tab
} from '@mui/material';
import { Add, Edit, Delete, Badge, Calculate, ExpandMore } from '@mui/icons-material';

const CARGOS = ['Porteiro', 'Zelador', 'Servente', 'Faxineira', 'Vigia', 'Jardineiro', 'Auxiliar', 'Síndico', 'Outro'];
const ESTADOS_CIVIS = ['Solteiro', 'Casado', 'Divorciado', 'Viúvo', 'União Estável'];
const GRAUS_INSTRUCAO = ['Fundamental Incompleto', 'Fundamental Completo', 'Médio Incompleto', 'Médio Completo', 'Superior Incompleto', 'Superior Completo'];

export default function Employees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // 📋 Dados Pessoais
  const [name, setName] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [localNascimento, setLocalNascimento] = useState('');
  const [pais, setPais] = useState('BRASIL');
  const [estadoCivil, setEstadoCivil] = useState('Solteiro');
  const [nomeMae, setNomeMae] = useState('');
  const [nomePai, setNomePai] = useState('');
  const [grauInstrucao, setGrauInstrucao] = useState('Médio Completo');
  const [sexo, setSexo] = useState('Masculino');
  const [deficiencia, setDeficiencia] = useState(false);
  const [deficienciaTipo, setDeficienciaTipo] = useState('');

  // 📄 Documentos
  const [cpf, setCpf] = useState('');
  const [pis, setPis] = useState('');
  const [ctpsNumero, setCtpsNumero] = useState('');
  const [ctpsSerie, setCtpsSerie] = useState('');
  const [ctpsUf, setCtpsUf] = useState('');
  const [rg, setRg] = useState('');
  const [rgEmissor, setRgEmissor] = useState('');

  // 🏠 Residência
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [cep, setCep] = useState('');
  const [telefone, setTelefone] = useState('');
  const [celular, setCelular] = useState('');

  // 💼 Contrato
  const [cargo, setCargo] = useState('Porteiro');
  const [funcao, setFuncao] = useState('');
  const [cbo, setCbo] = useState('');
  const [dataAdmissao, setDataAdmissao] = useState('');
  const [salarioBase, setSalarioBase] = useState('');
  const [horarioTrabalho, setHorarioTrabalho] = useState('08:00 às 17:00');
  const [horarioIntervalo, setHorarioIntervalo] = useState('12:00 às 13:00');
  const [status, setStatus] = useState('ATIVO');

  // ⚙️ Adicionais
  const [temPericulosidade, setTemPericulosidade] = useState(false);
  const [temAdicionalNoturno, setTemAdicionalNoturno] = useState(false);
  const [temInsalubridade, setTemInsalubridade] = useState(false);
  const [grauInsalubridade, setGrauInsalubridade] = useState('10');

  // 🎁 Benefícios
  const [temValeTransporte, setTemValeTransporte] = useState(false);
  const [valeTransporteValor, setValeTransporteValor] = useState('');
  const [temValeRefeicao, setTemValeRefeicao] = useState(false);
  const [valeRefeicaoValor, setValeRefeicaoValor] = useState('');
  const [temPlanoSaude, setTemPlanoSaude] = useState(false);
  const [planoSaudeCobertura, setPlanoSaudeCobertura] = useState('100');
  const [temPlanoOdonto, setTemPlanoOdonto] = useState(false);
  const [planoOdontoCobertura, setPlanoOdontoCobertura] = useState('100');

  // ⏰ Variáveis
  const [horasExtras50, setHorasExtras50] = useState('');
  const [horasExtras100, setHorasExtras100] = useState('');
  const [faltas, setFaltas] = useState('');

  // 🌴 Férias
  const [feriasPeriodos, setFeriasPeriodos] = useState<any[]>([]);

  useEffect(() => { loadEmployees(); }, []);

  async function loadEmployees() {
    const { data } = await api.get('/employees');
    setEmployees(data);
  }

  function clearForm() {
    setName(''); setDataNascimento(''); setLocalNascimento(''); setEstadoCivil('Solteiro');
    setNomeMae(''); setNomePai(''); setGrauInstrucao('Médio Completo'); setSexo('Masculino');
    setDeficiencia(false); setDeficienciaTipo('');
    setCpf(''); setPis(''); setCtpsNumero(''); setCtpsSerie(''); setCtpsUf(''); setRg(''); setRgEmissor('');
    setEndereco(''); setCidade(''); setUf(''); setCep(''); setTelefone(''); setCelular('');
    setCargo('Porteiro'); setFuncao(''); setCbo(''); setDataAdmissao(''); setSalarioBase('');
    setHorarioTrabalho('08:00 às 17:00'); setHorarioIntervalo('12:00 às 13:00'); setStatus('ATIVO');
    setTemPericulosidade(false); setTemAdicionalNoturno(false); setTemInsalubridade(false);
    setTemValeTransporte(false); setValeTransporteValor(''); setTemValeRefeicao(false); setValeRefeicaoValor('');
    setTemPlanoSaude(false); setTemPlanoOdonto(false); setHorasExtras50(''); setHorasExtras100(''); setFaltas('');
    setFeriasPeriodos([]);
  }

  function openEdit(emp: any) {
    setEditingId(emp.id);
    setName(emp.name || '');
    setDataNascimento(emp.dataNascimento?.split('T')[0] || '');
    setLocalNascimento(emp.localNascimento || '');
    setPais(emp.pais || 'BRASIL');
    setEstadoCivil(emp.estadoCivil || 'Solteiro');
    setNomeMae(emp.nomeMae || '');
    setNomePai(emp.nomePai || '');
    setGrauInstrucao(emp.grauInstrucao || 'Médio Completo');
    setSexo(emp.sexo || 'Masculino');
    setDeficiencia(emp.deficiencia || false);
    setDeficienciaTipo(emp.deficienciaTipo || '');
    setCpf(emp.cpf || ''); setPis(emp.pis || '');
    setCtpsNumero(emp.ctpsNumero || ''); setCtpsSerie(emp.ctpsSerie || ''); setCtpsUf(emp.ctpsUf || '');
    setRg(emp.rg || ''); setRgEmissor(emp.rgEmissor || '');
    setEndereco(emp.endereco || ''); setCidade(emp.cidade || ''); setUf(emp.uf || ''); setCep(emp.cep || '');
    setTelefone(emp.telefone || ''); setCelular(emp.celular || '');
    setCargo(emp.cargo || 'Porteiro'); setFuncao(emp.funcao || ''); setCbo(emp.cbo || '');
    setDataAdmissao(emp.dataAdmissao?.split('T')[0] || '');
    setSalarioBase(emp.salarioBase?.toString() || '');
    setHorarioTrabalho(emp.horarioTrabalho || ''); setHorarioIntervalo(emp.horarioIntervalo || '');
    setStatus(emp.status || 'ATIVO');
    setTemPericulosidade((emp.periculosidade || 0) > 0);
    setTemAdicionalNoturno((emp.adicionalNoturno || 0) > 0);
    setTemInsalubridade((emp.insalubridade || 0) > 0);
    setTemValeTransporte((emp.valeTransporte || 0) > 0);
    setValeTransporteValor(emp.valeTransporte?.toString() || '');
    setTemValeRefeicao((emp.valeRefeicao || 0) > 0);
    setValeRefeicaoValor(emp.valeRefeicao?.toString() || '');
    setTemPlanoSaude((emp.planoSaude || 0) > 0);
    setTemPlanoOdonto((emp.planoOdonto || 0) > 0);
    setHorasExtras50(emp.horasExtras50?.toString() || '');
    setHorasExtras100(emp.horasExtras100?.toString() || '');
    setFaltas(emp.faltas?.toString() || '');
    setFeriasPeriodos(emp.feriasPeriodos || []);
    setShowForm(true);
    setTab(0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const base = Number(salarioBase) || 0;
    const periculosidade = temPericulosidade ? base * 0.30 : 0;
    const adicionalNoturno = temAdicionalNoturno ? base * 0.20 : 0;
    const salarioMinimo = 1412;
    const insalubridade = temInsalubridade ? salarioMinimo * (Number(grauInsalubridade) / 100) : 0;

    const payload = {
      name, dataNascimento: dataNascimento || undefined, localNascimento, pais, estadoCivil,
      nomeMae, nomePai, grauInstrucao, sexo, deficiencia, deficienciaTipo,
      cpf, pis, ctpsNumero, ctpsSerie, ctpsUf, rg, rgEmissor,
      endereco, cidade, uf, cep, telefone, celular,
      cargo, funcao: funcao || cargo, cbo, dataAdmissao: dataAdmissao || undefined, salarioBase: base,
      horarioTrabalho, horarioIntervalo, status,
      periculosidade, adicionalNoturno, insalubridade,
      valeTransporte: temValeTransporte ? Number(valeTransporteValor) : 0,
      valeRefeicao: temValeRefeicao ? Number(valeRefeicaoValor) : 0,
      planoSaudeCobertura: temPlanoSaude ? Number(planoSaudeCobertura) : 0,
      planoOdontoCobertura: temPlanoOdonto ? Number(planoOdontoCobertura) : 0,
      horasExtras50: Number(horasExtras50), horasExtras100: Number(horasExtras100), faltas: Number(faltas),
      feriasPeriodos,
    };

    try {
      if (editingId) {
        await api.put(`/employees/${editingId}`, payload);
      } else {
        await api.post('/employees', payload);
      }
      setSnackbar({ open: true, message: editingId ? 'Atualizado!' : 'Cadastrado!', severity: 'success' });
      setShowForm(false); setEditingId(null); clearForm();
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
            {employees.length} funcionário(s) - Padrão CTPS
          </Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<Add />} onClick={() => { setEditingId(null); clearForm(); setShowForm(true); setTab(0); }}>
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
                      <Chip label={emp.cargo} size="small" color="primary" variant="outlined" />
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
                  <Grid item xs={6}><Typography variant="caption">CPF: {emp.cpf}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="caption">Salário: R$ {emp.salarioBase?.toFixed(2)}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="caption">CTPS: {emp.ctpsNumero}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="caption">CBO: {emp.cbo}</Typography></Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Modal Completo */}
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? '✏️ Editar' : '👥 Novo'} Funcionário - Padrão CTPS</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pb: 0 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tab label="📋 Pessoal" />
              <Tab label="📄 Documentos" />
              <Tab label="🏠 Residência" />
              <Tab label="💼 Contrato" />
              <Tab label="⚙️ Adicionais" />
              <Tab label="🌴 Férias" />
            </Tabs>

            {/* ABA 1 - DADOS PESSOAIS */}
            {tab === 0 && (
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Nome Completo" size="small" value={name} onChange={e => setName(e.target.value)} required /></Grid>
                <Grid item xs={6} sm={3}><TextField fullWidth label="Data Nascimento" type="date" size="small" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
                <Grid item xs={6} sm={3}><TextField fullWidth label="Local Nascimento" size="small" value={localNascimento} onChange={e => setLocalNascimento(e.target.value)} /></Grid>
                <Grid item xs={6} sm={3}><TextField fullWidth label="País" size="small" value={pais} onChange={e => setPais(e.target.value)} /></Grid>
                <Grid item xs={6} sm={3}>
                  <Select fullWidth size="small" value={estadoCivil} onChange={e => setEstadoCivil(e.target.value)}>
                    {ESTADOS_CIVIS.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
                  </Select>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Select fullWidth size="small" value={sexo} onChange={e => setSexo(e.target.value)}>
                    <MenuItem value="Masculino">Masculino</MenuItem>
                    <MenuItem value="Feminino">Feminino</MenuItem>
                  </Select>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Select fullWidth size="small" value={grauInstrucao} onChange={e => setGrauInstrucao(e.target.value)}>
                    {GRAUS_INSTRUCAO.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                  </Select>
                </Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Nome da Mãe" size="small" value={nomeMae} onChange={e => setNomeMae(e.target.value)} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Nome do Pai" size="small" value={nomePai} onChange={e => setNomePai(e.target.value)} /></Grid>
                <Grid item xs={6} sm={3}>
                  <FormControlLabel control={<Switch checked={deficiencia} onChange={e => setDeficiencia(e.target.checked)} />} label="Possui deficiência?" />
                </Grid>
                {deficiencia && (
                  <Grid item xs={6} sm={9}><TextField fullWidth label="Tipo de deficiência" size="small" value={deficienciaTipo} onChange={e => setDeficienciaTipo(e.target.value)} /></Grid>
                )}
              </Grid>
            )}

            {/* ABA 2 - DOCUMENTOS */}
            {tab === 1 && (
              <Grid container spacing={1.5}>
                <Grid item xs={6} sm={4}><TextField fullWidth label="CPF" size="small" value={cpf} onChange={e => setCpf(e.target.value)} placeholder="000.000.000-00" /></Grid>
                <Grid item xs={6} sm={4}><TextField fullWidth label="PIS" size="small" value={pis} onChange={e => setPis(e.target.value)} placeholder="000.00000.00-0" /></Grid>
                <Grid item xs={6} sm={4}><TextField fullWidth label="RG" size="small" value={rg} onChange={e => setRg(e.target.value)} /></Grid>
                <Grid item xs={6} sm={4}><TextField fullWidth label="Órgão Emissor" size="small" value={rgEmissor} onChange={e => setRgEmissor(e.target.value)} placeholder="SSP" /></Grid>
                <Grid item xs={6} sm={4}><TextField fullWidth label="CTPS Número" size="small" value={ctpsNumero} onChange={e => setCtpsNumero(e.target.value)} /></Grid>
                <Grid item xs={6} sm={2}><TextField fullWidth label="Série" size="small" value={ctpsSerie} onChange={e => setCtpsSerie(e.target.value)} /></Grid>
                <Grid item xs={6} sm={2}><TextField fullWidth label="UF CTPS" size="small" value={ctpsUf} onChange={e => setCtpsUf(e.target.value)} placeholder="BA" /></Grid>
              </Grid>
            )}

            {/* ABA 3 - RESIDÊNCIA */}
            {tab === 2 && (
              <Grid container spacing={1.5}>
                <Grid item xs={12}><TextField fullWidth label="Endereço Completo" size="small" value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Rua, número, complemento" /></Grid>
                <Grid item xs={6} sm={5}><TextField fullWidth label="Cidade" size="small" value={cidade} onChange={e => setCidade(e.target.value)} /></Grid>
                <Grid item xs={6} sm={2}><TextField fullWidth label="UF" size="small" value={uf} onChange={e => setUf(e.target.value)} placeholder="BA" /></Grid>
                <Grid item xs={12} sm={5}><TextField fullWidth label="CEP" size="small" value={cep} onChange={e => setCep(e.target.value)} placeholder="00000-000" /></Grid>
                <Grid item xs={6}><TextField fullWidth label="Telefone" size="small" value={telefone} onChange={e => setTelefone(e.target.value)} /></Grid>
                <Grid item xs={6}><TextField fullWidth label="Celular" size="small" value={celular} onChange={e => setCelular(e.target.value)} /></Grid>
              </Grid>
            )}

            {/* ABA 4 - CONTRATO */}
            {tab === 3 && (
              <Grid container spacing={1.5}>
                <Grid item xs={6} sm={3}>
                  <Select fullWidth size="small" value={cargo} onChange={e => setCargo(e.target.value)}>
                    {CARGOS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </Grid>
                <Grid item xs={6} sm={3}><TextField fullWidth label="Função" size="small" value={funcao} onChange={e => setFuncao(e.target.value)} /></Grid>
                <Grid item xs={6} sm={3}><TextField fullWidth label="CBO" size="small" value={cbo} onChange={e => setCbo(e.target.value)} placeholder="514320" /></Grid>
                <Grid item xs={6} sm={3}>
                  <Select fullWidth size="small" value={status} onChange={e => setStatus(e.target.value)}>
                    <MenuItem value="ATIVO">Ativo</MenuItem>
                    <MenuItem value="FERIAS">Férias</MenuItem>
                    <MenuItem value="AFASTADO">Afastado</MenuItem>
                    <MenuItem value="DEMITIDO">Demitido</MenuItem>
                  </Select>
                </Grid>
                <Grid item xs={6} sm={4}><TextField fullWidth label="Data de Admissão" type="date" size="small" value={dataAdmissao} onChange={e => setDataAdmissao(e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
                <Grid item xs={6} sm={4}><TextField fullWidth label="Salário Base (R$)" type="number" size="small" value={salarioBase} onChange={e => setSalarioBase(e.target.value)} required /></Grid>
                <Grid item xs={6} sm={4}>
                  <Box sx={{ bgcolor: '#F0FDF9', p: 1.5, borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="caption">TOTAL CALCULADO</Typography>
                    <Typography variant="h6" fontWeight={700} color="primary">R$ {Number(salarioBase || 0).toFixed(2)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}><TextField fullWidth label="Horário Trabalho" size="small" value={horarioTrabalho} onChange={e => setHorarioTrabalho(e.target.value)} /></Grid>
                <Grid item xs={6}><TextField fullWidth label="Horário Intervalo" size="small" value={horarioIntervalo} onChange={e => setHorarioIntervalo(e.target.value)} /></Grid>
                <Grid item xs={6} sm={3}><TextField fullWidth label="Horas Extras 50%" type="number" size="small" value={horasExtras50} onChange={e => setHorasExtras50(e.target.value)} /></Grid>
                <Grid item xs={6} sm={3}><TextField fullWidth label="Horas Extras 100%" type="number" size="small" value={horasExtras100} onChange={e => setHorasExtras100(e.target.value)} /></Grid>
                <Grid item xs={6} sm={3}><TextField fullWidth label="Faltas (R$)" type="number" size="small" value={faltas} onChange={e => setFaltas(e.target.value)} /></Grid>
              </Grid>
            )}

            {/* ABA 5 - ADICIONAIS */}
            {tab === 4 && (
              <Grid container spacing={1.5}>
                <Grid item xs={6} sm={4}>
                  <FormControlLabel control={<Switch checked={temPericulosidade} onChange={e => setTemPericulosidade(e.target.checked)} color="warning" />} label="Periculosidade (30%)" />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <FormControlLabel control={<Switch checked={temAdicionalNoturno} onChange={e => setTemAdicionalNoturno(e.target.checked)} color="primary" />} label="Adic. Noturno (20%)" />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <FormControlLabel control={<Switch checked={temInsalubridade} onChange={e => setTemInsalubridade(e.target.checked)} color="error" />} label="Insalubridade" />
                  {temInsalubridade && (
                    <Select size="small" value={grauInsalubridade} onChange={e => setGrauInsalubridade(e.target.value)} sx={{ ml: 2, width: 80 }}>
                      <MenuItem value="10">10%</MenuItem><MenuItem value="20">20%</MenuItem><MenuItem value="40">40%</MenuItem>
                    </Select>
                  )}
                </Grid>
                <Grid item xs={12}><Divider><Typography variant="caption">Benefícios</Typography></Divider></Grid>
                <Grid item xs={6} sm={3}>
                  <FormControlLabel control={<Switch checked={temValeTransporte} onChange={e => setTemValeTransporte(e.target.checked)} />} label="Vale Transporte" />
                  {temValeTransporte && <TextField size="small" type="number" label="R$" value={valeTransporteValor} onChange={e => setValeTransporteValor(e.target.value)} sx={{ mt: 1 }} fullWidth />}
                </Grid>
                <Grid item xs={6} sm={3}>
                  <FormControlLabel control={<Switch checked={temValeRefeicao} onChange={e => setTemValeRefeicao(e.target.checked)} />} label="Vale Refeição" />
                  {temValeRefeicao && <TextField size="small" type="number" label="R$" value={valeRefeicaoValor} onChange={e => setValeRefeicaoValor(e.target.value)} sx={{ mt: 1 }} fullWidth />}
                </Grid>
                <Grid item xs={6} sm={3}>
                  <FormControlLabel control={<Switch checked={temPlanoSaude} onChange={e => setTemPlanoSaude(e.target.checked)} />} label="Plano Saúde" />
                  {temPlanoSaude && <TextField size="small" type="number" label="Cobertura %" value={planoSaudeCobertura} onChange={e => setPlanoSaudeCobertura(e.target.value)} sx={{ mt: 1 }} fullWidth />}
                </Grid>
                <Grid item xs={6} sm={3}>
                  <FormControlLabel control={<Switch checked={temPlanoOdonto} onChange={e => setTemPlanoOdonto(e.target.checked)} />} label="Plano Odonto" />
                  {temPlanoOdonto && <TextField size="small" type="number" label="Cobertura %" value={planoOdontoCobertura} onChange={e => setPlanoOdontoCobertura(e.target.value)} sx={{ mt: 1 }} fullWidth />}
                </Grid>
              </Grid>
            )}

            {/* ABA 6 - FÉRIAS */}
            {tab === 5 && (
              <Box>
                <Typography variant="caption" color="textSecondary" mb={2} display="block">
                  Adicione os períodos de férias (Aquisitivo + Gozo)
                </Typography>
                {feriasPeriodos.map((f, i) => (
                  <Grid container spacing={1} key={i} sx={{ mb: 1 }}>
                    <Grid item xs={5}><TextField fullWidth size="small" label="Período Aquisitivo" value={f.aquisitivo} onChange={e => {
                      const novo = [...feriasPeriodos]; novo[i].aquisitivo = e.target.value; setFeriasPeriodos(novo);
                    }} /></Grid>
                    <Grid item xs={5}><TextField fullWidth size="small" label="Período Gozo" value={f.gozo} onChange={e => {
                      const novo = [...feriasPeriodos]; novo[i].gozo = e.target.value; setFeriasPeriodos(novo);
                    }} /></Grid>
                    <Grid item xs={2}>
                      <IconButton size="small" color="error" onClick={() => setFeriasPeriodos(feriasPeriodos.filter((_, idx) => idx !== i))}>
                        <Delete />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
                <Button size="small" startIcon={<Add />} onClick={() => setFeriasPeriodos([...feriasPeriodos, { aquisitivo: '', gozo: '' }])}>
                  Adicionar Período
                </Button>
              </Box>
            )}
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
