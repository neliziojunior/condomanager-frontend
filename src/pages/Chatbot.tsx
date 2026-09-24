import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import {
  Typography, Card, CardContent, TextField, Button, Box, Avatar, Paper,
  Chip, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, Grid
} from '@mui/material';
import {
  Send, SmartToy, Person, Add, Edit, Delete, HelpOutline
} from '@mui/icons-material';

export default function Chatbot() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [showFaqManager, setShowFaqManager] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const chatRef = useRef<HTMLDivElement>(null);

  // FAQ Form
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqKeywords, setFaqKeywords] = useState('');

  useEffect(() => {
    loadFaqs();
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  async function loadFaqs() {
    try {
      const { data } = await api.get('/faq');
      setFaqs(data);
    } catch (error) {}
  }

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/faq/ask', { question: input });
      
      let botResponse = data.answer;
      
      // Se não encontrou, mostrar sugestões
      if (!data.found && data.suggestions?.length > 0) {
        botResponse += '\n\n' + data.suggestions.map((s: string) => `• ${s}`).join('\n');
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: botResponse,
        found: data.found,
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Tente novamente.',
      }]);
    } finally {
      setLoading(false);
    }
  }

  function openFaqForm(faq?: any) {
    if (faq) {
      setEditingFaq(faq);
      setFaqQuestion(faq.question);
      setFaqAnswer(faq.answer);
      setFaqKeywords(faq.keywords.join(', '));
    } else {
      setEditingFaq(null);
      setFaqQuestion('');
      setFaqAnswer('');
      setFaqKeywords('');
    }
  }

  async function saveFaq() {
    if (!faqQuestion || !faqAnswer) {
      setSnackbar({ open: true, message: 'Pergunta e resposta são obrigatórias', severity: 'warning' });
      return;
    }

    const keywords = faqKeywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    try {
      if (editingFaq) {
        await api.put(`/faq/${editingFaq.id}`, {
          question: faqQuestion,
          answer: faqAnswer,
          keywords,
        });
        setSnackbar({ open: true, message: 'FAQ atualizada!', severity: 'success' });
      } else {
        await api.post('/faq', {
          question: faqQuestion,
          answer: faqAnswer,
          keywords,
        });
        setSnackbar({ open: true, message: 'FAQ criada!', severity: 'success' });
      }
      setEditingFaq(null);
      setFaqQuestion('');
      setFaqAnswer('');
      setFaqKeywords('');
      loadFaqs();
    } catch (error: any) {
      setSnackbar({ open: true, message: 'Erro ao salvar', severity: 'error' });
    }
  }

  async function deleteFaq(id: string) {
    if (!confirm('Excluir esta pergunta frequente?')) return;
    await api.delete(`/faq/${id}`);
    setSnackbar({ open: true, message: 'Excluída!', severity: 'success' });
    loadFaqs();
  }

  // ✅ Perguntas rápidas
  const quickQuestions = faqs.slice(0, 4).map(f => f.question);

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>🤖 Concierge Virtual</Typography>
          <Typography variant="caption" color="textSecondary">
            Assistente automático do condomínio
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<HelpOutline />}
          onClick={() => setShowFaqManager(true)}
        >
          Gerenciar FAQs ({faqs.length})
        </Button>
      </Box>

      {/* Chat */}
      <Card sx={{ flex: 1, mb: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
        <Box ref={chatRef} sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: '#F8F9FA' }}>
          {messages.length === 0 && (
            <Box textAlign="center" mt={5}>
              <SmartToy sx={{ fontSize: 60, color: '#00A896', mb: 2 }} />
              <Typography variant="h6" fontWeight={600} mb={1}>
                Olá! Como posso ajudar?
              </Typography>
              <Typography variant="body2" color="textSecondary" mb={3}>
                Faça uma pergunta sobre o condomínio ou clique em uma das sugestões abaixo:
              </Typography>

              {/* Perguntas rápidas */}
              {quickQuestions.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', maxWidth: 600, mx: 'auto' }}>
                  {quickQuestions.map((q, i) => (
                    <Chip
                      key={i}
                      label={q}
                      onClick={() => { setInput(q); }}
                      clickable
                      sx={{ bgcolor: 'white', border: '1px solid #E0E0E0' }}
                    />
                  ))}
                </Box>
              )}

              {faqs.length === 0 && (
                <Alert severity="info" sx={{ maxWidth: 500, mx: 'auto', textAlign: 'left' }}>
                  <strong>Nenhuma FAQ cadastrada ainda.</strong>
                  <br />
                  O síndico precisa cadastrar as perguntas frequentes clicando em <strong>"Gerenciar FAQs"</strong>.
                </Alert>
              )}
            </Box>
          )}

          {messages.map((msg, i) => (
            <Box key={i} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', mb: 1.5 }}>
              <Box sx={{ display: 'flex', gap: 1, maxWidth: '80%', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: msg.role === 'user' ? '#00A896' : '#6C5CE7' }}>
                  {msg.role === 'user' ? <Person sx={{ fontSize: 18 }} /> : <SmartToy sx={{ fontSize: 18 }} />}
                </Avatar>
                <Paper
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: msg.role === 'user' ? '#00A896' : 'white',
                    color: msg.role === 'user' ? 'white' : 'inherit',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  <Typography variant="body2">{msg.content}</Typography>
                </Paper>
              </Box>
            </Box>
          ))}

          {loading && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#6C5CE7' }}>
                <SmartToy sx={{ fontSize: 18 }} />
              </Avatar>
              <Paper sx={{ p: 1.5, borderRadius: 2 }}>
                <Typography variant="body2" color="textSecondary">Procurando resposta...</Typography>
              </Paper>
            </Box>
          )}
        </Box>
      </Card>

      {/* Input */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth size="small" placeholder="Digite sua pergunta..."
          value={input} onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
        />
        <Button variant="contained" onClick={sendMessage} disabled={loading} sx={{ bgcolor: '#00A896' }}>
          <Send />
        </Button>
      </Box>

      {/* Modal Gerenciar FAQs */}
      <Dialog open={showFaqManager} onClose={() => setShowFaqManager(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          📋 Gerenciar Perguntas Frequentes
          <Typography variant="caption" display="block" color="textSecondary">
            Cadastre perguntas e respostas para o concierge responder automaticamente
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Formulário */}
            <Grid item xs={12}>
              <Card sx={{ bgcolor: '#F0FDF9', p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} mb={2}>
                  {editingFaq ? '✏️ Editar FAQ' : '➕ Nova FAQ'}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth size="small" label="Pergunta"
                      value={faqQuestion} onChange={e => setFaqQuestion(e.target.value)}
                      placeholder="Ex: Qual o horário da piscina?"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth size="small" label="Resposta" multiline rows={3}
                      value={faqAnswer} onChange={e => setFaqAnswer(e.target.value)}
                      placeholder="Ex: A piscina funciona de segunda a domingo das 8h às 22h."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth size="small" label="Palavras-chave (separadas por vírgula)"
                      value={faqKeywords} onChange={e => setFaqKeywords(e.target.value)}
                      placeholder="Ex: piscina, horário, funcionamento"
                      helperText="Ajuda o sistema a encontrar esta resposta quando o morador perguntar"
                    />
                  </Grid>
                  <Grid item xs={12} sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="contained" onClick={saveFaq} sx={{ bgcolor: '#00A896' }}>
                      {editingFaq ? 'Atualizar' : 'Adicionar'}
                    </Button>
                    {editingFaq && (
                      <Button variant="outlined" onClick={() => openFaqForm()}>
                        Cancelar Edição
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Lista */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} mb={2}>
                FAQs Cadastradas ({faqs.length})
              </Typography>
              {faqs.length === 0 && (
                <Typography color="textSecondary" textAlign="center" py={3}>
                  Nenhuma FAQ cadastrada. Comece adicionando uma acima.
                </Typography>
              )}
              {faqs.map(faq => (
                <Card key={faq.id} sx={{ mb: 1, borderRadius: 2, border: '1px solid #F0F0F0' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{faq.question}</Typography>
                      <Box>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => openFaqForm(faq)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton size="small" color="error" onClick={() => deleteFaq(faq.id)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: 13, mb: 1 }}>
                      {faq.answer}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {faq.keywords.map((k: string, i: number) => (
                        <Chip key={i} label={k} size="small" variant="outlined" sx={{ fontSize: 10 }} />
                      ))}
                      <Chip label={`${faq.timesUsed || 0} usos`} size="small" sx={{ fontSize: 10 }} />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFaqManager(false)}>Fechar</Button>
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
