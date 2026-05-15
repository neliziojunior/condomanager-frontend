import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Typography, Card, CardContent, Grid, TextField, Button, Select, MenuItem,
  Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar
} from '@mui/material';
import { Add, PersonAdd, PersonRemove, Pets, DirectionsCar, Delete } from '@mui/icons-material';

export default function Units() {
  const [units, setUnits] = useState<any[]>([]);
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [showResidentForm, setShowResidentForm] = useState<any>(null);
  const [showPetForm, setShowPetForm] = useState<any>(null);
  const [showVehicleForm, setShowVehicleForm] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [number, setNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [type, setType] = useState('APARTMENT');
  const [area, setArea] = useState('');
  const [residentName, setResidentName] = useState('');
  const [residentEmail, setResidentEmail] = useState('');
  const [residentPhone, setResidentPhone] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('DOG');
  const [petBreed, setPetBreed] = useState('');
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');

  useEffect(() => { loadUnits(); }, []);

  async function loadUnits() {
    const { data } = await api.get('/units');
    for (const unit of data) {
      for (const resident of unit.residents || []) {
        try {
          const [petsRes, vehiclesRes] = await Promise.all([
            api.get(`/units/residents/${resident.id}/pets`),
            api.get(`/units/residents/${resident.id}/vehicles`)
          ]);
          resident.pets = petsRes.data;
          resident.vehicles = vehiclesRes.data;
        } catch (e) {
          resident.pets = [];
          resident.vehicles = [];
        }
      }
    }
    setUnits(data);
  }

  async function createUnit(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/units', { number, floor: Number(floor) || undefined, type, area: Number(area) || undefined });
    setSnackbar({ open: true, message: 'Unidade criada!', severity: 'success' });
    setShowUnitForm(false); setNumber(''); setFloor(''); setArea('');
    loadUnits();
  }

  async function addResident(e: React.FormEvent) {
    e.preventDefault();
    await api.post(`/units/${showResidentForm.id}/residents`, { name: residentName, email: residentEmail, phone: residentPhone, isOwner });
    setSnackbar({ open: true, message: 'Morador adicionado!', severity: 'success' });
    setShowResidentForm(null); setResidentName(''); setResidentEmail(''); setResidentPhone(''); setIsOwner(false);
    loadUnits();
  }

  async function removeResident(unitId: string, personId: string) {
    if (!confirm('Remover este morador?')) return;
    await api.delete(`/units/${unitId}/residents/${personId}`);
    loadUnits();
  }

  async function addPet(e: React.FormEvent) {
    e.preventDefault();
    await api.post(`/units/residents/${showPetForm.id}/pets`, { name: petName, type: petType, breed: petBreed });
    setSnackbar({ open: true, message: 'Pet adicionado!', severity: 'success' });
    setShowPetForm(null); setPetName(''); setPetBreed('');
    loadUnits();
  }

  async function deletePet(id: string) {
    await api.delete(`/units/pets/${id}`);
    loadUnits();
  }

  async function addVehicle(e: React.FormEvent) {
    e.preventDefault();
    await api.post(`/units/residents/${showVehicleForm.id}/vehicles`, { brand: vehicleBrand, model: vehicleModel, plate: vehiclePlate, color: vehicleColor });
    setSnackbar({ open: true, message: 'Veículo adicionado!', severity: 'success' });
    setShowVehicleForm(null); setVehicleBrand(''); setVehicleModel(''); setVehiclePlate(''); setVehicleColor('');
    loadUnits();
  }

  async function deleteVehicle(id: string) {
    await api.delete(`/units/vehicles/${id}`);
    loadUnits();
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>🏠 Unidades e Moradores</Typography>
        <Button variant="contained" size="small" startIcon={<Add />} onClick={() => setShowUnitForm(true)}>Nova Unidade</Button>
      </Box>

      <Grid container spacing={2}>
        {units.map(unit => (
          <Grid item xs={12} md={6} key={unit.id}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography fontWeight={600}>Unidade {unit.number}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {unit.type === 'APARTMENT' ? 'Apartamento' : unit.type} {unit.floor && `• ${unit.floor}º andar`}
                    </Typography>
                  </Box>
                  <Button size="small" variant="outlined" startIcon={<PersonAdd />} onClick={() => { console.log('Abrir modal morador para unidade:', unit.id); setShowResidentForm(unit); }}>
                    Morador
                  </Button>
                </Box>

                {unit.residents?.map((resident: any) => (
                  <Box key={resident.id} sx={{ mb: 1.5, p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1.5 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{resident.name} {resident.role === 'OWNER' && '👑'}</Typography>
                        <Typography variant="caption" display="block">{resident.email}</Typography>
                      </Box>
                      <IconButton size="small" onClick={() => removeResident(unit.id, resident.id)}>
                        <PersonRemove fontSize="small" color="error" />
                      </IconButton>
                    </Box>

                    <Box mt={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Pets fontSize="small" color="primary" />
                        <Typography variant="caption" fontWeight={600}>Pets:</Typography>
                        <Button size="small" sx={{ fontSize: 10, minWidth: 'auto', p: 0.5 }} onClick={() => setShowPetForm(resident)}>+</Button>
                      </Box>
                      {resident.pets?.map((pet: any) => (
                        <Box key={pet.id} display="flex" alignItems="center" gap={0.5} ml={2}>
                          <Typography variant="caption">{pet.name} ({pet.type === 'DOG' ? '🐕' : pet.type === 'CAT' ? '🐈' : '🐾'})</Typography>
                          <IconButton size="small" onClick={() => deletePet(pet.id)}><Delete sx={{ fontSize: 14 }} /></IconButton>
                        </Box>
                      ))}
                    </Box>

                    <Box mt={0.5}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <DirectionsCar fontSize="small" color="primary" />
                        <Typography variant="caption" fontWeight={600}>Veículos:</Typography>
                        <Button size="small" sx={{ fontSize: 10, minWidth: 'auto', p: 0.5 }} onClick={() => setShowVehicleForm(resident)}>+</Button>
                      </Box>
                      {resident.vehicles?.map((v: any) => (
                        <Box key={v.id} display="flex" alignItems="center" gap={0.5} ml={2}>
                          <Typography variant="caption">🚗 {v.brand} {v.model} ({v.plate})</Typography>
                          <IconButton size="small" onClick={() => deleteVehicle(v.id)}><Delete sx={{ fontSize: 14 }} /></IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Modal Nova Unidade */}
      <Dialog open={showUnitForm} onClose={() => setShowUnitForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nova Unidade</DialogTitle>
        <form onSubmit={createUnit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={8}><TextField fullWidth label="Número" size="small" value={number} onChange={e => setNumber(e.target.value)} required /></Grid>
              <Grid item xs={4}><TextField fullWidth label="Andar" size="small" type="number" value={floor} onChange={e => setFloor(e.target.value)} /></Grid>
              <Grid item xs={6}>
                <Select fullWidth size="small" value={type} onChange={e => setType(e.target.value)}>
                  <MenuItem value="APARTMENT">Apartamento</MenuItem><MenuItem value="COMMERCIAL">Comercial</MenuItem><MenuItem value="STUDIO">Studio</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={6}><TextField fullWidth label="Área (m²)" size="small" type="number" value={area} onChange={e => setArea(e.target.value)} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions><Button onClick={() => setShowUnitForm(false)}>Cancelar</Button><Button type="submit" variant="contained">Salvar</Button></DialogActions>
        </form>
      </Dialog>

      {/* Modal Adicionar Morador */}
      <Dialog open={!!showResidentForm} onClose={() => setShowResidentForm(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Adicionar Morador - Unidade {showResidentForm?.number}</DialogTitle>
        <form onSubmit={addResident}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}><TextField fullWidth label="Nome completo" size="small" value={residentName} onChange={e => setResidentName(e.target.value)} required /></Grid>
              <Grid item xs={8}><TextField fullWidth label="Email" size="small" type="email" value={residentEmail} onChange={e => setResidentEmail(e.target.value)} required /></Grid>
              <Grid item xs={4}><TextField fullWidth label="Telefone" size="small" value={residentPhone} onChange={e => setResidentPhone(e.target.value)} /></Grid>
              <Grid item xs={12}>
                <Button variant={isOwner ? 'contained' : 'outlined'} fullWidth onClick={() => setIsOwner(!isOwner)} color={isOwner ? 'primary' : 'inherit'}>
                  {isOwner ? '👑 Proprietário' : '👤 Morador'}
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions><Button onClick={() => setShowResidentForm(null)}>Cancelar</Button><Button type="submit" variant="contained">Adicionar</Button></DialogActions>
        </form>
      </Dialog>

      {/* Modal Pet */}
      <Dialog open={!!showPetForm} onClose={() => setShowPetForm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>🐾 Adicionar Pet</DialogTitle>
        <form onSubmit={addPet}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={6}><TextField fullWidth label="Nome" size="small" value={petName} onChange={e => setPetName(e.target.value)} required /></Grid>
              <Grid item xs={6}>
                <Select fullWidth size="small" value={petType} onChange={e => setPetType(e.target.value)}>
                  <MenuItem value="DOG">🐕 Cachorro</MenuItem><MenuItem value="CAT">🐈 Gato</MenuItem><MenuItem value="BIRD">🐦 Ave</MenuItem><MenuItem value="OTHER">Outro</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12}><TextField fullWidth label="Raça" size="small" value={petBreed} onChange={e => setPetBreed(e.target.value)} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions><Button onClick={() => setShowPetForm(null)}>Cancelar</Button><Button type="submit" variant="contained">Adicionar</Button></DialogActions>
        </form>
      </Dialog>

      {/* Modal Veículo */}
      <Dialog open={!!showVehicleForm} onClose={() => setShowVehicleForm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>🚗 Adicionar Veículo</DialogTitle>
        <form onSubmit={addVehicle}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={6}><TextField fullWidth label="Marca" size="small" value={vehicleBrand} onChange={e => setVehicleBrand(e.target.value)} required /></Grid>
              <Grid item xs={6}><TextField fullWidth label="Modelo" size="small" value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} required /></Grid>
              <Grid item xs={6}><TextField fullWidth label="Placa" size="small" value={vehiclePlate} onChange={e => setVehiclePlate(e.target.value)} required /></Grid>
              <Grid item xs={6}><TextField fullWidth label="Cor" size="small" value={vehicleColor} onChange={e => setVehicleColor(e.target.value)} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions><Button onClick={() => setShowVehicleForm(null)}>Cancelar</Button><Button type="submit" variant="contained">Adicionar</Button></DialogActions>
        </form>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} />
    </Box>
  );
}
