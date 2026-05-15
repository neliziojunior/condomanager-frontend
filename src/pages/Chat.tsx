import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Typography, Card, TextField, Button, Box, Avatar, Paper, Chip } from '@mui/material';
import { Send, Person } from '@mui/icons-material';

export default function Chat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    const token = localStorage.getItem('@condomanager:token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(payload.sub);
    }
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadMessages() {
    try {
      const { data } = await api.get('/chat');
      setMessages(data.reverse());
    } catch (error) {}
  }

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;
    setLoading(true);
    try {
      await api.post('/chat', { content: input });
      setInput('');
      await loadMessages();
    } catch (error) {}
    setLoading(false);
  }

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" fontWeight={700} mb={2}>💬 Chat do Condomínio</Typography>

      <Card sx={{ flex: 1, mb: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
        <Box ref={chatRef} sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: '#f8f9fa' }}>
          {messages.length === 0 && (
            <Box textAlign="center" mt={10}>
              <Typography color="textSecondary">Nenhuma mensagem ainda</Typography>
            </Box>
          )}
          {messages.map((msg, i) => {
            const isMine = msg.sender?.id === currentUserId;
            return (
              <Box key={msg.id} sx={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', mb: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 1, maxWidth: '80%', flexDirection: isMine ? 'row-reverse' : 'row' }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: isMine ? '#6c5ce7' : '#00b894', fontSize: 12 }}>
                    {msg.sender?.name?.[0] || '?'}
                  </Avatar>
                  <Box>
                    {!isMine && (
                      <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                        {msg.sender?.name}
                      </Typography>
                    )}
                    <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: isMine ? '#6c5ce7' : 'white', color: isMine ? 'white' : 'inherit' }}>
                      <Typography variant="body2">{msg.content}</Typography>
                    </Paper>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.3, display: 'block', textAlign: isMine ? 'right' : 'left' }}>
                      {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
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
