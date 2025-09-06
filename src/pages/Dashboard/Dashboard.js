// src/pages/Dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    Paper,
    IconButton,
    Chip,
    LinearProgress,
    Alert,
    Button
} from '@mui/material';
import {
    Phone,
    TrendingUp,
    AccessTime,
    CheckCircle,
    Warning,
    Refresh,
    FileDownload,
    PersonAdd
} from '@mui/icons-material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';
import { useAuth } from '../../hooks/useAuth';

const Dashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // 📊 Datos de ejemplo para métricas
    const [metrics, setMetrics] = useState({
        totalCalls: 245,
        todayCalls: 18,
        pendingCalls: 7,
        resolvedCalls: 238,
        avgResponseTime: '4.2 min',
        satisfaction: 94.2
    });

    // 📈 Datos para gráficos
    const callsByHour = [
        { hour: '08:00', calls: 12 },
        { hour: '09:00', calls: 18 },
        { hour: '10:00', calls: 25 },
        { hour: '11:00', calls: 22 },
        { hour: '12:00', calls: 15 },
        { hour: '13:00', calls: 8 },
        { hour: '14:00', calls: 20 },
        { hour: '15:00', calls: 28 },
        { hour: '16:00', calls: 24 },
        { hour: '17:00', calls: 16 }
    ];

    const callsByType = [
        { name: 'Información', value: 45, color: '#1976d2' },
        { name: 'Reclamos', value: 30, color: '#dc2626' },
        { name: 'Solicitudes', value: 15, color: '#059669' },
        { name: 'Cortes', value: 10, color: '#d97706' }
    ];

    const weeklyTrend = [
        { day: 'Lun', calls: 42 },
        { day: 'Mar', calls: 38 },
        { day: 'Mié', calls: 45 },
        { day: 'Jue', calls: 52 },
        { day: 'Vie', calls: 48 },
        { day: 'Sáb', calls: 25 },
        { day: 'Dom', calls: 15 }
    ];

    const handleRefresh = () => {
        setLoading(true);
        // Simular carga de datos
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    };

    // 🎯 Componente de métrica
    const MetricCard = ({ title, value, subtitle, icon, color, trend }) => (
        <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${color}.100`, color: `${color}.600` }}>
                        {icon}
                    </Box>
                    {trend && (
                        <Chip
                            label={trend}
                            size="small"
                            color={trend.includes('+') ? 'success' : 'error'}
                            variant="outlined"
                        />
                    )}
                </Box>
                <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                    {value}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    {title}
                </Typography>
                {subtitle && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {subtitle}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );

    return (
        <Box>
            {/* 📋 Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                        Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Bienvenido, {user?.displayName || user?.email}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<FileDownload />}
                        size="small"
                    >
                        Exportar
                    </Button>
                    <IconButton onClick={handleRefresh} color="primary">
                        <Refresh />
                    </IconButton>
                </Box>
            </Box>

            {/* 🔄 Loading */}
            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {/* 📊 Métricas principales */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Total Llamadas"
                        value={metrics.totalCalls}
                        subtitle="Este mes"
                        icon={<Phone />}
                        color="primary"
                        trend="+12%"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Llamadas Hoy"
                        value={metrics.todayCalls}
                        subtitle="En progreso"
                        icon={<TrendingUp />}
                        color="success"
                        trend="+5%"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Pendientes"
                        value={metrics.pendingCalls}
                        subtitle="Requieren seguimiento"
                        icon={<Warning />}
                        color="warning"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Resueltas"
                        value={metrics.resolvedCalls}
                        subtitle="Tiempo promedio: 4.2 min"
                        icon={<CheckCircle />}
                        color="success"
                        trend="+8%"
                    />
                </Grid>
            </Grid>

            {/* 📈 Gráficos */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Llamadas por hora */}
                <Grid item xs={12} lg={8}>
                    <Paper sx={{ p: 3, height: 400 }}>
                        <Typography variant="h6" gutterBottom>
                            Llamadas por Hora - Hoy
                        </Typography>
                        <ResponsiveContainer width="100%" height="85%">
                            <BarChart data={callsByHour}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="calls" fill="#1976d2" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Tipos de llamadas */}
                <Grid item xs={12} lg={4}>
                    <Paper sx={{ p: 3, height: 400 }}>
                        <Typography variant="h6" gutterBottom>
                            Tipos de Llamadas
                        </Typography>
                        <ResponsiveContainer width="100%" height="70%">
                            <PieChart>
                                <Pie
                                    data={callsByType}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {callsByType.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <Box sx={{ mt: 2 }}>
                            {callsByType.map((item) => (
                                <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Box
                                        sx={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: '50%',
                                            bgcolor: item.color,
                                            mr: 1
                                        }}
                                    />
                                    <Typography variant="body2" sx={{ flex: 1 }}>
                                        {item.name}
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        {item.value}%
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* 📊 Tendencia semanal */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, height: 300 }}>
                        <Typography variant="h6" gutterBottom>
                            Tendencia Semanal
                        </Typography>
                        <ResponsiveContainer width="100%" height="85%">
                            <LineChart data={weeklyTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="calls"
                                    stroke="#1976d2"
                                    strokeWidth={3}
                                    dot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Alertas y notificaciones */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: 300 }}>
                        <Typography variant="h6" gutterBottom>
                            Alertas Recientes
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Alert severity="warning" size="small">
                                7 llamadas pendientes de seguimiento
                            </Alert>
                            <Alert severity="info" size="small">
                                Pico de llamadas detectado a las 15:00
                            </Alert>
                            <Alert severity="success" size="small">
                                Meta diaria alcanzada (18/15 llamadas)
                            </Alert>

                            <Box sx={{ mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<PersonAdd />}
                                    fullWidth
                                    href="/new-call"
                                >
                                    Registrar Nueva Llamada
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;