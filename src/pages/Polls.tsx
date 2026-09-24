import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Typography, Card, CardContent, Grid, TextField, Button, Box, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert,
  LinearProgress, IconButton, Switch, FormControlLabel, Divider
} from '@mui/material';
import { Add, HowToVote, Delete, Lock, BarChart, CheckCircle } from '@mui/icons-material';

export default function Polls() {
  const [polls, setPolls] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentUserId, setCurrentUserId] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');

  useEffect(() => {
    loadPolls();
    const token = localStorage.getItem('@condomanager:token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.sub);
      } catch (e) {}
    }
  }, []);

  async function loadPolls() {
    const { data } = await api.get('/polls');
    setPolls(data);
  }

  async function createPoll(e: React.FormEvent) {
    e.preventDefault();
    const validOptions = options.filter(o => o.trim());
    if (validOptions.length < 2) {
      setSnackbar({ open: true, message: 'Mínimo 2 opções', severity: 'warning' });
      return;
    }

    await api.post('/polls', {
      title,
      description,
      options: validOptions,
      allowMultiple,
      isAnonymous,
      expiresAt: expiresAt || undefined,
    });

    setSnackbar({ open: true, message: '✅ Enquete criada!', severity: 'success' });
    setShowForm(false);
    setTitle(''); setDescription(''); setOptions(['', '']);
    setAllowMultiple(false); setIsAnonymous(false); setExpiresAt('');
    loadPolls();
  }

  async function vote(poll: any, optionIndex: number) {
    const currentVote = poll.votes?.find((v: any) => v.personId === currentUserId);
    let newOptions: number[];

    if (poll.allowMultiple) {
      const current = currentVote?.options || [];
      newOptions = current.includes(optionIndex)
        ? current.filter((i: number) => i !== optionIndex)
        : [...current, optionIndex];
    } else {
      newOptions = [optionIndex];
    }

    await api.post(`/polls/${poll.id}/vote`, { options: newOptions });
    setSnackbar({ open: true, message: '✅ Voto registrado!', severity: 'success' });
    loadPolls();
  }

  async function closePoll(id: string) {
    if (!confirm('Encerrar esta enquete?')) return;
    await api.put(`/polls/${id}/close`);
    loadPolls();
  }

  async function deletePoll(id: string) {
    if (!confirm('Excluir esta enquete?')) return;
    await api.delete(`/polls/${id}`);
    loadPolls();
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>🗳️ Enquetes</Typography>
          <Typography variant="caption" color="textSecondary">
            {polls.filter(p => p.isActive).length} enquete(s) ativa(s)
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setShowForm(true)} sx={{ bgcolor: '#00A896' }}>
          Nova Enquete
        </Button>
      </Box>

      <Grid container spacing={2}>
        {polls.map(poll => {
          const myVote = poll.votes?.find((v: any) => v.personId === currentUserId);
          const hasVoted = !!myVote;
          const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();

          return (
            <Grid item xs={12} md={6} key={poll.id}>
              <Card sx={{
                borderRadius: 2,
                borderLeft: poll.isActive && !isExpired ? '4px solid #00A896' : '4px solid #E0E0E0',
                opacity: poll.isActive && !isExpired ? 1 : 0.7,
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {poll.isActive && !isExpired ? (
                        <Chip label="🟢 Ativa" size="small" color="success" />
                      ) : (
                        <Chip label="🔒 Encerrada" size="small" color="default" />
                      )}
                      {poll.allowMultiple && <Chip label="Múltipla escolha" size="small" variant="outlined" />}
                      {poll.isAnonymous && <Chip label="Anônima" size="small" variant="outlined" />}
                    </Box>
                    <Box>
                      {poll.isActive && !isExpired && (
                        <IconButton size="small" onClick={() => closePoll(poll.id)} title="Encerrar">
                          <Lock fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton size="small" color="error" onClick={() => deletePoll(poll.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography fontWeight={600} mb={0.5}>{poll.title}</Typography>
                  {poll.description && (
                    <Typography variant="body2" color="textSecondary" mb={2}>{poll.description}</Typography>
                  )}

                  <Divider sx={{ my: 1.5 }} />

                  {/* Resultados */}
                  <Box>
                    {poll.results?.map((r: any, i: number) => {
                      const isMyChoice = myVote?.options?.includes(i);
                      const isDisabled = !poll.isActive || isExpired;

                      return (
                        <Box key={i} sx={{ mb: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {isMyChoice && <CheckCircle sx={{ fontSize: 14, color: '#00A896' }} />}
                              <Typography variant="body2" fontWeight={isMyChoice ? 600 : 400} fontSize={13}>
                                {r.option}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="textSecondary">
                              {r.votes} ({r.percentage.toFixed(0)}%)
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={r.percentage}
                            sx={{ height: 8, borderRadius: 4, bgcolor: '#F0F0F0' }}
                          />
                          {!isDisabled && (
                            <Button
                              size="small"
                              startIcon={<HowToVote />}
                              onClick={() => vote(poll, i)}
                              sx={{ fontSize: 11, mt: 0.5, textTransform: 'none' }}
                              color={isMyChoice ? 'error' : 'primary'}
                            >
                              {isMyChoice ? 'Remover voto' : 'Votar'}
                            </Button>
                          )}
                        </Box>
                      );
                    })}
                  </Box>

                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    📊 Total: {poll.totalVotes} voto(s)
                    {poll.expiresAt && ` • Encerra em ${new Date(poll.expiresAt).toLocaleDateString('pt-BR')}`}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
        {polls.length === 0 && (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <BarChart sx={{ fontSize: 60, color: '#E0E0E0', mb: 2 }} />
                <Typography color="textSecondary">Nenhuma enquete criada</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Modal Nova Enquete */}
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>🗳️ Nova Enquete</DialogTitle>
        <form onSubmit={createPoll}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Título" size="small" value={title} onChange={e => setTitle(e.target.value)} required />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Descrição (opcional)" size="small" value={description} onChange={e => setDescription(e.target.value)} multiline rows={2} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary" mb={1} display="block">
                  Opções (mínimo 2):
                </Typography>
                {options.map((opt, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      fullWidth size="small"
                      label={`Opção ${i + 1}`}
                      value={opt}
                      onChange={e => {
                        const newOpts = [...options];
                        newOpts[i] = e.target.value;
                        setOptions(newOpts);
                      }}
                      required
                    />
                    {options.length > 2 && (
                      <IconButton size="small" onClick={() => setOptions(options.filter((_, idx) => idx !== i))}>
                        <Delete />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button size="small" onClick={() => setOptions([...options, ''])}>
                  + Adicionar opção
                </Button>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth size="small" type="datetime-local"
                  label="Encerra em (opcional)"
                  value={expiresAt}
                  onChange={e => setExpiresAt(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch checked={allowMultiple} onChange={e => setAllowMultiple(e.target.checked)} />}
                  label="Permitir múltipla escolha"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />}
                  label="Voto anônimo (não mostra quem votou)"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#00A896' }}>Criar Enquete</Button>
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
