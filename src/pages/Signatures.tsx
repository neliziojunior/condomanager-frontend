import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Typography, Card, CardContent, Grid, Button, Select, MenuItem, Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from '@mui/material';
import { Draw, CheckCircle, FileCopy } from '@mui/icons-material';

export default function Signatures() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState('');
  const [signatures, setSignatures] = useState<any[]>([]);
  const [alreadySigned, setAlreadySigned] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => { loadDocuments(); }, []);

  async function loadDocuments() {
    const { data } = await api.get('/documents');
    setDocuments(data);
  }

  async function loadSignatures(docId: string) {
    const { data } = await api.get(`/signatures/document/${docId}`);
    setSignatures(data);
    const { data: check } = await api.get(`/signatures/check/${docId}`);
    setAlreadySigned(check.signed);
  }

  // Iniciar desenho
  function startDrawing(e: React.MouseEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  }

  function draw(e: React.MouseEvent) {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = '#00A896';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function stopDrawing() {
    setIsDrawing(false);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  async function saveSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const signatureData = canvas.toDataURL();
    try {
      await api.post('/signatures', { documentId: selectedDoc, signatureData });
      setSnackbar({ open: true, message: 'Documento assinado com sucesso! ✍️', severity: 'success' });
      setShowCanvas(false);
      clearCanvas();
      loadSignatures(selectedDoc);
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao assinar', severity: 'error' });
    }
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={1}>✍️ Assinatura Digital</Typography>
      <Typography variant="caption" color="textSecondary" mb={3} display="block">
        Assine documentos com validade jurídica
      </Typography>

      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Select fullWidth size="small" value={selectedDoc} onChange={e => { setSelectedDoc(e.target.value); loadSignatures(e.target.value); }} displayEmpty>
                <MenuItem value="" disabled>Selecione um documento para assinar</MenuItem>
                {documents.map(doc => (
                  <MenuItem key={doc.id} value={doc.id}>
                    <FileCopy fontSize="small" sx={{ mr: 1 }} /> {doc.title}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button 
                variant="contained" 
                startIcon={<Draw />} 
                onClick={() => setShowCanvas(true)}
                disabled={!selectedDoc || alreadySigned}
                fullWidth
              >
                {alreadySigned ? '✅ Já Assinado' : 'Assinar Agora'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lista de assinaturas */}
      {signatures.length > 0 && (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              📋 {signatures.length} Assinatura(s)
            </Typography>
            {signatures.map(sig => (
              <Box key={sig.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1, borderBottom: '1px solid #F0F0F0' }}>
                <CheckCircle color="success" />
                <Box>
                  <Typography variant="body2" fontWeight={600}>{sig.person?.name}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {sig.person?.email} • {new Date(sig.signedAt).toLocaleString('pt-BR')}
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto' }}>
                  <img src={sig.signatureData} alt="Assinatura" style={{ height: 40, opacity: 0.8 }} />
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Canvas para desenhar assinatura */}
      <Dialog open={showCanvas} onClose={() => setShowCanvas(false)} maxWidth="sm" fullWidth>
        <DialogTitle>✍️ Desenhe sua assinatura</DialogTitle>
        <DialogContent>
          <Box sx={{ border: '2px dashed #00A896', borderRadius: 2, mt: 1 }}>
            <canvas 
              ref={canvasRef} 
              width={500} 
              height={200} 
              style={{ width: '100%', cursor: 'crosshair', background: '#F7F9FC' }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </Box>
          <Button size="small" onClick={clearCanvas} sx={{ mt: 1 }}>Limpar</Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCanvas(false)}>Cancelar</Button>
          <Button variant="contained" onClick={saveSignature} startIcon={<CheckCircle />}>
            Confirmar Assinatura
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity as any}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
