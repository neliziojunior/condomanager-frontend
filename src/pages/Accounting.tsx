import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { 
  Typography, Card, CardContent, Grid, TextField, Button, Box, Chip, 
  Table, TableBody, TableCell, TableHead, TableRow, Snackbar, Alert,
  LinearProgress
} from '@mui/material';
import { Sync, Compare, Upload, CheckCircle, Warning, Error as ErrorIcon, CloudUpload } from '@mui/icons-material';

export default function Accounting() {
  const [entries, setEntries] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [divergences, setDivergences] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [jsonInput, setJsonInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [entriesRes, summaryRes] = await Promise.all([
      api.get('/accounting'),
      api.get('/accounting/summary')
    ]);
    setEntries(entriesRes.data);
    setSummary(summaryRes.data);
  }

  async function syncSystem() {
    setLoading(true);
    await api.post('/accounting/sync');
    setSnackbar({ open: true, message: 'Sistema sincronizado!', severity: 'success' });
    loadData();
    setLoading(false);
  }

  // ✅ NOVO: Upload de arquivo CSV
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

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={1}>📊 Verificação Contábil</Typography>
      <Typography variant="caption" color="textSecondary" mb={3} display="block">
        Compare os lançamentos do sistema com os do contador e identifique divergências
      </Typography>

      {/* Resumo */}
      {summary && (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} md={3}>
            <Card sx={{ borderRadius: 2, bgcolor: '#F0FDF9' }}>
              <CardContent>
                <Typography variant="caption" color="textSecondary">SISTEMA</Typography>
                <Typography variant="h6" fontWeight={700}>R$ {summary.systemTotal.toFixed(2)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ borderRadius: 2, bgcolor: '#FFFBF0' }}>
              <CardContent>
                <Typography variant="caption" color="textSecondary">CONTADOR</Typography>
                <Typography variant="h6" fontWeight={700}>R$ {summary.accountantTotal.toFixed(2)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ borderRadius: 2, bgcolor: summary.difference === 0 ? '#F0FDF9' : '#FFF5F5' }}>
              <CardContent>
                <Typography variant="caption" color="textSecondary">DIFERENÇA</Typography>
                <Typography variant="h6" fontWeight={700} color={summary.difference === 0 ? 'success.main' : 'error.main'}>
                  R$ {summary.difference.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ borderRadius: 2 }}>
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
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <Button variant="contained" startIcon={<Sync />} onClick={syncSystem} disabled={loading} fullWidth>
                Sincronizar Sistema
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button variant="contained" color="warning" startIcon={<Compare />} onClick={compareEntries} disabled={loading} fullWidth>
                Comparar
              </Button>
            </Grid>
            {/* ✅ NOVO: Upload CSV */}
            <Grid item xs={12} md={3}>
              <Button variant="outlined" component="label" startIcon={<CloudUpload />} fullWidth>
                Upload CSV
                <input type="file" hidden accept=".csv" ref={fileRef} onChange={uploadCsv} />
              </Button>
            </Grid>
            {/* JSON Manual */}
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

      {/* Divergências */}
      {divergences && divergences.divergences?.length > 0 && (
        <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid #F0A500' }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} color="#F0A500" mb={2}>
              ⚠️ {divergences.divergences.length} Divergência(s)
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
      <Card sx={{ borderRadius: 2 }}>
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
                <TableCell><Chip label={entry.source === 'CONDONET' ? '🏢 Sistema' : '👔 Contador'} size="small" color={entry.source === 'CONDONET' ? 'primary' : 'warning'} /></TableCell>
                <TableCell>
                  {entry.reconciled ? <Chip icon={<CheckCircle />} label="OK" size="small" color="success" /> :
                   entry.difference && entry.difference > 0 ? <Chip icon={<ErrorIcon />} label="Divergente" size="small" color="error" /> :
                   <Chip icon={<Warning />} label="Pendente" size="small" />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity as any}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
