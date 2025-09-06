// src/pages/Calls/CallsTable.js
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
    Chip,
    Paper,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    LinearProgress,
    Badge
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
    Search,
    FilterList,
    Refresh,
    Visibility,
    Edit,
    Delete,
    FileDownload,
    Clear,
    CalendarToday,
    Phone,
    LocationOn
} from '@mui/icons-material';
import { ref, onValue, remove, update } from 'firebase/database';
import { database, dbRefs } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const CallsTable = () => {
    const { user } = useAuth();
    const [calls, setCalls] = useState([]);
    const [filteredCalls, setFilteredCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCall, setSelectedCall] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    // 🔍 Estados de filtros
    const [filters, setFilters] = useState({
        search: '',
        gestion: '',
        estado: '',
        medio: '',
        agente: '',
        fechaInicio: '',
        fechaFin: ''
    });

    // 📊 Opciones para filtros
    const filterOptions = {
        gestion: ['INFORMACION', 'ACUEDUCTO', 'RECLAMO', 'SOLICITUD', 'CORTE', 'RECONEXION', 'ENERGIA', 'FACTURACION'],
        estado: ['ABIERTO', 'CERRADO', 'EN PROCESO', 'PENDIENTE', 'RESUELTO', 'CANCELADO'],
        medio: ['LLAMADA', 'PRESENCIAL', 'EMAIL', 'WHATSAPP', 'CHAT']
    };

    // 📅 Cargar llamadas desde Firebase
    useEffect(() => {
        const callsRef = ref(database, dbRefs.calls);

        const unsubscribe = onValue(callsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const callsArray = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                // Ordenar por fecha más reciente
                callsArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setCalls(callsArray);
                setFilteredCalls(callsArray);
            } else {
                setCalls([]);
                setFilteredCalls([]);
            }
            setLoading(false);
        }, (error) => {
            console.error('Error al cargar llamadas:', error);
            toast.error('Error al cargar las llamadas');
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 🔍 Aplicar filtros
    useEffect(() => {
        let filtered = [...calls];

        // Filtro de búsqueda general
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(call =>
                call.nombreUsuario?.toLowerCase().includes(searchLower) ||
                call.telefono?.includes(filters.search) ||
                call.cedula?.includes(filters.search) ||
                call.numeroOT?.toLowerCase().includes(searchLower) ||
                call.observaciones?.toLowerCase().includes(searchLower)
            );
        }

        // Filtros específicos
        if (filters.gestion) {
            filtered = filtered.filter(call => call.gestion === filters.gestion);
        }
        if (filters.estado) {
            filtered = filtered.filter(call => call.estado === filters.estado);
        }
        if (filters.medio) {
            filtered = filtered.filter(call => call.medio === filters.medio);
        }
        if (filters.agente) {
            filtered = filtered.filter(call => call.agente?.toLowerCase().includes(filters.agente.toLowerCase()));
        }

        // Filtros de fecha
        if (filters.fechaInicio) {
            filtered = filtered.filter(call => {
                const callDate = new Date(call.fecha);
                const startDate = new Date(filters.fechaInicio);
                return callDate >= startDate;
            });
        }
        if (filters.fechaFin) {
            filtered = filtered.filter(call => {
                const callDate = new Date(call.fecha);
                const endDate = new Date(filters.fechaFin);
                return callDate <= endDate;
            });
        }

        setFilteredCalls(filtered);
    }, [calls, filters]);

    // 📝 Manejar cambios en filtros
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 🧹 Limpiar filtros
    const clearFilters = () => {
        setFilters({
            search: '',
            gestion: '',
            estado: '',
            medio: '',
            agente: '',
            fechaInicio: '',
            fechaFin: ''
        });
    };

    // 👁️ Ver detalles de llamada
    const handleViewCall = (call) => {
        setSelectedCall(call);
        setOpenDialog(true);
    };

    // 🗑️ Eliminar llamada
    const handleDeleteCall = async (callId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta llamada?')) {
            try {
                const callRef = ref(database, `${dbRefs.calls}/${callId}`);
                await remove(callRef);
                toast.success('Llamada eliminada correctamente');
            } catch (error) {
                console.error('Error al eliminar llamada:', error);
                toast.error('Error al eliminar la llamada');
            }
        }
    };

    // 📊 Obtener color del chip según estado
    const getStatusColor = (estado) => {
        const colors = {
            'ABIERTO': 'warning',
            'CERRADO': 'success',
            'EN PROCESO': 'info',
            'PENDIENTE': 'warning',
            'RESUELTO': 'success',
            'CANCELADO': 'error'
        };
        return colors[estado] || 'default';
    };

    // 📊 Obtener color del chip según gestión
    const getGestionColor = (gestion) => {
        const colors = {
            'INFORMACION': 'info',
            'ACUEDUCTO': 'primary',
            'RECLAMO': 'error',
            'SOLICITUD': 'warning',
            'CORTE': 'error',
            'RECONEXION': 'success',
            'ENERGIA': 'secondary',
            'FACTURACION': 'default'
        };
        return colors[gestion] || 'default';
    };

    // 📋 Configuración de columnas para DataGrid
    const columns = [
        {
            field: 'fecha',
            headerName: 'Fecha',
            width: 140,
            renderCell: (params) => {
                if (!params.value) return '';
                return format(new Date(params.value), 'dd/MM/yyyy HH:mm', { locale: es });
            }
        },
        {
            field: 'nombreUsuario',
            headerName: 'Usuario',
            width: 200,
            renderCell: (params) => (
                <Box>
                    <Typography variant="body2" fontWeight="medium">
                        {params.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {params.row.telefono}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'gestion',
            headerName: 'Gestión',
            width: 140,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    color={getGestionColor(params.value)}
                    variant="outlined"
                />
            )
        },
        {
            field: 'estado',
            headerName: 'Estado',
            width: 120,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    color={getStatusColor(params.value)}
                />
            )
        },
        {
            field: 'medio',
            headerName: 'Medio',
            width: 100,
            renderCell: (params) => (
                <Chip label={params.value} size="small" variant="outlined" />
            )
        },
        {
            field: 'numeroOT',
            headerName: 'OT',
            width: 120,
            renderCell: (params) => (
                <Typography variant="body2" fontFamily="monospace">
                    {params.value || 'N/A'}
                </Typography>
            )
        },
        {
            field: 'agente',
            headerName: 'Agente',
            width: 130,
            renderCell: (params) => (
                <Typography variant="body2">
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'actions',
            headerName: 'Acciones',
            width: 140,
            sortable: false,
            renderCell: (params) => (
                <Box>
                    <Tooltip title="Ver detalles">
                        <IconButton
                            size="small"
                            onClick={() => handleViewCall(params.row)}
                            color="primary"
                        >
                            <Visibility fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                        <IconButton
                            size="small"
                            onClick={() => handleDeleteCall(params.row.id)}
                            color="error"
                        >
                            <Delete fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    return (
        <Box>
            {/* 📋 Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                        📋 Gestión de Llamadas
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Visualiza y gestiona todas las llamadas registradas
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Badge badgeContent={filteredCalls.length} color="primary">
                        <Button variant="outlined" startIcon={<Phone />}>
                            Llamadas
                        </Button>
                    </Badge>
                    <Button
                        variant="outlined"
                        startIcon={<FileDownload />}
                        size="small"
                    >
                        Exportar
                    </Button>
                    <IconButton color="primary" onClick={() => window.location.reload()}>
                        <Refresh />
                    </IconButton>
                </Box>
            </Box>

            {/* 🔍 Filtros */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <FilterList color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" fontWeight="bold">
                            Filtros de Búsqueda
                        </Typography>
                        <Box sx={{ ml: 'auto' }}>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Clear />}
                                onClick={clearFilters}
                            >
                                Limpiar
                            </Button>
                        </Box>
                    </Box>

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Buscar"
                                placeholder="Nombre, teléfono, cédula, OT..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                InputProps={{
                                    startAdornment: <Search color="action" sx={{ mr: 1 }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>Gestión</InputLabel>
                                <Select
                                    value={filters.gestion}
                                    onChange={(e) => handleFilterChange('gestion', e.target.value)}
                                    label="Gestión"
                                >
                                    <MenuItem value="">Todas</MenuItem>
                                    {filterOptions.gestion.map((option) => (
                                        <MenuItem key={option} value={option}>{option}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>Estado</InputLabel>
                                <Select
                                    value={filters.estado}
                                    onChange={(e) => handleFilterChange('estado', e.target.value)}
                                    label="Estado"
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    {filterOptions.estado.map((option) => (
                                        <MenuItem key={option} value={option}>{option}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>Medio</InputLabel>
                                <Select
                                    value={filters.medio}
                                    onChange={(e) => handleFilterChange('medio', e.target.value)}
                                    label="Medio"
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    {filterOptions.medio.map((option) => (
                                        <MenuItem key={option} value={option}>{option}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <TextField
                                fullWidth
                                label="Fecha Inicio"
                                type="date"
                                value={filters.fechaInicio}
                                onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* 📊 Tabla de datos */}
            <Card>
                <CardContent sx={{ p: 0 }}>
                    {loading && <LinearProgress />}

                    <Box sx={{ height: 600, width: '100%' }}>
                        <DataGrid
                            rows={filteredCalls}
                            columns={columns}
                            pageSize={10}
                            rowsPerPageOptions={[10, 25, 50]}
                            disableSelectionOnClick
                            loading={loading}
                            localeText={{
                                noRowsLabel: 'No hay llamadas registradas',
                                footerRowSelected: (count) => `${count} fila(s) seleccionada(s)`,
                                footerTotalRows: 'Total de filas:',
                                columnMenuLabel: 'Menú',
                                columnMenuShowColumns: 'Mostrar columnas',
                                columnMenuFilter: 'Filtrar',
                                columnMenuHideColumn: 'Ocultar',
                                columnMenuUnsort: 'Quitar orden',
                                columnMenuSortAsc: 'Orden ascendente',
                                columnMenuSortDesc: 'Orden descendente'
                            }}
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-cell:hover': {
                                    backgroundColor: 'action.hover'
                                }
                            }}
                        />
                    </Box>
                </CardContent>
            </Card>

            {/* 👁️ Dialog de detalles */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Typography variant="h6" fontWeight="bold">
                        📞 Detalles de la Llamada
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {selectedCall && (
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">Fecha</Typography>
                                <Typography variant="body1" gutterBottom>
                                    {format(new Date(selectedCall.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">Usuario</Typography>
                                <Typography variant="body1" gutterBottom>{selectedCall.nombreUsuario}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">Teléfono</Typography>
                                <Typography variant="body1" gutterBottom>{selectedCall.telefono}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">Gestión</Typography>
                                <Chip label={selectedCall.gestion} color={getGestionColor(selectedCall.gestion)} />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">Dirección</Typography>
                                <Typography variant="body1" gutterBottom>
                                    {selectedCall.direccion} - {selectedCall.barrio}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">Observaciones</Typography>
                                <Typography variant="body1" gutterBottom>
                                    {selectedCall.observaciones || 'Sin observaciones'}
                                </Typography>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CallsTable;