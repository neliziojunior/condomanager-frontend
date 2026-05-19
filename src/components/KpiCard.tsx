import { Card, CardContent, Typography, Box } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface KpiCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

export default function KpiCard({ title, value, trend, icon, color, subtitle }: KpiCardProps) {
  return (
    <Card sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="caption" sx={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, fontSize: 22 }}>
              {value}
            </Typography>
            {trend !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                {trend >= 0 ? (
                  <TrendingUp sx={{ fontSize: 14, color: '#02C39A' }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 14, color: '#E63946' }} />
                )}
                <Typography variant="caption" sx={{ color: trend >= 0 ? '#02C39A' : '#E63946', fontWeight: 600 }}>
                  {trend >= 0 ? '+' : ''}{trend}%
                </Typography>
              </Box>
            )}
            {subtitle && (
              <Typography variant="caption" sx={{ color: '#6B7280', fontSize: 10 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ 
            bgcolor: `${color}15`, 
            borderRadius: 2, 
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
