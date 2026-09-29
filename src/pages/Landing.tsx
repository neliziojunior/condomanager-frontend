import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Grid, Card, CardContent,
  AppBar, Toolbar, Stack, Chip, Divider, IconButton,
} from '@mui/material';
import {
  ArrowForward, CheckCircle, AttachMoney, Campaign, Visibility,
  SmartToy, Apartment, Badge as BadgeIcon, Person, Key,
  CloudUpload, AutoAwesome, TrendingUp,
} from '@mui/icons-material';

export default function Landing() {
  const navigate = useNavigate();
  const goToLogin = () => navigate('/login');

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box sx={{ bgcolor: '#FFFFFF', minHeight: '100vh' }}>
      {/* ═══════════ NAVBAR ═══════════ */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: 68, px: { xs: 0 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  bgcolor: '#2563EB', borderRadius: 2, width: 40, height: 40,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, color: 'white',
                }}
              >
                🏢
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 18, color: '#111827', lineHeight: 1.1 }}>
                  CondoPro
                </Typography>
                <Typography sx={{ fontSize: 9, color: '#2563EB', fontWeight: 600, letterSpacing: 1 }}>
                  GESTÃO PROFISSIONAL
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Button onClick={() => scrollTo('perfis')} sx={{ color: '#374151', textTransform: 'none', fontWeight: 500 }}>
                Perfis
              </Button>
              <Button onClick={() => scrollTo('beneficios')} sx={{ color: '#374151', textTransform: 'none', fontWeight: 500 }}>
                Benefícios
              </Button>
              <Button onClick={() => scrollTo('sobre')} sx={{ color: '#374151', textTransform: 'none', fontWeight: 500 }}>
                Sobre
              </Button>
              <Button onClick={() => scrollTo('planos')} sx={{ color: '#374151', textTransform: 'none', fontWeight: 500 }}>
                Planos
              </Button>
            </Stack>

            <Button
              variant="contained"
              onClick={goToLogin}
              endIcon={<ArrowForward />}
              sx={{
                bgcolor: '#2563EB',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                py: 1,
                '&:hover': { bgcolor: '#1D4ED8' },
              }}
            >
              Entrar
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      {/* ═══════════ HERO ═══════════ */}
      <Box
        sx={{
          background: 'linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 100%)',
          pt: { xs: 6, md: 10 },
          pb: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip
                label="✨ Novo • Gestão condominial moderna"
                size="small"
                sx={{
                  bgcolor: '#DBEAFE', color: '#1E40AF',
                  fontWeight: 600, mb: 3, fontSize: 12,
                }}
              />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: 32, md: 48 },
                  lineHeight: 1.15,
                  color: '#111827',
                  mb: 2,
                }}
              >
                Gestão condominial{' '}
                <Box component="span" sx={{ color: '#2563EB' }}>
                  do jeito que deveria ser
                </Box>
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 400,
                  fontSize: { xs: 16, md: 18 },
                  color: '#6B7280',
                  mb: 4,
                  lineHeight: 1.6,
                }}
              >
                Síndico, contador e morador no mesmo ecossistema.
                Transparência total, finanças organizadas e comunicação sem WhatsApp.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={goToLogin}
                  endIcon={<ArrowForward />}
                  sx={{
                    bgcolor: '#2563EB',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontSize: 16,
                    '&:hover': { bgcolor: '#1D4ED8' },
                  }}
                >
                  Entrar no Sistema
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={goToLogin}
                  sx={{
                    borderColor: '#2563EB',
                    color: '#2563EB',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontSize: 16,
                    '&:hover': { borderColor: '#1D4ED8', bgcolor: '#EFF6FF' },
                  }}
                >
                  Ver demonstração
                </Button>
              </Stack>

              <Stack direction="row" spacing={3} sx={{ mt: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircle sx={{ fontSize: 18, color: '#16A34A' }} />
                  <Typography sx={{ fontSize: 13, color: '#6B7280' }}>Sem instalação</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircle sx={{ fontSize: 18, color: '#16A34A' }} />
                  <Typography sx={{ fontSize: 13, color: '#6B7280' }}>Mobile e desktop</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircle sx={{ fontSize: 18, color: '#16A34A' }} />
                  <Typography sx={{ fontSize: 13, color: '#6B7280' }}>Dados seguros</Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              {/* Mockup */}
              <Box
                sx={{
                  bgcolor: '#FFFFFF',
                  borderRadius: 4,
                  boxShadow: '0 25px 60px -15px rgba(37,99,235,0.25)',
                  border: '1px solid #E5E7EB',
                  p: 3,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ display: 'flex', gap: 0.75, mb: 2 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#EF4444' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10B981' }} />
                </Box>

                <Box sx={{ bgcolor: '#F9FAFB', borderRadius: 2, p: 2, mb: 1.5 }}>
                  <Typography sx={{ fontSize: 11, color: '#6B7280', fontWeight: 600, mb: 1 }}>
                    💰 FINANCEIRO
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: 12, color: '#6B7280' }}>Taxa condominial</Typography>
                    <Typography sx={{ fontSize: 12, color: '#16A34A', fontWeight: 600 }}>R$ 21.940,00</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: 12, color: '#6B7280' }}>Fundo de reserva</Typography>
                    <Typography sx={{ fontSize: 12, color: '#16A34A', fontWeight: 600 }}>R$ 1.290,00</Typography>
                  </Box>
                </Box>

                <Box sx={{ bgcolor: '#F9FAFB', borderRadius: 2, p: 2 }}>
                  <Typography sx={{ fontSize: 11, color: '#6B7280', fontWeight: 600, mb: 1 }}>
                    👥 COMUNICAÇÃO
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                      🏢
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 600 }}>Aviso importante</Typography>
                      <Typography sx={{ fontSize: 10, color: '#6B7280' }}>Manutenção do elevador</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ═══════════ PERFIS ═══════════ */}
      <Box id="perfis" sx={{ py: { xs: 8, md: 10 }, bgcolor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography sx={{ fontSize: 13, color: '#2563EB', fontWeight: 700, letterSpacing: 1, mb: 1 }}>
              PARA CADA PERFIL
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: 28, md: 36 }, color: '#111827', mb: 2 }}>
              Um sistema, três experiências
            </Typography>
            <Typography sx={{ color: '#6B7280', fontSize: 16, maxWidth: 600, mx: 'auto' }}>
              Cada usuário vê só o que importa. Login único, acesso personalizado.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {[
              {
                icon: <BadgeIcon sx={{ fontSize: 32 }} />,
                title: 'Síndico / Administrador',
                desc: 'Gestão completa do condomínio: finanças, moradores, manutenção, comunicação e prestação de contas.',
                color: '#2563EB',
                bg: '#EFF6FF',
                features: ['Financeiro completo', 'Prestação de contas', 'Gestão de moradores'],
              },
              {
                icon: <Person sx={{ fontSize: 32 }} />,
                title: 'Morador',
                desc: 'Transparência total: veja para onde vai o dinheiro, faça reservas, receba avisos e converse com a administração.',
                color: '#16A34A',
                bg: '#F0FDF4',
                features: ['Transparência financeira', 'Reservas de áreas', 'Avisos e enquetes'],
              },
              {
                icon: <Key sx={{ fontSize: 32 }} />,
                title: 'Colaborador / Portaria',
                desc: 'Operacional ágil: registre encomendas, autorize visitantes, gerencie manutenção e ocorrências.',
                color: '#D97706',
                bg: '#FFFBEB',
                features: ['Encomendas', 'Visitantes/QR', 'Manutenção'],
              },
            ].map((p, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    border: '1px solid #E5E7EB',
                    boxShadow: 'none',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 20px 40px -15px rgba(37,99,235,0.15)',
                      borderColor: p.color,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3.5 }}>
                    <Box
                      sx={{
                        width: 56, height: 56, borderRadius: 2,
                        bgcolor: p.bg, color: p.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        mb: 2.5,
                      }}
                    >
                      {p.icon}
                    </Box>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#111827', mb: 1 }}>
                      {p.title}
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: '#6B7280', mb: 2, lineHeight: 1.6 }}>
                      {p.desc}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Stack spacing={1}>
                      {p.features.map((f, j) => (
                        <Box key={j} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle sx={{ fontSize: 16, color: p.color }} />
                          <Typography sx={{ fontSize: 13, color: '#374151' }}>{f}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══════════ BENEFÍCIOS ═══════════ */}
      <Box id="beneficios" sx={{ py: { xs: 8, md: 10 }, bgcolor: '#F9FAFB' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography sx={{ fontSize: 13, color: '#2563EB', fontWeight: 700, letterSpacing: 1, mb: 1 }}>
              POR QUE O CONDOPRO
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: 28, md: 36 }, color: '#111827', mb: 2 }}>
              Tudo que seu condomínio precisa
            </Typography>
            <Typography sx={{ color: '#6B7280', fontSize: 16, maxWidth: 600, mx: 'auto' }}>
              Um ecossistema completo, integrado, feito para a realidade brasileira.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {[
              {
                icon: <AttachMoney sx={{ fontSize: 28 }} />,
                title: 'Financeiro completo',
                desc: 'Despesas, folha de pagamento, cobranças, conciliação bancária e prestação de contas automática.',
              },
              {
                icon: <Visibility sx={{ fontSize: 28 }} />,
                title: 'Transparência real',
                desc: 'Morador vê para onde vai cada centavo. Sem planilha, sem PDF de 69 páginas.',
              },
              {
                icon: <Campaign sx={{ fontSize: 28 }} />,
                title: 'Comunicação integrada',
                desc: 'Avisos, enquetes, assembleias, chat e ocorrências. Fim do grupo de WhatsApp.',
              },
              {
                icon: <CloudUpload sx={{ fontSize: 28 }} />,
                title: 'Importação inteligente',
                desc: 'Suba o PDF do contador e o sistema extrai, classifica e distribui automaticamente.',
              },
              {
                icon: <TrendingUp sx={{ fontSize: 28 }} />,
                title: 'Relatórios visuais',
                desc: 'Gráficos, comparativos anuais, fluxo de caixa. Tudo em tempo real.',
              },
              {
                icon: <SmartToy sx={{ fontSize: 28 }} />,
                title: 'IA integrada',
                desc: 'Concierge 24/7, categorização automática de despesas e sugestões inteligentes.',
              },
            ].map((b, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card
                  sx={{
                    height: '100%', borderRadius: 3, border: '1px solid #E5E7EB',
                    boxShadow: 'none', bgcolor: '#FFFFFF',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 20px 40px -15px rgba(37,99,235,0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        width: 48, height: 48, borderRadius: 2,
                        bgcolor: '#EFF6FF', color: '#2563EB',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        mb: 2,
                      }}
                    >
                      {b.icon}
                    </Box>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#111827', mb: 1 }}>
                      {b.title}
                    </Typography>
                    <Typography sx={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.6 }}>
                      {b.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══════════ COMO FUNCIONA ═══════════ */}
      <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography sx={{ fontSize: 13, color: '#2563EB', fontWeight: 700, letterSpacing: 1, mb: 1 }}>
              COMO FUNCIONA
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: 28, md: 36 }, color: '#111827' }}>
              Comece em 3 passos
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              { n: '1', title: 'Cadastre o condomínio', desc: 'CNPJ, endereço e unidades. Leva menos de 5 minutos.' },
              { n: '2', title: 'Convide os usuários', desc: 'Síndico, moradores e colaboradores recebem acesso personalizado.' },
              { n: '3', title: 'Pronto para usar', desc: 'Financeiro, comunicação e transparência funcionando de imediato.' },
            ].map((s, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 64, height: 64, borderRadius: '50%',
                      bgcolor: '#2563EB', color: '#FFFFFF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 26, fontWeight: 800, mx: 'auto', mb: 2.5,
                      boxShadow: '0 8px 20px -5px rgba(37,99,235,0.4)',
                    }}
                  >
                    {s.n}
                  </Box>
                  <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#111827', mb: 1 }}>
                    {s.title}
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>
                    {s.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══════════ SOBRE ═══════════ */}
      <Box id="sobre" sx={{ py: { xs: 8, md: 10 }, bgcolor: '#F9FAFB' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: 13, color: '#2563EB', fontWeight: 700, letterSpacing: 1, mb: 1 }}>
              SOBRE
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: 28, md: 36 }, color: '#111827', mb: 3 }}>
              O que é o CondoPro
            </Typography>
            <Typography sx={{ fontSize: 16, color: '#374151', lineHeight: 1.8, mb: 2 }}>
              O <strong>CondoPro</strong> é um ecossistema completo de gestão condominial que conecta
              síndicos, contadores, moradores e colaboradores em uma única plataforma.
            </Typography>
            <Typography sx={{ fontSize: 16, color: '#374151', lineHeight: 1.8, mb: 2 }}>
              Diferente dos sistemas tradicionais que geram PDFs e planilhas isoladas, o CondoPro
              <strong> interliga todos os módulos</strong>: uma despesa lançada vira lançamento contábil
              automaticamente, uma cobrança paga aparece na transparência do morador, e o contador
              importa o extrato bancário sem digitar nada.
            </Typography>
            <Typography sx={{ fontSize: 16, color: '#374151', lineHeight: 1.8 }}>
              Nossa missão é tornar a gestão condominial <strong>transparente, eficiente e auditável</strong> —
              do síndico ao morador, do contador à portaria.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* ═══════════ PLANOS ═══════════ */}
      <Box id="planos" sx={{ py: { xs: 8, md: 10 }, bgcolor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography sx={{ fontSize: 13, color: '#2563EB', fontWeight: 700, letterSpacing: 1, mb: 1 }}>
              PLANOS
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: 28, md: 36 }, color: '#111827', mb: 2 }}>
              Escolha o plano ideal
            </Typography>
            <Typography sx={{ color: '#6B7280', fontSize: 16, maxWidth: 600, mx: 'auto' }}>
              Todos os planos incluem todas as funcionalidades. O que muda é o tamanho do condomínio.
            </Typography>
          </Box>

          <Grid container spacing={3} justifyContent="center">
            {[
              {
                name: 'Básico',
                price: '199,90',
                desc: 'Até 20 unidades',
                features: ['Todas as funcionalidades', 'Síndico + Moradores', 'Suporte por email'],
                highlight: false,
              },
              {
                name: 'Profissional',
                price: '199,90',
                desc: 'Até 100 unidades',
                features: ['Todas as funcionalidades', 'Síndico + Moradores + Portaria', 'Suporte prioritário', 'Relatórios avançados'],
                highlight: true,
              },
              {
                name: 'Empresarial',
                price: '199,90',
                desc: 'Unidades ilimitadas',
                features: ['Todas as funcionalidades', 'Multi-condomínio', 'Contador integrado', 'Suporte dedicado', 'API personalizada'],
                highlight: false,
              },
            ].map((p, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Card
                  sx={{
                    height: '100%', borderRadius: 3,
                    border: p.highlight ? '2px solid #2563EB' : '1px solid #E5E7EB',
                    boxShadow: p.highlight ? '0 20px 50px -15px rgba(37,99,235,0.25)' : 'none',
                    position: 'relative',
                    transform: p.highlight ? { md: 'scale(1.03)' } : 'none',
                  }}
                >
                  {p.highlight && (
                    <Chip
                      label="MAIS POPULAR"
                      size="small"
                      sx={{
                        position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                        bgcolor: '#2563EB', color: 'white', fontWeight: 700, fontSize: 10, letterSpacing: 1,
                      }}
                    />
                  )}
                  <CardContent sx={{ p: 4 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#2563EB', mb: 1, letterSpacing: 1 }}>
                      {p.name.toUpperCase()}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 1 }}>
                      <Typography sx={{ fontSize: 16, color: '#6B7280', fontWeight: 500 }}>R$</Typography>
                      <Typography sx={{ fontSize: 42, fontWeight: 800, color: '#111827', lineHeight: 1 }}>
                        {p.price}
                      </Typography>
                      <Typography sx={{ fontSize: 14, color: '#6B7280', fontWeight: 500 }}>/mês</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 13, color: '#6B7280', mb: 3 }}>{p.desc}</Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Stack spacing={1.5} sx={{ mb: 3 }}>
                      {p.features.map((f, j) => (
                        <Box key={j} sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <CheckCircle sx={{ fontSize: 18, color: '#16A34A' }} />
                          <Typography sx={{ fontSize: 13.5, color: '#374151' }}>{f}</Typography>
                        </Box>
                      ))}
                    </Stack>
                    <Button
                      fullWidth
                      variant={p.highlight ? 'contained' : 'outlined'}
                      onClick={goToLogin}
                      sx={{
                        textTransform: 'none', fontWeight: 600, borderRadius: 2, py: 1.4,
                        ...(p.highlight
                          ? { bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' } }
                          : { borderColor: '#2563EB', color: '#2563EB', '&:hover': { bgcolor: '#EFF6FF' } }),
                      }}
                    >
                      Entrar no Sistema
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══════════ CTA FINAL ═══════════ */}
      <Box
        sx={{
          py: { xs: 8, md: 10 },
          background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
          color: 'white',
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: 28, md: 40 }, mb: 2 }}>
              Pronto pra transformar seu condomínio?
            </Typography>
            <Typography sx={{ fontSize: 18, opacity: 0.9, mb: 4, lineHeight: 1.6 }}>
              Junte-se aos condomínios que já usam o CondoPro para uma gestão transparente e eficiente.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={goToLogin}
              endIcon={<ArrowForward />}
              sx={{
                bgcolor: 'white',
                color: '#2563EB',
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 2,
                px: 5,
                py: 1.7,
                fontSize: 16,
                '&:hover': { bgcolor: '#F3F4F6' },
              }}
            >
              Entrar no Sistema
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ═══════════ FOOTER ═══════════ */}
      <Box sx={{ bgcolor: '#111827', color: '#9CA3AF', py: 5 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    bgcolor: '#2563EB', borderRadius: 2, width: 36, height: 36,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, color: 'white',
                  }}
                >
                  🏢
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: 16, color: 'white' }}>
                  CondoPro
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 13, lineHeight: 1.7 }}>
                Ecossistema completo de gestão condominial. Transparência, eficiência e tecnologia para o seu condomínio.
              </Typography>
            </Grid>
            <Grid item xs={6} md={4}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'white', mb: 2, letterSpacing: 1 }}>
                PRODUTO
              </Typography>
              <Stack spacing={1}>
                <Typography onClick={() => scrollTo('perfis')} sx={{ fontSize: 13, cursor: 'pointer', '&:hover': { color: 'white' } }}>Perfis</Typography>
                <Typography onClick={() => scrollTo('beneficios')} sx={{ fontSize: 13, cursor: 'pointer', '&:hover': { color: 'white' } }}>Benefícios</Typography>
                <Typography onClick={() => scrollTo('sobre')} sx={{ fontSize: 13, cursor: 'pointer', '&:hover': { color: 'white' } }}>Sobre</Typography>
                <Typography onClick={() => scrollTo('planos')} sx={{ fontSize: 13, cursor: 'pointer', '&:hover': { color: 'white' } }}>Planos</Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={4}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'white', mb: 2, letterSpacing: 1 }}>
                ACESSO
              </Typography>
              <Stack spacing={1}>
                <Typography onClick={goToLogin} sx={{ fontSize: 13, cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Entrar no Sistema
                </Typography>
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, borderColor: '#374151' }} />
          <Typography sx={{ fontSize: 12, textAlign: 'center' }}>
            © {new Date().getFullYear()} CondoPro. Todos os direitos reservados.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
