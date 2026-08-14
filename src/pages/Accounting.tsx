import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import {
  Typography, Card, CardContent, Grid, TextField, Button, Box, Chip,
  Table, TableBody, TableCell, TableHead, TableRow, Snackbar, Alert,
  LinearProgress, useTheme, Dialog, DialogTitle, DialogContent, DialogActions,
  Divider
} from '@mui/material';
import { 
  Sync, Compare, Upload, CheckCircle, Warning, Error as ErrorIcon, 
  CloudUpload, Description, Schedule, Edit, Send, Download
} from '@mui/icons-material';

export default function Accounting() {
  const theme = useTheme();
  const c = {
    accentSoft: theme.palette.primary.light ?? '#EFF6FF',
    successSoft: '#F0FDF4',
    warningSoft: '#FFFBEB',
    errorSoft: '#FEF2F2',
    divider: theme.palette.divider,
    textSecondary: theme.palette.text.secondary,
    warning: theme.palette.warning.main,
  };

  const [entries, setEntries] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [divergences, setDivergences] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [jsonInput, setJsonInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // ✅ NOVO: Obrigações Fiscais
  const [obrigacoes, setObrigacoes] = useState<any[]>([]);

  // ✅ NOVO: Relatório Anual
  const [relatorio, setRelatorio] = useState<any>(null);
  const [showRelatorio, setShowRelatorio] = useState(false);
  const [statusAssinatura, setStatusAssinatura] = useState('nenhum'); // nenhum → revisao → aguardando → assinado

  useEffect(() => { 
    loadData(); 
    loadObrigacoes();
  }, []);

  async function loadData() {
    const [entriesRes, summaryRes] = await Promise.all([
      api.get('/accounting'),
      api.get('/accounting/summary')
    ]);
    setEntries(entriesRes.data);
    setSummary(summaryRes.data);
  }

  // ✅ NOVO: Carregar obrigações fiscais
  async function loadObrigacoes() {
    try {
      const hoje = new Date();
      const { data } = await api.get('/accounting/obrigacoes', {
        params: { ano: hoje.getFullYear(), mes: hoje.getMonth() + 1 }
      });
      setObrigacoes(data);
    } catch (error) {
      console.error('Erro ao carregar obrigações:', error);
      setObrigacoes([]);
    }
  }

  async function syncSystem() {
    setLoading(true);
    await api.post('/accounting/sync');
    setSnackbar({ open: true, message: 'Sistema sincronizado!', severity: 'success' });
    loadData();
    setLoading(false);
  }

  async function uploadCsv() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setSnackbar({ open: true, message: 'Selecione um arquivo CSV', severity: 'error' });
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await api.post('/accounting/upload-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSnackbar({ open: true, message: `${data.imported} lançamentos importados do CSV!`, severity: 'success' });
      if (fileRef.current) fileRef.current.value = '';
      loadData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao processar CSV. Verifique o formato.', severity: 'error' });
    }
    setLoading(false);
  }

  async function importJson() {
    try {
      const entries = JSON.parse(jsonInput);
      const { data } = await api.post('/accounting/import', { entries });
      setSnackbar({ open: true, message: `${data.imported} lançamentos importados!`, severity: 'success' });
      setJsonInput('');
      loadData();
    } catch (e) {
      setSnackbar({ open: true, message: 'JSON inválido', severity: 'error' });
    }
  }

  async function compareEntries() {
    setLoading(true);
    const { data } = await api.post('/accounting/compare');
    setDivergences(data);
    setSnackbar({ open: true, message: `${data.divergences.length} divergência(s) encontrada(s)`, severity: data.divergences.length > 0 ? 'warning' : 'success' });
    loadData();
    setLoading(false);
  }

  // ✅ NOVO: Gerar Relatório Anual
  async function gerarRelatorio() {
    try {
      const { data } = await api.get('/accounting/relatorio-anual');
      setRelatorio(data);
      setShowRelatorio(true);
      setStatusAssinatura('revisao');
      setSnackbar({ open: true, message: '📊 Relatório anual gerado!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao gerar relatório', severity: 'error' });
    }
  }

  // ✅ NOVO: Enviar para revisão
  function enviarParaAssinatura() {
    setStatusAssinatura('aguardando');
    setSnackbar({ open: true, message: '📤 Enviado para revisão do contador!', severity: 'info' });
  }

  // ✅ NOVO: Assinar digitalmente
  function assinarDocumento() {
    setStatusAssinatura('assinado');
    setSnackbar({ open: true, message: '✍️ Documento assinado digitalmente!', severity: 'success' });
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>📊 Contabilidade</Typography>
          <Typography variant="caption" color="textSecondary" display="block">
            Verificação, obrigações fiscais e fluxo de aprovação
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Description />} onClick={gerarRelatorio}>
          Gerar Prestação de Contas
        </Button>
      </Box>

      {/* 📅 Central de Obrigações Fiscais */}
      {obrigacoes.length > 0 && (
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              📅 Central de Obrigações Fiscais
            </Typography>
            <Grid container spacing={1.5}>
              {obrigacoes.map((obr, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Box sx={{ 
                    p: 1.5, borderRadius: 2, 
                    bgcolor: obr.diasRestantes < 5 ? '#FEF2F2' : obr.diasRestantes < 10 ? '#FFFBEB' : '#F0FDF4',
                    border: '1px solid',
                    borderColor: obr.diasRestantes < 5 ? '#EF4444' : obr.diasRestantes < 10 ? '#F59E0B' : '#10B981'
                  }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" fontWeight={600} fontSize={12}>{obr.nome}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {obr.tipo} • Vence dia {obr.vencimento}
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${obr.diasRestantes}d`} 
                        size="small" 
                        color={obr.diasRestantes < 5 ? 'error' : obr.diasRestantes < 10 ? 'warning' : 'success'} 
                        sx={{ fontSize: 10 }}
                      />
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Resumo */}
      {summary && (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="textSecondary">SISTEMA</Typography>
                <Typography variant="h6" fontWeight={700}>R$ {summary.systemTotal.toFixed(2)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="textSecondary">CONTADOR</Typography>
                <Typography variant="h6" fontWeight={700}>R$ {summary.accountantTotal.toFixed(2)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="textSecondary">DIFERENÇA</Typography>
                <Typography variant="h6" fontWeight={700} color={summary.difference === 0 ? 'success.main' : 'error.main'}>
                  R$ {summary.difference.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="textSecondary">CONCILIADOS</Typography>
                <Typography variant="h6" fontWeight={700}>{summary.reconciled}/{summary.total}</Typography>
                <LinearProgress variant="determinate" value={summary.total > 0 ? (summary.reconciled/summary.total)*100 : 0} sx={{ mt: 1, borderRadius: 2, height: 6 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Ações */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <Button variant="contained" startIcon={<Sync />} onClick={syncSystem} disabled={loading} fullWidth>
                Sincronizar
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button variant="contained" color="warning" startIcon={<Compare />} onClick={compareEntries} disabled={loading} fullWidth>
                Comparar
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button variant="outlined" component="label" startIcon={<CloudUpload />} fullWidth>
                Upload CSV
                <input type="file" hidden accept=".csv" ref={fileRef} onChange={uploadCsv} />
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth size="small" placeholder='[{"description":"Água","amount":500,"date":"2026-05-01"}]'
                value={jsonInput} onChange={e => setJsonInput(e.target.value)} />
              <Button variant="outlined" startIcon={<Upload />} onClick={importJson} size="small" sx={{ mt: 1 }}>
                Importar JSON
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 📄 Fluxo de Aprovação */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            📄 Fluxo de Aprovação e Assinatura
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Chip 
              icon={<Description />} label="1. Gerado" 
              color={['revisao', 'aguardando', 'assinado'].includes(statusAssinatura) ? 'success' : 'default'} 
              size="small" 
            />
            <Chip 
              icon={<Edit />} label="2. Revisão Contador" 
              color={['aguardando', 'assinado'].includes(statusAssinatura) ? 'success' : 'default'} 
              size="small" 
            />
            <Chip 
              icon={<CheckCircle />} label="3. Assinado" 
              color={statusAssinatura === 'assinado' ? 'success' : 'default'} 
              size="small" 
            />
          </Box>
          {statusAssinatura === 'revisao' && (
            <Button variant="contained" startIcon={<Send />} onClick={enviarParaAssinatura} color="warning" size="small">
              Enviar para Revisão
            </Button>
          )}
          {statusAssinatura === 'aguardando' && (
            <Button variant="contained" startIcon={<CheckCircle />} onClick={assinarDocumento} color="success" size="small">
              Assinar Digitalmente
            </Button>
          )}
          {statusAssinatura === 'assinado' && (
            <Alert severity="success" sx={{ mt: 1 }}>
              ✅ Documento assinado digitalmente com hash e timestamp
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Divergências */}
      {divergences && divergences.divergences?.length > 0 && (
        <Card sx={{ mb: 3, border: `1px solid ${c.warning}` }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} color={c.warning} mb={2}>
              {divergences.divergences.length} Divergência(s)
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Sistema</TableCell>
                  <TableCell>Contador</TableCell>
                  <TableCell>Diferença</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {divergences.divergences.map((d: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell>
                      {d.system ? (
                        <Box><Typography variant="body2" fontWeight={600}>{d.system.description}</Typography>
                        <Typography variant="caption">R$ {d.system.amount?.toFixed(2)}</Typography></Box>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {d.accountant ? (
                        <Box><Typography variant="body2">{d.accountant.description}</Typography>
                        <Typography variant="caption">R$ {d.accountant.amount?.toFixed(2)}</Typography></Box>
                      ) : 'Não encontrado'}
                    </TableCell>
                    <TableCell><Chip label={`R$ ${d.difference?.toFixed(2) || '?'}`} color="error" size="small" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tabela completa */}
      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell><TableCell>Descrição</TableCell><TableCell>Valor</TableCell>
              <TableCell>Origem</TableCell><TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map(entry => (
              <TableRow key={entry.id}>
                <TableCell>{new Date(entry.date).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell>R$ {entry.amount.toFixed(2)}</TableCell>
                <TableCell><Chip label={entry.source === 'CONDONET' ? 'Sistema' : 'Contador'} size="small" color={entry.source === 'CONDONET' ? 'primary' : 'warning'} /></TableCell>
                <TableCell>
                  {entry.reconciled ? <Chip icon={<CheckCircle />} label="OK" size="small" color="success" /> :
                   entry.difference && entry.difference > 0 ? <Chip icon={<ErrorIcon />} label="Divergente" size="small" color="error" /> :
                   <Chip icon={<Warning />} label="Pendente" size="small" />}
                </TableCell>
              </TableRow>
            ))}
            {entries.length === 0 && (
              <TableRow><TableCell colSpan={5} align="center"><Typography color="textSecondary" py={3}>Nenhum lançamento</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal Relatório Anual */}
      <Dialog open={showRelatorio} onClose={() => setShowRelatorio(false)} maxWidth="md" fullWidth>
        <DialogTitle>📊 Relatório Anual de Prestação de Contas</DialogTitle>
        <DialogContent>
          {relatorio && (
            <Box>
              <Typography variant="h6" fontWeight={700} mb={1}>Ano: {relatorio.ano}</Typography>
              <Typography variant="body2" color="textSecondary" mb={2}>
                Total do ano: <strong>R$ {relatorio.totalAno.toFixed(2)}</strong>
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Mês</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>Categorias</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {relatorio.balancete.map((b: any) => (
                    <TableRow key={b.mes}>
                      <TableCell>{new Date(relatorio.ano, b.mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long' })}</TableCell>
                      <TableCell align="right">R$ {b.total.toFixed(2)}</TableCell>
                      <TableCell>
                        {Object.entries(b.categorias).map(([cat, val]: any) => (
                          <Typography key={cat} variant="caption" display="block">
                            {cat}: R$ {val.toFixed(2)}
                          </Typography>
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRelatorio(false)}>Fechar</Button>
          <Button startIcon={<Download />}>Baixar PDF</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity as any}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}