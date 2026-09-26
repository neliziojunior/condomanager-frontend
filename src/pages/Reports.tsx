import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import {
  Typography, Card, CardContent, Grid, Button, Box, Chip, Snackbar,
  Alert, Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, LinearProgress, TextField,
  Select, MenuItem, Divider, Paper
} from '@mui/material';
import {
  CloudUpload, CheckCircle, Delete, Visibility
} from '@mui/icons-material';

export default function Reports() {
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showConfirmUpload, setShowConfirmUpload] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const { data } = await api.get('/reports');
      setReports(data);
    } catch (error) {
      console.error('Erro:', error);
    }
  }

  function handleFileSelect(file: File) {
    setPendingFile(file);
    setShowConfirmUpload(true);
  }

  async function confirmUpload() {
    if (!pendingFile) return;
    setUploading(true);
    setShowConfirmUpload(false);

    const formData = new FormData();
    formData.append('file', pendingFile);
    formData.append('year', String(year));
    formData.append('month', String(month));
    formData.append('sourceType', 'BRCONDOMINIO');

    try {
      const { data } = await api.post('/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSnackbar({
        open: true,
        message: `✅ Relatório processado! Confiança: ${Math.round((data.confidence || 0) * 100)}%`,
        severity: data.status === 'FAILED' ? 'warning' : 'success',
      });

      setPendingFile(null);
      loadData();
      openDetail(data.id);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Erro ao processar PDF',
        severity: 'error',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function openDetail(id: string) {
    try {
      const { data } = await api.get(`/reports/${id}`);
      setSelectedReport(data);
      setShowDetail(true);
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao carregar', severity: 'error' });
    }
  }

  async function approveReport(id: string) {
    try {
      await api.post(`/reports/${id}/approve`);
      setSnackbar({ open: true, message: '✅ Aprovado!', severity: 'success' });
      setShowDetail(false);
      loadData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao aprovar', severity: 'error' });
    }
  }

  async function deleteReport(id: string) {
    if (!confirm('Excluir este relatório?')) return;
    try {
      await api.delete(`/reports/${id}`);
      setSnackbar({ open: true, message: 'Excluído!', severity: 'success' });
      loadData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao excluir', severity: 'error' });
    }
  }

  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>📑 Prestação de Contas</Typography>
        <Typography variant="caption" color="textSecondary">
          Suba o PDF do contador e o sistema extrai os dados automaticamente
        </Typography>
      </Box>

      {/* Card de upload */}
      <Card sx={{ mb: 3, borderRadius: 3, border: '2px dashed #00A896', bgcolor: '#F0FDF9' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          {uploading ? (
            <Box>
              <CircularProgress sx={{ color: '#00A896', mb: 2 }} />
              <Typography variant="body2">Processando PDF...</Typography>
              <LinearProgress sx={{ mt: 2, borderRadius: 1 }} />
            </Box>
          ) : (
            <>
              <CloudUpload sx={{ fontSize: 60, color: '#00A896', mb: 1 }} />
              <Typography variant="h6" fontWeight={600}>Suba a prestação de contas</Typography>
              <Typography variant="body2" color="textSecondary" mb={2}>
                PDF do BRCondomínio • Até 20MB
              </Typography>
              <Grid container spacing={2} justifyContent="center" sx={{ mb: 2, maxWidth: 400, mx: 'auto' }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth size="small" type="number"
                    label="Ano" value={year}
                    onChange={e => setYear(Number(e.target.value))}
                    inputProps={{ min: 2020, max: 2100 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Select
                    fullWidth size="small" value={month}
                    onChange={e => setMonth(Number(e.target.value))}
                  >
                    {monthNames.map((m, i) => (
                      <MenuItem key={i} value={i + 1}>{m}</MenuItem>
                    ))}
                  </Select>
                </Grid>
              </Grid>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUpload />}
                sx={{ bgcolor: '#00A896', '&:hover': { bgcolor: '#028090' } }}
              >
                Selecionar PDF
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Lista */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>📋 Relatórios Processados</Typography>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Período</TableCell>
                <TableCell>Arquivo</TableCell>
                <TableCell align="right">Saldo Anterior</TableCell>
                <TableCell align="right">Receitas</TableCell>
                <TableCell align="right">Despesas</TableCell>
                <TableCell align="right">Saldo Atual</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map(r => (
                <TableRow key={r.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {monthNames[r.month - 1]}/{r.year}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="textSecondary">
                      {r.sourceType}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontSize={12}>
                      R$ {r.previousBalance.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontSize={12} color="success.main">
                      R$ {r.totalRevenues.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontSize={12} color="error.main">
                      R$ {r.totalExpenses.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontSize={12} fontWeight={600}>
                      R$ {r.currentBalance.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        r.status === 'PROCESSING' ? '⏳ Processando' :
                        r.status === 'REVIEW' ? '📋 Revisão' :
                        r.status === 'APPROVED' ? '✅ Aprovado' :
                        '❌ Erro'
                      }
                      size="small"
                      color={
                        r.status === 'APPROVED' ? 'success' :
                        r.status === 'REVIEW' ? 'warning' :
                        r.status === 'PROCESSING' ? 'info' :
                        'error'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => openDetail(r.id)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => deleteReport(r.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {reports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary" py={3}>
                      Nenhum relatório processado ainda
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de confirmação de upload */}
      <Dialog open={showConfirmUpload} onClose={() => setShowConfirmUpload(false)} maxWidth="xs" fullWidth>
        <DialogTitle>📄 Confirmar Período</DialogTitle>
        <DialogContent>
          <Typography variant="body2" mb={2}>
            O PDF será processado como:
          </Typography>
          <Paper sx={{ p: 2, bgcolor: '#F0FDF9' }}>
            <Typography variant="h6" fontWeight={700} color="#00A896">
              {monthNames[month - 1]}/{year}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {pendingFile?.name}
            </Typography>
          </Paper>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
            Se o período estiver errado, cancele e ajuste antes de subir.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmUpload(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={confirmUpload}
            sx={{ bgcolor: '#00A896', '&:hover': { bgcolor: '#028090' } }}
          >
            Processar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de detalhe */}
      <Dialog open={showDetail} onClose={() => setShowDetail(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          📄 {selectedReport && `${monthNames[selectedReport.month - 1]}/${selectedReport.year}`}
          <Typography variant="caption" display="block" color="textSecondary">
            {selectedReport?.sourceType} • Confiança: {Math.round((selectedReport?.confidence || 0) * 100)}%
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ bgcolor: '#F7F9FC', p: 1.5, borderRadius: 2 }}>
                    <Typography variant="caption" color="textSecondary">SALDO ANTERIOR</Typography>
                    <Typography variant="h6" fontWeight={700}>
                      R$ {selectedReport.previousBalance.toFixed(2)}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ bgcolor: '#F0FDF9', p: 1.5, borderRadius: 2 }}>
                    <Typography variant="caption" color="textSecondary">RECEITAS</Typography>
                    <Typography variant="h6" fontWeight={700} color="success.main">
                      R$ {selectedReport.totalRevenues.toFixed(2)}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ bgcolor: '#FFF5F5', p: 1.5, borderRadius: 2 }}>
                    <Typography variant="caption" color="textSecondary">DESPESAS</Typography>
                    <Typography variant="h6" fontWeight={700} color="error.main">
                      R$ {selectedReport.totalExpenses.toFixed(2)}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ bgcolor: '#F0FDF9', p: 1.5, borderRadius: 2 }}>
                    <Typography variant="caption" color="textSecondary">SALDO ATUAL</Typography>
                    <Typography variant="h6" fontWeight={700} color="#00A896">
                      R$ {selectedReport.currentBalance.toFixed(2)}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                🔍 Dados extraídos (JSON)
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#F7F9FC', borderRadius: 2, maxHeight: 300, overflow: 'auto' }}>
                <pre style={{ margin: 0, fontSize: 12 }}>
                  {JSON.stringify(selectedReport.extractedData, null, 2)}
                </pre>
              </Paper>

              {selectedReport.status === 'FAILED' && selectedReport.errorMessage && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {selectedReport.errorMessage}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetail(false)}>Fechar</Button>
          {selectedReport?.status === 'REVIEW' && (
            <Button
              variant="contained"
              startIcon={<CheckCircle />}
              onClick={() => approveReport(selectedReport.id)}
              sx={{ bgcolor: '#00A896', '&:hover': { bgcolor: '#028090' } }}
            >
              ✅ Aprovar
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity as any}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
