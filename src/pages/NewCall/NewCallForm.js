// src/pages/NewCall/NewCallForm.js
import React, { useState } from 'react';
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
    Divider,
    Chip,
    Alert,
    Paper,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Save,
    Clear,
    Phone,
    Person,
    LocationOn,
    Business,
    Assignment,
    Info,
    AutoAwesome
} from '@mui/icons-material';
import { ref, push, set } from 'firebase/database';
import { database, dbRefs } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const NewCallForm = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        // 📅 Información básica
        fecha: new Date().toISOString().slice(0, 16), // formato datetime-local
        medio: 'LLAMADA',

        // 👤 Datos del usuario
        nombreUsuario: '',
        cedula: '',
        telefono: '',
        direccion: '',
        barrio: '',

        // 🏢 Información del servicio
        cuentaContrato: '',

        // 📋 Gestión
        gestion: '',
        claseOrden: '',
        numeroOT: '',
        estado: '',
        incidencia: '',
        observaciones: '',

        // 👨‍💼 Agente
        agente: user?.displayName || user?.email || ''
    });

    // 📊 Opciones para los campos select
    const opciones = {
        medio: ['LLAMADA', 'PRESENCIAL', 'EMAIL', 'WHATSAPP', 'CHAT'],
        gestion: [
            'INFORMACION',
            'ACUEDUCTO',
            'RECLAMO',
            'SOLICITUD',
            'CORTE',
            'RECONEXION',
            'ENERGIA',
            'FACTURACION'
        ],
        claseOrden: [
            'CAMBIO MEDIDOR',
            'REPARCHEO ESCOMBROS POR FUGA',
            'SOBRE FACTURA',
            'REVISION MEDIDOR',
            'INSTALACION',
            'REPARACION',
            'RECONEXION SERVICIO',
            'CORTE SERVICIO',
            'MANTENIMIENTO',
            'CONSULTA'
        ],
        estado: [
            'ABIERTO',
            'CERRADO',
            'EN PROCESO',
            'PENDIENTE',
            'RESUELTO',
            'CANCELADO'
        ],
        barrios: [
            'CENTRO',
            'SAN VICENTE DE PAUL',
            'VILLA CAFÉ',
            'SANTA LUCIA - LOS CAMBULOS',
            'TENERIFE',
            'ZONA INDUSTRIAL',
            'ALTICO',
            'LAS GRANJAS',
            'CAGUAN',
            'MAIZAL'
        ]
    };

    // 📝 Manejar cambios en el formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 🎯 Generar número de OT automático
    const generateOT = () => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        const ot = `OT${timestamp.toString().slice(-6)}${random.toString().padStart(3, '0')}`;
        setFormData(prev => ({
            ...prev,
            numeroOT: ot
        }));
        toast.success(`Número de OT generado: ${ot}`);
    };

    // 🧹 Limpiar formulario
    const handleClear = () => {
        setFormData({
            fecha: new Date().toISOString().slice(0, 16),
            medio: 'LLAMADA',
            nombreUsuario: '',
            cedula: '',
            telefono: '',
            direccion: '',
            barrio: '',
            cuentaContrato: '',
            gestion: '',
            claseOrden: '',
            numeroOT: '',
            estado: '',
            incidencia: '',
            observaciones: '',
            agente: user?.displayName || user?.email || ''
        });
        toast.info('Formulario limpiado');
    };

    // 💾 Guardar llamada
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones básicas
        if (!formData.nombreUsuario || !formData.telefono || !formData.gestion) {
            toast.error('Por favor completa los campos obligatorios');
            return;
        }

        setLoading(true);
        try {
            // 📊 Preparar datos para Firebase
            const callData = {
                ...formData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: user?.uid || 'unknown'
            };

            // 💾 Guardar en Firebase Realtime Database
            const callsRef = ref(database, dbRefs.calls);
            const newCallRef = push(callsRef);
            await set(newCallRef, callData);

            toast.success('¡Llamada registrada exitosamente!');

            // 🔄 Limpiar formulario después de guardar
            handleClear();

        } catch (error) {
            console.error('Error al guardar la llamada:', error);
            toast.error('Error al registrar la llamada');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            {/* 📋 Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                    📝 Nueva Llamada
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Registra la información de la llamada recibida
                </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>

                    {/* 📅 Información básica */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <Info color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6" fontWeight="bold">
                                        Información Básica
                                    </Typography>
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            name="fecha"
                                            label="Fecha y Hora"
                                            type="datetime-local"
                                            value={formData.fecha}
                                            onChange={handleInputChange}
                                            fullWidth
                                            required
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth required>
                                            <InputLabel>Medio de Contacto</InputLabel>
                                            <Select
                                                name="medio"
                                                value={formData.medio}
                                                onChange={handleInputChange}
                                                label="Medio de Contacto"
                                            >
                                                {opciones.medio.map((medio) => (
                                                    <MenuItem key={medio} value={medio}>
                                                        {medio}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* 👤 Datos del usuario */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <Person color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6" fontWeight="bold">
                                        Datos del Usuario
                                    </Typography>
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            name="nombreUsuario"
                                            label="Nombre Completo"
                                            value={formData.nombreUsuario}
                                            onChange={handleInputChange}
                                            fullWidth
                                            required
                                            placeholder="Ej: Juan Pérez González"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            name="cedula"
                                            label="Cédula"
                                            value={formData.cedula}
                                            onChange={handleInputChange}
                                            fullWidth
                                            placeholder="Ej: 12345678"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            name="telefono"
                                            label="Teléfono"
                                            value={formData.telefono}
                                            onChange={handleInputChange}
                                            fullWidth
                                            required
                                            placeholder="Ej: 3001234567"
                                            inputProps={{ maxLength: 10 }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            name="cuentaContrato"
                                            label="Cuenta/Contrato"
                                            value={formData.cuentaContrato}
                                            onChange={handleInputChange}
                                            fullWidth
                                            placeholder="Ej: 80710900"
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* 📍 Ubicación */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <LocationOn color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6" fontWeight="bold">
                                        Ubicación
                                    </Typography>
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={8}>
                                        <TextField
                                            name="direccion"
                                            label="Dirección"
                                            value={formData.direccion}
                                            onChange={handleInputChange}
                                            fullWidth
                                            placeholder="Ej: CL 17 B 47 34"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <FormControl fullWidth>
                                            <InputLabel>Barrio</InputLabel>
                                            <Select
                                                name="barrio"
                                                value={formData.barrio}
                                                onChange={handleInputChange}
                                                label="Barrio"
                                            >
                                                {opciones.barrios.map((barrio) => (
                                                    <MenuItem key={barrio} value={barrio}>
                                                        {barrio}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* 📋 Gestión y Orden */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <Assignment color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6" fontWeight="bold">
                                        Gestión y Orden de Trabajo
                                    </Typography>
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth required>
                                            <InputLabel>Tipo de Gestión</InputLabel>
                                            <Select
                                                name="gestion"
                                                value={formData.gestion}
                                                onChange={handleInputChange}
                                                label="Tipo de Gestión"
                                            >
                                                {opciones.gestion.map((tipo) => (
                                                    <MenuItem key={tipo} value={tipo}>
                                                        {tipo}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Clase de Orden</InputLabel>
                                            <Select
                                                name="claseOrden"
                                                value={formData.claseOrden}
                                                onChange={handleInputChange}
                                                label="Clase de Orden"
                                            >
                                                {opciones.claseOrden.map((clase) => (
                                                    <MenuItem key={clase} value={clase}>
                                                        {clase}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <TextField
                                                name="numeroOT"
                                                label="Número de OT"
                                                value={formData.numeroOT}
                                                onChange={handleInputChange}
                                                fullWidth
                                                placeholder="Ej: OT123456789"
                                            />
                                            <Tooltip title="Generar número automático">
                                                <IconButton
                                                    onClick={generateOT}
                                                    color="primary"
                                                    sx={{ mt: 1 }}
                                                >
                                                    <AutoAwesome />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Estado</InputLabel>
                                            <Select
                                                name="estado"
                                                value={formData.estado}
                                                onChange={handleInputChange}
                                                label="Estado"
                                            >
                                                {opciones.estado.map((estado) => (
                                                    <MenuItem key={estado} value={estado}>
                                                        {estado}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            name="incidencia"
                                            label="Incidencia"
                                            value={formData.incidencia}
                                            onChange={handleInputChange}
                                            fullWidth
                                            placeholder="Describir la incidencia si aplica"
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* 📝 Observaciones y Agente */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <Business color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6" fontWeight="bold">
                                        Observaciones y Agente
                                    </Typography>
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            name="observaciones"
                                            label="Observaciones"
                                            value={formData.observaciones}
                                            onChange={handleInputChange}
                                            fullWidth
                                            multiline
                                            rows={3}
                                            placeholder="Detalles adicionales de la llamada..."
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            name="agente"
                                            label="Agente"
                                            value={formData.agente}
                                            onChange={handleInputChange}
                                            fullWidth
                                            required
                                            disabled
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* 🎯 Botones de acción */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                <Button
                                    variant="outlined"
                                    onClick={handleClear}
                                    startIcon={<Clear />}
                                    disabled={loading}
                                >
                                    Limpiar
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<Save />}
                                    disabled={loading}
                                    size="large"
                                >
                                    {loading ? 'Guardando...' : 'Guardar Llamada'}
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
};

export default NewCallForm;