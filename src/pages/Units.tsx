import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Typography, Card, CardContent, Grid, TextField, Button, Select, MenuItem,
  Table, TableBody, TableCell, TableHead, TableRow, Box, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, List, ListItem, ListItemText
} from '@mui/material';
import { Add, PersonAdd, PersonRemove, Apartment } from '@mui/icons-material';

export default function Units() {
  const [units, setUnits] = useState<any[]>([]);
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [showResidentForm, setShowResidentForm] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form unidade
  const [number, setNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [type, setType] = useState('APARTMENT');
  const [area, setArea] = useState('');

  // Form morador
  const [residentName, setResidentName] = useState('');
  const [residentEmail, setResidentEmail] = useState('');
  const [residentPhone, setResidentPhone] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => { loadUnits(); }, []);

  async function loadUnits() {
    const { data } = await api.get('/units');
    setUnits(data);
  }

  async function createUnit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/units', { number, floor: Number(floor), type, area: Number(area) });
      setSnackbar({ open: true, message: 'Unidade criada com sucesso!', severity: 'success' });
      setShowUnitForm(false);
      setNumber(''); setFloor(''); setArea('');
      loadUnits();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao criar unidade', severity: 'error' });
    }
  }

  async function addResident(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post(`/units/${showResidentForm.id}/residents`, {
        name: residentName, email: residentEmail, phone: residentPhone, isOwner
      });
      setSnackbar({ open: true, message: 'Morador adicionado!', severity: 'success' });
      setShowResidentForm(null);
      setResidentName(''); setResidentEmail(''); setResidentPhone(''); setIsOwner(false);
      loadUnits();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao adicionar morador', severity: 'error' });
    }
  }

  async function removeResident(unitId: string, personId: string) {
    if (!confirm('Remover este morador?')) return;
    try {
      await api.delete(`/units/${unitId}/residents/${personId}`);
      setSnackbar({ open: true, message: 'Morador removido', severity: 'success' });
      loadUnits();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao remover morador', severity: 'error' });
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">🏠 Unidades e Moradores</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setShowUnitForm(true)}>
          Nova Unidade
        </Button>
      </Box>

      {/* Lista de unidades */}
      <Grid container spacing={3}>
        {units.map(unit => (
          <Grid item xs={12} md={6} key={unit.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h6">
                      <Apartment sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Unidade {unit.number}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {unit.type === 'APARTMENT' ? 'Apartamento' : unit.type === 'COMMERCIAL' ? 'Comercial' : 'Studio'}
                      {unit.floor && ` • ${unit.floor}º andar`}
                      {unit.area && ` • ${unit.area}m²`}
                    </Typography>
                  </Box>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    startIcon={<PersonAdd />}
                    onClick={() => setShowResidentForm(unit)}
                  >
                    Morador
                  </Button>
                </Box>

                {/* Lista de moradores */}
                {unit.residents?.length > 0 ? (
                  <List dense>
                    {unit.residents.map((resident: any) => (
                      <ListItem key={resident.id} secondaryAction={
                        <IconButton edge="end" size="small" onClick={() => removeResident(unit.id, resident.id)}>
                          <PersonRemove color="error" />
                        </IconButton>
                      }>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {resident.name}
                              {resident.role === 'OWNER' && <Chip label="Proprietário" size="small" color="primary" />}
                            </Box>
                          }
                          secondary={`${resident.email}${resident.phone ? ` • ${resident.phone}` : ''}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>
                    Nenhum morador vinculado
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
        {units.length === 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="textSecondary">🏠 Nenhuma unidade cadastrada</Typography>
                <Button variant="contained" onClick={() => setShowUnitForm(true)} sx={{ mt: 2 }}>
                  Cadastrar Primeira Unidade
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Modal Nova Unidade */}
      <Dialog open={showUnitForm} onClose={() => setShowUnitForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nova Unidade</DialogTitle>
        <form onSubmit={createUnit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <TextField fullWidth label="Número/Identificação" value={number} onChange={e => setNumber(e.target.value)} required placeholder="101, BL-A-201" />
              </Grid>
              <Grid item xs={4}>
                <TextField fullWidth label="Andar" type="number" value={floor} onChange={e => setFloor(e.target.value)} />
              </Grid>
              <Grid item xs={6}>
                <Select fullWidth value={type} onChange={e => setType(e.target.value)}>
                  <MenuItem value="APARTMENT">Apartamento</MenuItem>
                  <MenuItem value="COMMERCIAL">Comercial</MenuItem>
                  <MenuItem value="STUDIO">Studio</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Área (m²)" type="number" value={area} onChange={e => setArea(e.target.value)} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowUnitForm(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">Salvar</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal Adicionar Morador */}
      <Dialog open={!!showResidentForm} onClose={() => setShowResidentForm(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Adicionar Morador - Unidade {showResidentForm?.number}</DialogTitle>
        <form onSubmit={addResident}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Nome completo" value={residentName} onChange={e => setResidentName(e.target.value)} required />
              </Grid>
              <Grid item xs={8}>
                <TextField fullWidth label="Email" type="email" value={residentEmail} onChange={e => setResidentEmail(e.target.value)} required />
              </Grid>
              <Grid item xs={4}>
                <TextField fullWidth label="Telefone" value={residentPhone} onChange={e => setResidentPhone(e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  variant={isOwner ? 'contained' : 'outlined'} 
                  onClick={() => setIsOwner(!isOwner)}
                  fullWidth
                  color={isOwner ? 'primary' : 'inherit'}
                >
                  {isOwner ? '👑 Proprietário' : '👤 Morador'}
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowResidentForm(null)}>Cancelar</Button>
            <Button type="submit" variant="contained">Adicionar</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
}
