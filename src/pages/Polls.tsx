import { useState, useEffect } from 'react';
import api from '../services/api';
import { Typography, Card, CardContent, Grid, TextField, Button, Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, LinearProgress, IconButton } from '@mui/material';
import { Add, HowToVote } from '@mui/icons-material';

export default function Polls() {
  const [polls, setPolls] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);

  useEffect(() => { loadPolls(); }, []);

  async function loadPolls() {
    const { data } = await api.get('/polls');
    // Carregar resultados de cada enquete
    for (const poll of data) {
      const { data: results } = await api.get(`/polls/${poll.id}/results`);
      poll.results = results;
    }
    setPolls(data);
  }

  async function createPoll(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/polls', { title, description, options: options.filter(o => o.trim()) });
    setSnackbar({ open: true, message: 'Enquete criada!', severity: 'success' });
    setShowForm(false); setTitle(''); setDescription(''); setOptions(['', '']);
    loadPolls();
  }

  async function vote(pollId: string, optionIndex: number) {
    await api.post(`/polls/${pollId}/vote`, { option: optionIndex });
    loadPolls();
  }

  function addOption() { setOptions([...options, '']); }
  function updateOption(index: number, value: string) {
    const newOpts = [...options]; newOpts[index] = value; setOptions(newOpts);
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h6" fontWeight={700}>🗳️ Enquetes</Typography>
        <Button variant="contained" size="small" startIcon={<Add />} onClick={() => setShowForm(true)}>Nova Enquete</Button>
      </Box>
      <Grid container spacing={2}>
        {polls.map(poll => (
          <Grid item xs={12} md={6} key={poll.id}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography fontWeight={600}>{poll.title}</Typography>
                {poll.description && <Typography variant="body2" color="textSecondary">{poll.description}</Typography>}
                <Box mt={2}>
                  {poll.results?.results?.map((r: any, i: number) => (
                    <Box key={i} sx={{ mb: 1.5 }}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2">{r.option}</Typography>
                        <Typography variant="caption">{r.votes} voto(s) ({r.percentage.toFixed(0)}%)</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={r.percentage} sx={{ height: 8, borderRadius: 4 }} />
                      <Button size="small" onClick={() => vote(poll.id, i)} startIcon={<HowToVote />} sx={{ mt: 0.5, fontSize: 10 }}>
                        Votar
                      </Button>
                    </Box>
                  ))}
                </Box>
                <Typography variant="caption" color="textSecondary">Total: {poll.results?.total} voto(s)</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>🗳️ Nova Enquete</DialogTitle>
        <form onSubmit={createPoll}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}><TextField fullWidth label="Título" size="small" value={title} onChange={e => setTitle(e.target.value)} required /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Descrição" size="small" value={description} onChange={e => setDescription(e.target.value)} multiline rows={2} /></Grid>
              {options.map((opt, i) => (
                <Grid item xs={12} key={i}>
                  <TextField fullWidth label={`Opção ${i + 1}`} size="small" value={opt} onChange={e => updateOption(i, e.target.value)} required />
                </Grid>
              ))}
              <Grid item xs={12}><Button onClick={addOption} size="small">+ Adicionar opção</Button></Grid>
            </Grid>
          </DialogContent>
          <DialogActions><Button onClick={() => setShowForm(false)}>Cancelar</Button><Button type="submit" variant="contained">Criar</Button></DialogActions>
        </form>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
