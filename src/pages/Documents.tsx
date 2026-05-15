import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Typography, Card, CardContent, Grid, TextField, Button, Select, MenuItem, Box, Chip, IconButton, Snackbar } from '@mui/material';
import { Add, Delete, Download, PictureAsPdf, Description } from '@mui/icons-material';

export default function Documents() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadDocuments(); }, [filterCategory]);

  async function loadDocuments() {
    const { data } = await api.get('/documents', { params: { category: filterCategory } });
    setDocuments(data);
  }

  async function uploadFile() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    form.append('title', title);
    form.append('category', category);
    try {
      await api.post('/documents', form);
      setSnackbar({ open: true, message: 'Documento enviado!', severity: 'success' });
      setTitle('');
      loadDocuments();
    } catch (e) {
      setSnackbar({ open: true, message: 'Erro ao enviar', severity: 'error' });
    }
  }

  async function deleteDoc(id: string) {
    await api.delete(`/documents/${id}`);
    loadDocuments();
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={3}>📄 Documentos</Typography>
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField fullWidth size="small" label="Título" value={title} onChange={e => setTitle(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <Select fullWidth size="small" value={category} onChange={e => setCategory(e.target.value)}>
                <MenuItem value="MINUTES">Ata</MenuItem>
                <MenuItem value="RULES">Regimento</MenuItem>
                <MenuItem value="CONTRACT">Contrato</MenuItem>
                <MenuItem value="OTHER">Outro</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button variant="outlined" size="small" component="label" fullWidth>
                <Add fontSize="small" sx={{ mr: 1 }} /> Selecionar Arquivo
                <input type="file" hidden ref={fileRef} />
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button variant="contained" size="small" fullWidth onClick={uploadFile}>Enviar</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Grid container spacing={2}>
        {documents.map(doc => (
          <Grid item xs={12} sm={6} md={4} key={doc.id}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between">
                  <Description fontSize="small" color="primary" />
                  <IconButton size="small" onClick={() => deleteDoc(doc.id)}><Delete fontSize="small" /></IconButton>
                </Box>
                <Typography fontWeight={600} fontSize={14}>{doc.title}</Typography>
                <Chip label={doc.category} size="small" sx={{ mt: 1, fontSize: 10 }} />
                <Button size="small" href={`http://localhost:3333${doc.fileUrl}`} target="_blank" startIcon={<Download />} sx={{ mt: 1 }}>Baixar</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
