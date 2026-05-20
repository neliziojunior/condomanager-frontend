import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Typography, Card, CardContent, TextField, Button, Box, Avatar, Paper, Chip } from '@mui/material';
import { Send } from '@mui/icons-material';

export default function Chat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
    const token = localStorage.getItem('@condomanager:token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.sub);
      } catch (e) {}
    }
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const [msgRes, pollRes] = await Promise.all([
        api.get('/chat'),
        api.get('/polls')
      ]);
      setMessages(msgRes.data.reverse());
      setPolls(pollRes.data.filter((p: any) => p.isActive));
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
      await loadData();
    } catch (error) {}
    setLoading(false);
  }

  async function voteViaChat(pollId: string, optionIndex: number) {
    try {
      await api.post(`/polls/${pollId}/vote`, { option: optionIndex });
      loadData();
    } catch (error) {}
  }

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" fontWeight={700} mb={2}>💬 Chat do Condomínio</Typography>

      {polls.length > 0 && (
        <Card sx={{ mb: 2, borderRadius: 2, bgcolor: '#F0FDF9' }}>
          <CardContent sx={{ p: 1.5 }}>
            <Typography variant="caption" fontWeight={600} color="#00A896">🗳️ ENQUETES ATIVAS</Typography>
            {polls.slice(0, 2).map((poll: any) => (
              <Box key={poll.id} sx={{ mt: 1, p: 1, bgcolor: 'white', borderRadius: 1 }}>
                <Typography variant="body2" fontWeight={600}>{poll.title}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                  {poll.options?.map((opt: string, i: number) => (
                    <Chip key={i} label={`${i + 1}. ${opt}`} size="small" onClick={() => voteViaChat(poll.id, i)} clickable color="primary" variant="outlined" />
                  ))}
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      <Card sx={{ flex: 1, mb: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
        <Box ref={chatRef} sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: '#f8f9fa' }}>
          {messages.length === 0 && (
            <Box textAlign="center" mt={10}><Typography color="textSecondary">Nenhuma mensagem ainda</Typography></Box>
          )}
          {messages.map((msg) => {
            const isMine = msg.sender?.id === currentUserId;
            return (
              <Box key={msg.id} sx={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', mb: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 1, maxWidth: '80%', flexDirection: isMine ? 'row-reverse' : 'row' }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: isMine ? '#00A896' : '#6C5CE7', fontSize: 12 }}>{msg.sender?.name?.[0] || '?'}</Avatar>
                  <Box>
                    {!isMine && <Typography variant="caption" color="textSecondary">{msg.sender?.name}</Typography>}
                    <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: isMine ? '#00A896' : 'white', color: isMine ? 'white' : 'inherit' }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Typography>
                    </Paper>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: isMine ? 'right' : 'left' }}>
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
        <TextField fullWidth size="small" placeholder="Digite sua mensagem..." value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()} />
        <Button variant="contained" onClick={sendMessage} disabled={loading}><Send /></Button>
      </Box>
    </Box>
  );
}
