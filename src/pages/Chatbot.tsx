import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { Typography, Card, TextField, Button, Box, Avatar, Paper } from '@mui/material';
import { Send, SmartToy, Person } from '@mui/icons-material';

export default function Chatbot() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatRef.current?.scrollTo(0, chatRef.current.scrollHeight); }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/chatbot', {
        message: input,
        history: messages.map(m => ({ role: m.role, content: m.content }))
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, ocorreu um erro.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" fontWeight={700} mb={2}>🤖 Concierge Virtual</Typography>
      
      <Card sx={{ flex: 1, mb: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
        <Box ref={chatRef} sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: '#f8f9fa' }}>
          {messages.length === 0 && (
            <Box textAlign="center" mt={10}>
              <SmartToy sx={{ fontSize: 60, color: '#6c5ce7', mb: 2 }} />
              <Typography color="textSecondary">Olá! Pergunte sobre regras, reservas, horários...</Typography>
            </Box>
          )}
          {messages.map((msg, i) => (
            <Box key={i} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', mb: 1.5 }}>
              <Box sx={{ display: 'flex', gap: 1, maxWidth: '80%', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: msg.role === 'user' ? '#6c5ce7' : '#00b894' }}>
                  {msg.role === 'user' ? <Person sx={{ fontSize: 16 }} /> : <SmartToy sx={{ fontSize: 16 }} />}
                </Avatar>
                <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: msg.role === 'user' ? '#6c5ce7' : 'white', color: msg.role === 'user' ? 'white' : 'inherit' }}>
                  <Typography variant="body2">{msg.content}</Typography>
                </Paper>
              </Box>
            </Box>
          ))}
          {loading && (
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: '#00b894' }}><SmartToy sx={{ fontSize: 16 }} /></Avatar>
              <Paper sx={{ p: 1.5, borderRadius: 2 }}><Typography variant="body2" color="textSecondary">Digitando...</Typography></Paper>
            </Box>
          )}
        </Box>
      </Card>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField fullWidth size="small" placeholder="Digite sua mensagem..." value={input}
          onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()} />
        <Button variant="contained" onClick={sendMessage} disabled={loading}><Send /></Button>
      </Box>
    </Box>
  );
}
