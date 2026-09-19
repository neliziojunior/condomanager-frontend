import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import {
  Typography, Card, CardContent, Grid, Button, Box, Chip, Snackbar,
  Alert, Table, TableBody, TableCell, TableHead, TableRow, Select,
  MenuItem, IconButton, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, LinearProgress
} from '@mui/material';
import {
  CloudUpload, CheckCircle, Delete, Edit, Refresh,
  TrendingUp, TrendingDown, AutoAwesome
} from '@mui/icons-material';

export default function Reconciliation() {
  const [statements, setStatements] = useState<any[]>([]);
  const [selectedStatement, setSelectedStatement] = useState<any>(null);
  const [showReview, setShowReview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [stmtRes, condRes] = await Promise.all([
        api.get('/bank-reconciliation'),
        api.get('/condominium/me'),
      ]);
      setStatements(stmtRes.data);
      setCategories(condRes.data.categories || []);
    } catch (error) {
      console.error('Erro:', error);
    }
  }

  async function uploadFile(file: File) {
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/bank-reconciliation/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSnackbar({
        open: true,
        message: `✅ ${data.totalEntries} lançamentos extraídos pela IA!`,
        severity: 'success',
      });

      setSelectedStatement(data);
      setShowReview(true);
      loadData();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Erro ao processar extrato',
        severity: 'error',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function openReview(statementId: string) {
    try {
      const { data } = await api.get(`/bank-reconciliation/${statementId}`);
      setSelectedStatement(data);
      setShowReview(true);
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao carregar extrato', severity: 'error' });
    }
  }

  async function updateEntry(entryId: string, categoryId: string) {
    try {
      await api.put(`/bank-reconciliation/entries/${entryId}`, {
        categoryId,
        approved: true,
      });

      setSelectedStatement((prev: any) => ({
        ...prev,
        entries: prev.entries.map((e: any) =>
          e.id === entryId ? { ...e, categoryId, approved: true } : e
        ),
      }));
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao atualizar', severity: 'error' });
    }
  }

  async function approveAll() {
    if (!selectedStatement) return;

    try {
      await api.post(`/bank-reconciliation/${selectedStatement.id}/approve-all`);
      setSnackbar({ open: true, message: '✅ Todos aprovados!', severity: 'success' });
      setShowReview(false);
      loadData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao aprovar', severity: 'error' });
    }
  }

  async function deleteStatement(id: string) {
    if (!confirm('Excluir este extrato?')) return;

    try {
      await api.delete(`/bank-reconciliation/${id}`);
      setSnackbar({ open: true, message: 'Excluído!', severity: 'success' });
      loadData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao excluir', severity: 'error' });
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          🏦 Conciliação Bancária IA
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Suba o extrato bancário e a IA extrai e classifica automaticamente
        </Typography>
      </Box>

      {/* Upload */}
      <Card sx={{ mb: 3, borderRadius: 3, border: '2px dashed #00A896', bgcolor: '#F0FDF9' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          {uploading ? (
            <Box>
              <CircularProgress sx={{ color: '#00A896', mb: 2 }} />
              <Typography variant="body2">🤖 IA processando extrato...</Typography>
              <LinearProgress sx={{ mt: 2, borderRadius: 1 }} />
            </Box>
          ) : (
            <>
              <CloudUpload sx={{ fontSize: 60, color: '#00A896', mb: 1 }} />
              <Typography variant="h6" fontWeight={600}>
                Arraste o extrato aqui
              </Typography>
              <Typography variant="body2" color="textSecondary" mb={2}>
                PDF, JPG, PNG, XLSX, CSV, OFX • Até 20MB
              </Typography>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUpload />}
                sx={{ bgcolor: '#00A896', '&:hover': { bgcolor: '#028090' } }}
              >
                Selecionar Arquivo
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  accept=".pdf,.jpg,.jpeg,.png,.xlsx,.csv,.ofx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFile(file);
                  }}
                />
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Lista de Extratos */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            📋 Extratos Processados
          </Typography>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Banco</TableCell>
                <TableCell>Período</TableCell>
                <TableCell align="center">Lançamentos</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statements.map(stmt => (
                <TableRow key={stmt.id} hover>
                  <TableCell>{new Date(stmt.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{stmt.bankName || '-'}</TableCell>
                  <TableCell>
                    {stmt.periodStart && `${new Date(stmt.periodStart).toLocaleDateString('pt-BR')} a ${new Date(stmt.periodEnd).toLocaleDateString('pt-BR')}`}
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={stmt.totalEntries} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        stmt.status === 'PROCESSING' ? '⏳ Processando' :
                        stmt.status === 'REVIEW' ? '📋 Revisão' :
                        stmt.status === 'APPROVED' ? '✅ Aprovado' :
                        '❌ Erro'
                      }
                      size="small"
                      color={
                        stmt.status === 'APPROVED' ? 'success' :
                        stmt.status === 'REVIEW' ? 'warning' :
                        stmt.status === 'PROCESSING' ? 'info' :
                        'error'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => openReview(stmt.id)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => deleteStatement(stmt.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {statements.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="textSecondary" py={3}>
                      Nenhum extrato processado ainda
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Revisão */}
      <Dialog
        open={showReview}
        onClose={() => setShowReview(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          🔍 Revisar Lançamentos
          <Typography variant="caption" display="block" color="textSecondary">
            A IA sugeriu as categorias. Revise e aprove.
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedStatement && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>{selectedStatement.totalEntries}</strong> lançamentos extraídos de <strong>{selectedStatement.bankName || 'extrato'}</strong>
              </Alert>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell align="right">Valor</TableCell>
                    <TableCell>Categoria IA</TableCell>
                    <TableCell>Confiança</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedStatement.entries?.map((entry: any) => (
                    <TableRow key={entry.id} hover>
                      <TableCell>
                        {new Date(entry.date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {entry.type === 'CREDIT' ? (
                            <TrendingUp sx={{ color: '#02C39A', fontSize: 18 }} />
                          ) : (
                            <TrendingDown sx={{ color: '#E63946', fontSize: 18 }} />
                          )}
                          <Typography variant="body2" fontSize={13}>
                            {entry.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color={entry.type === 'CREDIT' ? 'success.main' : 'error.main'}
                        >
                          {entry.type === 'CREDIT' ? '+' : '-'} R$ {entry.amount.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          value={entry.categoryId || ''}
                          onChange={(e) => updateEntry(entry.id, e.target.value)}
                          displayEmpty
                          sx={{ minWidth: 180 }}
                        >
                          <MenuItem value="">Selecione</MenuItem>
                          {categories.map(c => (
                            <MenuItem key={c.id} value={c.id}>
                              {c.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        {entry.aiConfidence && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Chip
                              icon={<AutoAwesome />}
                              label={`${(entry.aiConfidence * 100).toFixed(0)}%`}
                              size="small"
                              color={
                                entry.aiConfidence >= 0.9 ? 'success' :
                                entry.aiConfidence >= 0.7 ? 'warning' :
                                'error'
                              }
                              sx={{ fontSize: 10 }}
                            />
                            {entry.aiMatched && (
                              <Chip label="🎯 Padrão" size="small" variant="outlined" sx={{ fontSize: 10 }} />
                            )}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.approved ? (
                          <Chip icon={<CheckCircle />} label="OK" size="small" color="success" />
                        ) : (
                          <Chip label="Pendente" size="small" color="warning" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReview(false)}>Fechar</Button>
          <Button
            variant="contained"
            startIcon={<CheckCircle />}
            onClick={approveAll}
            sx={{ bgcolor: '#00A896', '&:hover': { bgcolor: '#028090' } }}
          >
            ✅ Aprovar Todos
          </Button>
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
