import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Typography, Card, CardContent, Grid, TextField, Button, Select, MenuItem,
  Box, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert, Switch, FormControlLabel, Divider
} from '@mui/material';
import {
  Add, Delete, Campaign, Event, Build, Info, Visibility,
  PushPin, Edit
} from '@mui/icons-material';

const CATEGORIES = [
  { value: 'GENERAL', label: '📢 Geral', color: '#636e72', icon: <Info /> },
  { value: 'URGENT', label: '🚨 Urgente', color: '#e74c3c', icon: <Campaign /> },
  { value: 'MAINTENANCE', label: '🔧 Manutenção', color: '#F0A500', icon: <Build /> },
  { value: 'EVENT', label: '🎉 Evento', color: '#6c5ce7', icon: <Event /> },
];

export default function Notices() {
  const [notices, setNotices] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [priority, setPriority] = useState('NORMAL');
  const [pinned, setPinned] = useState(false);
  const [pinnedUntil, setPinnedUntil] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  useEffect(() => { loadNotices(); }, [filterCategory]);

  async function loadNotices() {
    const { data } = await api.get('/notices', {
      params: { category: filterCategory, activeOnly: 'true' },
    });
    setNotices(data);
  }

  function openCreate() {
    setEditingId(null);
    setTitle(''); setContent(''); setCategory('GENERAL');
    setPriority('NORMAL'); setPinned(false); setPinnedUntil(''); setExpiresAt('');
    setShowForm(true);
  }

  function openEdit(notice: any) {
    setEditingId(notice.id);
    setTitle(notice.title);
    setContent(notice.content);
    setCategory(notice.category);
    setPriority(notice.priority);
    setPinned(!!notice.pinnedUntil);
    setPinnedUntil(notice.pinnedUntil?.split('T')[0] || '');
    setExpiresAt(notice.expiresAt?.split('T')[0] || '');
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title, content, category, priority,
      pinnedUntil: pinned && pinnedUntil ? pinnedUntil : undefined,
      expiresAt: expiresAt || undefined,
    };

    try {
      if (editingId) {
        await api.put(`/notices/${editingId}`, payload);
        setSnackbar({ open: true, message: '✅ Aviso atualizado!', severity: 'success' });
      } else {
        await api.post('/notices', payload);
        setSnackbar({ open: true, message: '✅ Aviso publicado!', severity: 'success' });
      }
      setShowForm(false);
      loadNotices();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao salvar', severity: 'error' });
    }
  }

  async function deleteNotice(id: string) {
    if (!confirm('Excluir este aviso?')) return;
    await api.delete(`/notices/${id}`);
    loadNotices();
  }

  function getCategoryInfo(value: string) {
    return CATEGORIES.find(c => c.value === value) || CATEGORIES[0];
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>📢 Mural de Avisos</Typography>
          <Typography variant="caption" color="textSecondary">
            {notices.length} aviso(s) ativo(s)
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate} sx={{ bgcolor: '#00A896' }}>
          Novo Aviso
        </Button>
      </Box>

      {/* Filtros por categoria */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label="Todos"
              onClick={() => setFilterCategory('')}
              color={filterCategory === '' ? 'primary' : 'default'}
              variant={filterCategory === '' ? 'filled' : 'outlined'}
            />
            {CATEGORIES.map(c => (
              <Chip
                key={c.value}
                label={c.label}
                onClick={() => setFilterCategory(c.value)}
                color={filterCategory === c.value ? 'primary' : 'default'}
                variant={filterCategory === c.value ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Lista */}
      <Grid container spacing={2}>
        {notices.map(notice => {
          const catInfo = getCategoryInfo(notice.category);
          const isPinned = notice.pinnedUntil && new Date(notice.pinnedUntil) > new Date();
          const isUrgent = notice.category === 'URGENT' || notice.priority === 'HIGH';

          return (
            <Grid item xs={12} key={notice.id}>
              <Card sx={{
                borderRadius: 2,
                borderLeft: `4px solid ${isUrgent ? '#e74c3c' : catInfo.color}`,
                bgcolor: isUrgent ? '#FFF5F5' : 'white',
                position: 'relative',
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {isPinned && <Chip icon={<PushPin />} label="Fixado" size="small" color="warning" />}
                      <Chip label={catInfo.label} size="small" sx={{ bgcolor: catInfo.color, color: 'white' }} />
                      {isUrgent && <Chip label="Prioridade Alta" size="small" color="error" />}
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => openEdit(notice)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => deleteNotice(notice.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="h6" fontWeight={600} fontSize={16} mb={1}>
                    {notice.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: 'pre-wrap' }}>
                    {notice.content}
                  </Typography>

                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="caption" color="textSecondary">
                      📅 {new Date(notice.createdAt).toLocaleString('pt-BR')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Typography variant="caption" color="textSecondary">
                        <Visibility sx={{ fontSize: 12, verticalAlign: 'middle' }} /> {notice.views || 0}
                      </Typography>
                      {notice.expiresAt && (
                        <Typography variant="caption" color="textSecondary">
                          ⏰ Expira em {new Date(notice.expiresAt).toLocaleDateString('pt-BR')}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
        {notices.length === 0 && (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Campaign sx={{ fontSize: 60, color: '#E0E0E0', mb: 2 }} />
                <Typography color="textSecondary">Nenhum aviso publicado</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Modal */}
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? '✏️ Editar Aviso' : '📢 Novo Aviso'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Título" size="small" value={title} onChange={e => setTitle(e.target.value)} required />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Conteúdo" size="small" value={content} onChange={e => setContent(e.target.value)} required multiline rows={4} />
              </Grid>
              <Grid item xs={6}>
                <Select fullWidth size="small" value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
                </Select>
              </Grid>
              <Grid item xs={6}>
                <Select fullWidth size="small" value={priority} onChange={e => setPriority(e.target.value)}>
                  <MenuItem value="NORMAL">🟢 Normal</MenuItem>
                  <MenuItem value="HIGH">🔴 Alta Prioridade</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch checked={pinned} onChange={e => setPinned(e.target.checked)} />}
                  label="📌 Fixar no topo"
                />
              </Grid>
              {pinned && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth size="small" type="date"
                    label="Fixado até"
                    value={pinnedUntil}
                    onChange={e => setPinnedUntil(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth size="small" type="date"
                  label="Expira em (opcional)"
                  value={expiresAt}
                  onChange={e => setExpiresAt(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#00A896' }}>
              {editingId ? 'Atualizar' : 'Publicar'}
            </Button>
          </DialogActions>
        </form>
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
