// src/pages/Reports/Reports.js
import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Divider,
    Alert
} from '@mui/material';
import {
    FileDownload,
    Assessment,
    PictureAsPdf,
    TableChart,
    CalendarToday,
    TrendingUp,
    BarChart as BarChartIcon
} from '@mui/icons-material';
import { ref, onValue } from 'firebase/database';
import { database, dbRefs } from '../../services/firebase';
import { toast } from 'react-toastify';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';

const Reports = () => {
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reportFilters, setReportFilters] = useState({
        periodo: 'mes_actual',
        tipoReporte: 'general',
        fechaInicio: '',
        fechaFin: '',
        agente: '',
        gestion: ''
    });

    // 📊 Estados para estadísticas
    const [stats, setStats] = useState({
        totalLlamadas: 0,
        porGestion: {},
        porEstado: {},
        porAgente: {},
        porMedio: {},
        promedioPorDia: 0,
        tendenciaSemanal: []
    });

    // 📅 Cargar datos
    useEffect(() => {
        const callsRef = ref(database, dbRefs.calls);

        const unsubscribe = onValue(callsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const callsArray = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                setCalls(callsArray);
                calculateStats(callsArray);
            } else {
                setCalls([]);
                setStats({
                    totalLlamadas: 0,
                    porGestion: {},
                    porEstado: {},
                    porAgente: {},
                    porMedio: {},
                    promedioPorDia: 0,
                    tendenciaSemanal: []
                });
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 📊 Calcular estadísticas
    const calculateStats = (callsData) => {
        const now = new Date();

        // Filtrar según período seleccionado
        let filteredCalls = callsData;

        switch (reportFilters.periodo) {
            case 'mes_actual':
                const startMonth = startOfMonth(now);
                const endMonth = endOfMonth(now);
                filteredCalls = callsData.filter(call =>
                    isWithinInterval(new Date(call.fecha), { start: startMonth, end: endMonth })
                );
                break;
            case 'semana_actual':
                const startWeek = startOfWeek(now, { weekStartsOn: 1 });
                const endWeek = endOfWeek(now, { weekStartsOn: 1 });
                filteredCalls = callsData.filter(call =>
                    isWithinInterval(new Date(call.fecha), { start: startWeek, end: endWeek })
                );
                break;
            case 'personalizado':
                if (reportFilters.fechaInicio && reportFilters.fechaFin) {
                    filteredCalls = callsData.filter(call =>
                        isWithinInterval(new Date(call.fecha), {
                            start: new Date(reportFilters.fechaInicio),
                            end: new Date(reportFilters.fechaFin)
                        })
                    );
                }
                break;
        }

        // Aplicar filtros adicionales
        if (reportFilters.agente) {
            filteredCalls = filteredCalls.filter(call =>
                call.agente?.toLowerCase().includes(reportFilters.agente.toLowerCase())
            );
        }

        if (reportFilters.gestion) {
            filteredCalls = filteredCalls.filter(call => call.gestion === reportFilters.gestion);
        }

        // Calcular estadísticas
        const porGestion = {};
        const porEstado = {};
        const porAgente = {};
        const porMedio = {};

        filteredCalls.forEach(call => {
            // Por gestión
            porGestion[call.gestion] = (porGestion[call.gestion] || 0) + 1;

            // Por estado
            porEstado[call.estado] = (porEstado[call.estado] || 0) + 1;

            // Por agente
            porAgente[call.agente] = (porAgente[call.agente] || 0) + 1;

            // Por medio
            porMedio[call.medio] = (porMedio[call.medio] || 0) + 1;
        });

        // Promedio por día (último mes)
        const diasDelMes = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const promedioPorDia = filteredCalls.length / diasDelMes;

        setStats({
            totalLlamadas: filteredCalls.length,
            porGestion,
            porEstado,
            porAgente,
            porMedio,
            promedioPorDia: Math.round(promedioPorDia * 10) / 10,
            tendenciaSemanal: []
        });
    };

    // 📝 Manejar cambios en filtros
    const handleFilterChange = (field, value) => {
        setReportFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 📊 Generar reporte
    const generateReport = () => {
        calculateStats(calls);
        toast.success('Reporte generado correctamente');
    };

    // 📄 Exportar a Excel
    const exportToExcel = () => {
        if (calls.length === 0) {
            toast.warning('No hay datos para exportar');
            return;
        }

        // Preparar datos para Excel
        const excelData = calls.map(call => ({
            'Fecha': format(new Date(call.fecha), 'dd/MM/yyyy HH:mm'),
            'Medio': call.medio,
            'Nombre Usuario': call.nombreUsuario,
            'Cédula': call.cedula || '',
            'Teléfono': call.telefono,
            'Dirección': call.direccion || '',
            'Barrio': call.barrio || '',
            'Cuenta/Contrato': call.cuentaContrato || '',
            'Gestión': call.gestion,
            'Clase Orden': call.claseOrden || '',
            'Número OT': call.numeroOT || '',
            'Estado': call.estado || '',
            'Incidencia': call.incidencia || '',
            'Observaciones': call.observaciones || '',
            'Agente': call.agente
        }));

        // Crear libro de Excel
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Llamadas');

        // Generar archivo
        const fileName = `reporte_llamadas_${format(new Date(), 'ddMMyyyy_HHmm')}.xlsx`;
        XLSX.writeFile(wb, fileName);

        toast.success('Reporte Excel descargado');
    };

    // 📊 Obtener top 5 de una categoría
    const getTop5 = (data) => {
        return Object.entries(data)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);
    };

    return (
        <Box>
            {/* 📋 Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                    📊 Reportes y Estadísticas
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Genera reportes detallados y estadísticas del sistema
                </Typography>
            </Box>

            {/* 🔍 Filtros de reporte */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Configuración del Reporte
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Período</InputLabel>
                                <Select
                                    value={reportFilters.periodo}
                                    onChange={(e) => handleFilterChange('periodo', e.target.value)}
                                    label="Período"
                                >
                                    <MenuItem value="mes_actual">Mes Actual</MenuItem>
                                    <MenuItem value="semana_actual">Semana Actual</MenuItem>
                                    <MenuItem value="personalizado">Período Personalizado</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {reportFilters.periodo === 'personalizado' && (
                            <>
                                <Grid item xs={12} md={2}>
                                    <TextField
                                        fullWidth
                                        label="Fecha Inicio"
                                        type="date"
                                        value={reportFilters.fechaInicio}
                                        onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <TextField
                                        fullWidth
                                        label="Fecha Fin"
                                        type="date"
                                        value={reportFilters.fechaFin}
                                        onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                            </>
                        )}

                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>Gestión</InputLabel>
                                <Select
                                    value={reportFilters.gestion}
                                    onChange={(e) => handleFilterChange('gestion', e.target.value)}
                                    label="Gestión"
                                >
                                    <MenuItem value="">Todas</MenuItem>
                                    <MenuItem value="INFORMACION">Información</MenuItem>
                                    <MenuItem value="ACUEDUCTO">Acueducto</MenuItem>
                                    <MenuItem value="RECLAMO">Reclamo</MenuItem>
                                    <MenuItem value="SOLICITUD">Solicitud</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'center' }}>
                                <Button
                                    variant="contained"
                                    onClick={generateReport}
                                    startIcon={<Assessment />}
                                    fullWidth
                                >
                                    Generar Reporte
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={exportToExcel}
                                    startIcon={<FileDownload />}
                                >
                                    Excel
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* 📊 Estadísticas principales */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" color="primary" fontWeight="bold">
                                {stats.totalLlamadas}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                Total Llamadas
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" color="success.main" fontWeight="bold">
                                {stats.promedioPorDia}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                Promedio/Día
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" color="warning.main" fontWeight="bold">
                                {Object.keys(stats.porAgente).length}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                Agentes Activos
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" color="info.main" fontWeight="bold">
                                {Object.keys(stats.porGestion).length}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                Tipos de Gestión
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 📈 Tablas de estadísticas */}
            <Grid container spacing={3}>
                {/* Top 5 Gestiones */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Top 5 - Tipos de Gestión
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><strong>Gestión</strong></TableCell>
                                            <TableCell align="right"><strong>Cantidad</strong></TableCell>
                                            <TableCell align="right"><strong>%</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {getTop5(stats.porGestion).map(([gestion, cantidad]) => (
                                            <TableRow key={gestion}>
                                                <TableCell>
                                                    <Chip label={gestion} size="small" color="primary" variant="outlined" />
                                                </TableCell>
                                                <TableCell align="right">{cantidad}</TableCell>
                                                <TableCell align="right">
                                                    {stats.totalLlamadas > 0 ?
                                                        Math.round((cantidad / stats.totalLlamadas) * 100) : 0}%
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Top 5 Agentes */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Top 5 - Agentes Más Productivos
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><strong>Agente</strong></TableCell>
                                            <TableCell align="right"><strong>Llamadas</strong></TableCell>
                                            <TableCell align="right"><strong>%</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {getTop5(stats.porAgente).map(([agente, cantidad]) => (
                                            <TableRow key={agente}>
                                                <TableCell>{agente}</TableCell>
                                                <TableCell align="right">{cantidad}</TableCell>
                                                <TableCell align="right">
                                                    {stats.totalLlamadas > 0 ?
                                                        Math.round((cantidad / stats.totalLlamadas) * 100) : 0}%
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Estados */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Distribución por Estado
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><strong>Estado</strong></TableCell>
                                            <TableCell align="right"><strong>Cantidad</strong></TableCell>
                                            <TableCell align="right"><strong>%</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Object.entries(stats.porEstado).map(([estado, cantidad]) => (
                                            <TableRow key={estado}>
                                                <TableCell>
                                                    <Chip
                                                        label={estado}
                                                        size="small"
                                                        color={estado === 'RESUELTO' ? 'success' : estado === 'PENDIENTE' ? 'warning' : 'default'}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">{cantidad}</TableCell>
                                                <TableCell align="right">
                                                    {stats.totalLlamadas > 0 ?
                                                        Math.round((cantidad / stats.totalLlamadas) * 100) : 0}%
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Medios de contacto */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Medios de Contacto
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><strong>Medio</strong></TableCell>
                                            <TableCell align="right"><strong>Cantidad</strong></TableCell>
                                            <TableCell align="right"><strong>%</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Object.entries(stats.porMedio).map(([medio, cantidad]) => (
                                            <TableRow key={medio}>
                                                <TableCell>
                                                    <Chip label={medio} size="small" color="info" variant="outlined" />
                                                </TableCell>
                                                <TableCell align="right">{cantidad}</TableCell>
                                                <TableCell align="right">
                                                    {stats.totalLlamadas > 0 ?
                                                        Math.round((cantidad / stats.totalLlamadas) * 100) : 0}%
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 💡 Información adicional */}
            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Alert severity="info">
                        <Typography variant="body2">
                            <strong>Información:</strong> Los reportes se generan en tiempo real basados en los datos almacenados.
                            Puedes exportar los datos a Excel para análisis más detallados.
                        </Typography>
                    </Alert>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Reports;