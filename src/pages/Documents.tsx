import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import {
  Typography, Card, CardContent, Grid, TextField, Button, Select, MenuItem,
  Box, Chip, IconButton, Snackbar, InputAdornment, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, Tooltip
} from '@mui/material';
import {
  Add, Delete, Download, PictureAsPdf, Description, Search,
  CloudUpload, InsertDriveFile, Visibility, Image as ImageIcon
} from '@mui/icons-material';

const CATEGORIES = [
  { value: 'MINUTES', label: '📝 Ata de Assembleia' },
  { value: 'RULES', label: '📋 Regimento Interno' },
  { value: 'CONTRACT', label: '📄 Contrato' },
  { value: 'FINANCIAL', label: '💰 Documento Financeiro' },
  { value: 'INSURANCE', label: '🛡️ Seguro' },
  { value: 'OTHER', label: '📎 Outro' },
];

const CATEGORY_COLORS: any = {
  MINUTES: '#6c5ce7',
  RULES: '#00A896',
  CONTRACT: '#F0A500',
  FINANCIAL: '#02C39A',
  INSURANCE: '#e74c3c',
  OTHER: '#636e72',
};

export default function Documents() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('MINUTES');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3333'
    : 'https://condpro.onrender.com';

  useEffect(() => {
    loadDocuments();
  }, [filterCategory, searchTerm]);

  async function loadDocuments() {
    const { data } = await api.get('/documents', {
      params: { category: filterCategory, search: searchTerm },
    });
    setDocuments(data);
  }

  function handleFileSelect(file: File) {
    if (file.size > 20 * 1024 * 1024) {
      setSnackbar({ open: true, message: 'Arquivo maior que 20MB', severity: 'error' });
      return;
    }
    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  }

  async function uploadFile() {
    if (!selectedFile || !title) {
      setSnackbar({ open: true, message: 'Preencha título e selecione arquivo', severity: 'warning' });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title);
    formData.append('category', category);

    try {
      await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSnackbar({ open: true, message: '✅ Documento enviado!', severity: 'success' });
      setShowUpload(false);
      setTitle('');
      setSelectedFile(null);
      setCategory('MINUTES');
      loadDocuments();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Erro ao enviar', severity: 'error' });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function deleteDocument(id: string) {
    if (!confirm('Excluir este documento?')) return;
    await api.delete(`/documents/${id}`);
    setSnackbar({ open: true, message: 'Excluído!', severity: 'success' });
    loadDocuments();
  }

  function getFileIcon(doc: any) {
    const url = doc.fileUrl || '';
    if (url.match(/\.(jpg|jpeg|png)$/i)) return <ImageIcon />;
    if (url.match(/\.pdf$/i)) return <PictureAsPdf />;
    return <InsertDriveFile />;
  }

  function isPreviewable(doc: any) {
    const url = doc.fileUrl || '';
    return url.match(/\.(jpg|jpeg|png|pdf)$/i);
  }

  function getCategoryLabel(value: string) {
    return CATEGORIES.find(c => c.value === value)?.label || value;
  }

  // Agrupar por categoria
  const grouped = documents.reduce((acc: any, doc) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {});

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>📄 Documentos</Typography>
          <Typography variant="caption" color="textSecondary">
            {documents.length} documento(s) armazenado(s)
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setShowUpload(true)} sx={{ bgcolor: '#00A896' }}>
          Novo Documento
        </Button>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth size="small" placeholder="Buscar documentos..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Select fullWidth size="small" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} displayEmpty>
                <MenuItem value="">Todas as categorias</MenuItem>
                {CATEGORIES.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
              </Select>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lista por categoria */}
      {Object.keys(grouped).length === 0 && (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Description sx={{ fontSize: 60, color: '#E0E0E0', mb: 2 }} />
            <Typography color="textSecondary">Nenhum documento cadastrado</Typography>
            <Button variant="contained" onClick={() => setShowUpload(true)} sx={{ mt: 2, bgcolor: '#00A896' }}>
              Enviar Primeiro Documento
            </Button>
          </CardContent>
        </Card>
      )}

      {Object.entries(grouped).map(([cat, docs]: any) => (
        <Box key={cat} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Chip
              label={getCategoryLabel(cat)}
              size="small"
              sx={{ bgcolor: CATEGORY_COLORS[cat], color: 'white', fontWeight: 600 }}
            />
            <Typography variant="caption" color="textSecondary">
              {docs.length} documento(s)
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {docs.map((doc: any) => (
              <Grid item xs={12} sm={6} md={4} key={doc.id}>
                <Card sx={{ borderRadius: 2, height: '100%', border: '1px solid #F0F0F0' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ color: CATEGORY_COLORS[doc.category], fontSize: 32 }}>
                        {getFileIcon(doc)}
                      </Box>
                      <Box>
                        {isPreviewable(doc) && (
                          <Tooltip title="Pré-visualizar">
                            <IconButton size="small" onClick={() => setPreviewDoc(doc)}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Excluir">
                          <IconButton size="small" color="error" onClick={() => deleteDocument(doc.id)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Typography variant="body2" fontWeight={600} fontSize={14} sx={{ mb: 0.5 }}>
                      {doc.title}
                    </Typography>

                    <Typography variant="caption" color="textSecondary" display="block">
                      📅 {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 1.5 }}>
                      👤 {doc.uploadedBy || 'Sistema'}
                    </Typography>

                    <Button
                      fullWidth size="small" variant="outlined"
                      startIcon={<Download />}
                      href={`${API_URL}${doc.fileUrl}`}
                      target="_blank"
                      sx={{ textTransform: 'none' }}
                    >
                      Baixar
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

      {/* Modal de Upload */}
      <Dialog open={showUpload} onClose={() => setShowUpload(false)} maxWidth="sm" fullWidth>
        <DialogTitle>📤 Novo Documento</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth label="Título do documento" size="small"
                value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Ata Assembleia Maio 2026"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Select fullWidth size="small" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
              </Select>
            </Grid>
            <Grid item xs={12}>
              <Box
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                onClick={() => fileRef.current?.click()}
                sx={{
                  border: '2px dashed',
                  borderColor: dragOver ? '#00A896' : '#E0E0E0',
                  bgcolor: dragOver ? '#F0FDF9' : '#F7F9FC',
                  borderRadius: 2, p: 4, textAlign: 'center', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <CloudUpload sx={{ fontSize: 48, color: '#00A896', mb: 1 }} />
                {selectedFile ? (
                  <>
                    <Typography variant="body2" fontWeight={600}>{selectedFile.name}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" fontWeight={600}>
                      Arraste o arquivo aqui ou clique para selecionar
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      PDF, DOCX, XLSX, JPG, PNG • Até 20MB
                    </Typography>
                  </>
                )}
                <input
                  type="file" hidden ref={fileRef}
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowUpload(false); setSelectedFile(null); setTitle(''); }}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={uploadFile}
            disabled={!selectedFile || !title || uploading}
            startIcon={<CloudUpload />}
            sx={{ bgcolor: '#00A896', '&:hover': { bgcolor: '#028090' } }}
          >
            {uploading ? 'Enviando...' : 'Enviar Documento'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Pré-visualização */}
      <Dialog open={!!previewDoc} onClose={() => setPreviewDoc(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          👁️ {previewDoc?.title}
          <Typography variant="caption" display="block" color="textSecondary">
            {getCategoryLabel(previewDoc?.category)}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {previewDoc?.fileUrl?.match(/\.(jpg|jpeg|png)$/i) ? (
            <Box sx={{ textAlign: 'center' }}>
              <img
                src={`${API_URL}${previewDoc.fileUrl}`}
                alt={previewDoc.title}
                style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8 }}
              />
            </Box>
          ) : previewDoc?.fileUrl?.match(/\.pdf$/i) ? (
            <Box sx={{ height: '70vh' }}>
              <iframe
                src={`${API_URL}${previewDoc.fileUrl}`}
                title={previewDoc.title}
                style={{ width: '100%', height: '100%', border: 'none', borderRadius: 8 }}
              />
            </Box>
          ) : (
            <Alert severity="info">
              Pré-visualização não disponível para este tipo de arquivo.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDoc(null)}>Fechar</Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            href={`${API_URL}${previewDoc?.fileUrl}`}
            target="_blank"
            sx={{ bgcolor: '#00A896' }}
          >
            Baixar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity as any}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
