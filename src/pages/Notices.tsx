import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Typography, Card, CardContent, Grid, TextField, Button, Select, MenuItem,
  Box, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar
} from '@mui/material';
import { Add, Delete, Campaign, Event, Build, Info } from '@mui/icons-material';

const CATEGORY_ICONS: any = {
  GENERAL: <Info />,
  URGENT: <Campaign />,
  EVENT: <Event />,
  MAINTENANCE: <Build />,
};

const CATEGORY_COLORS: any = {
  GENERAL: '#636e72',
  URGENT: '#e74c3c',
  EVENT: '#6c5ce7',
  MAINTENANCE: '#f39c12',
};

export default function Notices() {
  const [notices, setNotices] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [priority, setPriority] = useState('NORMAL');

  useEffect(() => { loadNotices(); }, [filterCategory]);

  async function loadNotices() {
    const { data } = await api.get('/notices', { params: { category: filterCategory, activeOnly: 'true' } });
    setNotices(data);
  }

  async function createNotice(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/notices', { title, content, category, priority });
      setSnackbar({ open: true, message: 'Aviso publicado!', severity: 'success' });
      setShowForm(false);
      setTitle(''); setContent(''); setCategory('GENERAL'); setPriority('NORMAL');
      loadNotices();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao publicar', severity: 'error' });
    }
  }

  async function deleteNotice(id: string) {
    if (!confirm('Remover este aviso?')) return;
    await api.delete(`/notices/${id}`);
    loadNotices();
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18 }}>📢 Mural de Avisos</Typography>
          <Typography variant="caption" color="textSecondary">{notices.length} aviso(s) ativo(s)</Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<Add />} onClick={() => setShowForm(true)}>
          Novo Aviso
        </Button>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Select fullWidth size="small" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} displayEmpty>
            <MenuItem value="">Todas as categorias</MenuItem>
            <MenuItem value="GENERAL">Geral</MenuItem>
            <MenuItem value="URGENT">Urgente</MenuItem>
            <MenuItem value="EVENT">Evento</MenuItem>
            <MenuItem value="MAINTENANCE">Manutenção</MenuItem>
          </Select>
        </CardContent>
      </Card>

      {/* Lista de avisos */}
      <Grid container spacing={2}>
        {notices.map(notice => (
          <Grid item xs={12} key={notice.id}>
            <Card sx={{ 
              borderRadius: 2, 
              borderLeft: `4px solid ${CATEGORY_COLORS[notice.category]}`,
              opacity: notice.isActive ? 1 : 0.6
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                    <Chip 
                      icon={CATEGORY_ICONS[notice.category]} 
                      label={notice.category === 'URGENT' ? 'Urgente' : notice.category === 'EVENT' ? 'Evento' : notice.category === 'MAINTENANCE' ? 'Manutenção' : 'Geral'}
                      size="small"
                      sx={{ 
                        bgcolor: CATEGORY_COLORS[notice.category], 
                        color: 'white',
                        fontSize: 10
                      }}
                    />
                    {notice.priority === 'HIGH' && (
                      <Chip label="Prioridade" size="small" color="error" sx={{ fontSize: 10 }} />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(notice.createdAt).toLocaleDateString('pt-BR')}
                    </Typography>
                    <IconButton size="small" onClick={() => deleteNotice(notice.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: 14 }}>
                  {notice.title}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 12, color: '#636e72', mt: 0.5 }}>
                  {notice.content}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {notices.length === 0 && (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="textSecondary">📢 Nenhum aviso publicado</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Modal Novo Aviso */}
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>📢 Novo Aviso</DialogTitle>
        <form onSubmit={createNotice}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Título" value={title} onChange={e => setTitle(e.target.value)} required size="small" />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Mensagem" value={content} onChange={e => setContent(e.target.value)} required size="small" multiline rows={3} />
              </Grid>
              <Grid item xs={6}>
                <Select fullWidth value={category} onChange={e => setCategory(e.target.value)} size="small">
                  <MenuItem value="GENERAL">Geral</MenuItem>
                  <MenuItem value="URGENT">Urgente</MenuItem>
                  <MenuItem value="EVENT">Evento</MenuItem>
                  <MenuItem value="MAINTENANCE">Manutenção</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={6}>
                <Select fullWidth value={priority} onChange={e => setPriority(e.target.value)} size="small">
                  <MenuItem value="NORMAL">Normal</MenuItem>
                  <MenuItem value="HIGH">Alta</MenuItem>
                </Select>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowForm(false)} size="small">Cancelar</Button>
            <Button type="submit" variant="contained" size="small">Publicar</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
