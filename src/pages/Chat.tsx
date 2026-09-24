import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import {
  Typography, Card, TextField, Button, Box, Avatar, Paper, Chip,
  Grid, IconButton, InputAdornment, Menu, MenuItem, Snackbar, Alert,
  Badge, Divider, CircularProgress
} from '@mui/material';
import {
  Send, Search, AttachFile, MoreVert, Delete, Group, Person,
  ArrowBack, Check, DoneAll, Image as ImageIcon
} from '@mui/icons-material';

export default function Chat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null); // null = grupo
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [showContactList, setShowContactList] = useState(true);
  const chatRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3333'
    : 'https://condpro.onrender.com';

  useEffect(() => {
    const token = localStorage.getItem('@condomanager:token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.sub);
      } catch (e) {}
    }
    loadContacts();
    loadMessages();
    const interval = setInterval(() => {
      loadMessages();
      loadContacts();
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedContact, search]);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  async function loadMessages() {
    try {
      const { data } = await api.get('/chat', {
        params: {
          withPersonId: selectedContact?.id,
          search: search || undefined,
        },
      });
      setMessages(data);

      // Marcar como lidas se estiver em conversa privada
      if (selectedContact) {
        await api.post('/chat/mark-read', { senderId: selectedContact.id });
      }
    } catch (error) {}
  }

  async function loadContacts() {
    try {
      const { data } = await api.get('/chat/contacts');
      setContacts(data);
    } catch (error) {}
  }

  async function sendMessage() {
    if (!input.trim()) return;
    setLoading(true);
    try {
      await api.post('/chat', {
        content: input,
        receiverId: selectedContact?.id,
      });
      setInput('');
      await loadMessages();
    } catch (error) {}
    setLoading(false);
  }

  async function uploadFile(file: File) {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await api.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await api.post('/chat', {
        content: file.name,
        receiverId: selectedContact?.id,
        attachmentUrl: data.url,
        attachmentType: data.type,
      });

      await loadMessages();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao enviar arquivo', severity: 'error' });
    }
    setLoading(false);
  }

  async function deleteMessage(id: string) {
    try {
      await api.delete(`/chat/${id}`);
      setSnackbar({ open: true, message: 'Mensagem excluída', severity: 'success' });
      loadMessages();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao excluir', severity: 'error' });
    }
    setMenuAnchor(null);
  }

  function openMenu(event: React.MouseEvent<HTMLElement>, message: any) {
    setMenuAnchor(event.currentTarget);
    setSelectedMessage(message);
  }

  function selectContact(contact: any) {
    setSelectedContact(contact);
    setShowContactList(false);
  }

  function selectGroup() {
    setSelectedContact(null);
    setShowContactList(false);
  }

  function getUnreadBadge() {
    return contacts.reduce((sum, c) => sum + (c.unread || 0), 0);
  }

  return (
    <Box sx={{
      display: 'flex',
      height: 'calc(100vh - 120px)',
      bgcolor: '#F7F9FC',
      borderRadius: 2,
      overflow: 'hidden',
    }}>
      {/* ✅ Sidebar de Contatos */}
      <Box sx={{
        width: { xs: showContactList ? '100%' : 0, md: 320 },
        flexShrink: 0,
        bgcolor: 'white',
        borderRight: '1px solid #E0E0E0',
        display: { xs: showContactList ? 'flex' : 'none', md: 'flex' },
        flexDirection: 'column',
      }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #E0E0E0' }}>
          <Typography variant="h6" fontWeight={700} mb={1}>💬 Conversas</Typography>
          <TextField
            fullWidth size="small" placeholder="Buscar mensagens..."
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
          />
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {/* Chat de Grupo */}
          <Box
            onClick={selectGroup}
            sx={{
              p: 2, display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer',
              bgcolor: !selectedContact ? '#F0FDF9' : 'transparent',
              '&:hover': { bgcolor: '#F7F9FC' },
              borderBottom: '1px solid #F0F0F0',
            }}
          >
            <Avatar sx={{ bgcolor: '#00A896' }}>
              <Group />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600}>Grupo do Condomínio</Typography>
              <Typography variant="caption" color="textSecondary">Todos os moradores</Typography>
            </Box>
          </Box>

          {/* Contatos */}
          {contacts.map(contact => (
            <Box
              key={contact.id}
              onClick={() => selectContact(contact)}
              sx={{
                p: 2, display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer',
                bgcolor: selectedContact?.id === contact.id ? '#F0FDF9' : 'transparent',
                '&:hover': { bgcolor: '#F7F9FC' },
                borderBottom: '1px solid #F0F0F0',
              }}
            >
              <Badge badgeContent={contact.unread || 0} color="error">
                <Avatar sx={{ bgcolor: contact.role === 'SYNDIC' ? '#6c5ce7' : '#00A896' }}>
                  {contact.name?.[0]}
                </Avatar>
              </Badge>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {contact.name}
                </Typography>
                <Typography variant="caption" color="textSecondary" noWrap>
                  {contact.role === 'SYNDIC' ? '👔 Síndico' : `🏠 Unid. ${contact.unit?.number || '-'}`}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ✅ Área do Chat */}
      <Box sx={{
        flex: 1,
        display: { xs: showContactList ? 'none' : 'flex', md: 'flex' },
        flexDirection: 'column',
        bgcolor: '#F7F9FC',
      }}>
        {/* Header */}
        <Box sx={{
          p: 2, bgcolor: 'white', borderBottom: '1px solid #E0E0E0',
          display: 'flex', alignItems: 'center', gap: 1,
        }}>
          <IconButton
            sx={{ display: { xs: 'flex', md: 'none' } }}
            onClick={() => setShowContactList(true)}
          >
            <ArrowBack />
          </IconButton>
          <Avatar sx={{ bgcolor: selectedContact ? '#00A896' : '#00A896' }}>
            {selectedContact ? selectedContact.name?.[0] : <Group />}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {selectedContact ? selectedContact.name : 'Grupo do Condomínio'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {selectedContact
                ? (selectedContact.role === 'SYNDIC' ? '👔 Síndico' : `🏠 Unidade ${selectedContact.unit?.number || '-'}`)
                : `${contacts.length} participante(s)`
              }
            </Typography>
          </Box>
        </Box>

        {/* Mensagens */}
        <Box ref={chatRef} sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {messages.length === 0 && (
            <Box textAlign="center" mt={8}>
              <Typography color="textSecondary">Nenhuma mensagem ainda</Typography>
            </Box>
          )}

          {messages.map(msg => {
            const isMine = msg.sender?.id === currentUserId;
            const isRead = !!msg.readAt;

            return (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: isMine ? 'flex-end' : 'flex-start',
                  mb: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', gap: 1, maxWidth: '75%', flexDirection: isMine ? 'row-reverse' : 'row' }}>
                  {!isMine && (
                    <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: '#6c5ce7' }}>
                      {msg.sender?.name?.[0]}
                    </Avatar>
                  )}
                  <Box>
                    {!isMine && (
                      <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                        {msg.sender?.name}
                      </Typography>
                    )}
                    <Paper
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: msg.isDeleted ? '#E0E0E0' : (isMine ? '#00A896' : 'white'),
                        color: isMine && !msg.isDeleted ? 'white' : '#333',
                        opacity: msg.isDeleted ? 0.6 : 1,
                        fontStyle: msg.isDeleted ? 'italic' : 'normal',
                        position: 'relative',
                      }}
                    >
                      {/* Anexo */}
                      {msg.attachmentUrl && msg.attachmentType === 'IMAGE' && (
                        <Box sx={{ mb: 1 }}>
                          <img
                            src={`${API_URL}${msg.attachmentUrl}`}
                            alt="anexo"
                            style={{ maxWidth: 200, borderRadius: 8, cursor: 'pointer' }}
                            onClick={() => window.open(`${API_URL}${msg.attachmentUrl}`, '_blank')}
                          />
                        </Box>
                      )}

                      {msg.attachmentUrl && msg.attachmentType !== 'IMAGE' && (
                        <Button
                          size="small"
                          href={`${API_URL}${msg.attachmentUrl}`}
                          target="_blank"
                          startIcon={<AttachFile />}
                          sx={{ mb: 1, color: isMine ? 'white' : '#00A896' }}
                        >
                          {msg.content}
                        </Button>
                      )}

                      {/* Conteúdo */}
                      {(!msg.attachmentUrl || msg.attachmentType === 'IMAGE') && (
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {msg.content}
                        </Typography>
                      )}

                      {/* Info (hora + lido) */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, mt: 0.5 }}>
                        <Typography variant="caption" sx={{ fontSize: 10, opacity: 0.8 }}>
                          {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                        {isMine && !msg.isDeleted && (
                          isRead ? <DoneAll sx={{ fontSize: 14, opacity: 0.9 }} /> : <Check sx={{ fontSize: 14, opacity: 0.7 }} />
                        )}
                      </Box>
                    </Paper>

                    {/* Menu de opções (só para minhas mensagens) */}
                    {isMine && !msg.isDeleted && (
                      <IconButton
                        size="small"
                        onClick={(e) => openMenu(e, msg)}
                        sx={{ opacity: 0.5 }}
                      >
                        <MoreVert sx={{ fontSize: 14 }} />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </Box>

        {/* Input */}
        <Box sx={{
          p: 2, bgcolor: 'white', borderTop: '1px solid #E0E0E0',
          display: 'flex', gap: 1, alignItems: 'flex-end',
        }}>
          <IconButton onClick={() => fileRef.current?.click()} color="primary">
            <AttachFile />
          </IconButton>
          <input
            type="file"
            hidden
            ref={fileRef}
            accept="image/*,.pdf,.doc,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file);
              e.target.value = '';
            }}
          />
          <TextField
            fullWidth size="small" multiline maxRows={4}
            placeholder="Digite uma mensagem..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            sx={{ bgcolor: '#00A896', minWidth: 'auto', px: 2 }}
          >
            <Send />
          </Button>
        </Box>
      </Box>

      {/* Menu de contexto da mensagem */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => deleteMessage(selectedMessage?.id)}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Excluir mensagem
        </MenuItem>
      </Menu>

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
