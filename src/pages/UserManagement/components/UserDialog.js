// src/pages/UserManagement/components/UserDialog.js
import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Switch,
    FormControlLabel,
    InputAdornment,
    FormHelperText,
    Paper,
    Typography,
    Box,
    Chip,
    CircularProgress
} from '@mui/material';
import {
    PersonAdd,
    Edit,
    Visibility,
    Email,
    Lock,
    Person,
    Group,
    Security,
    AdminPanelSettings
} from '@mui/icons-material';
import { ref, update } from 'firebase/database';
import { database, dbRefs } from '../../../services/firebase';
import { ROLES, PERMISSIONS } from '../../../hooks/useAuth';
import { toast } from 'react-toastify';

const UserDialog = ({
    open,
    onClose,
    formMode,
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    submitLoading,
    onCreateUser,
    selectedUser,
    currentUser
}) => {
    // Validar formulario
    const validateForm = () => {
        const errors = {};

        if (!formData.displayName.trim()) {
            errors.displayName = 'El nombre es requerido';
        } else if (formData.displayName.trim().length < 2) {
            errors.displayName = 'El nombre debe tener al menos 2 caracteres';
        }

        if (!formData.email.trim()) {
            errors.email = 'El email es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Email inválido';
        }

        if (formMode === 'create') {
            if (!formData.password) {
                errors.password = 'La contraseña es requerida';
            } else if (formData.password.length < 6) {
                errors.password = 'La contraseña debe tener al menos 6 caracteres';
            }

            if (!formData.confirmPassword) {
                errors.confirmPassword = 'Confirma la contraseña';
            } else if (formData.password !== formData.confirmPassword) {
                errors.confirmPassword = 'Las contraseñas no coinciden';
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Manejar cambios en el formulario
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));

        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Actualizar usuario
    const handleUpdateUser = async () => {
        if (!validateForm()) {
            toast.error('Por favor corrige los errores en el formulario');
            return;
        }

        if (!selectedUser) return;

        try {
            const userRef = ref(database, `${dbRefs.users}/${selectedUser.id}`);
            const updateData = {
                displayName: formData.displayName.trim(),
                role: formData.role,
                department: formData.department,
                isActive: formData.isActive,
                updatedAt: new Date().toISOString(),
                updatedBy: currentUser?.uid
            };

            await update(userRef, updateData);
            onClose();
            toast.success('Usuario actualizado exitosamente');
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            toast.error('Error al actualizar usuario: ' + (error.message || 'Error desconocido'));
        }
    };

    // Función auxiliar para etiquetas de permisos
    const getPermissionLabel = (permission) => {
        const labels = {
            canCreateUsers: 'Crear Usuarios',
            canViewDashboard: 'Ver Dashboard',
            canViewReports: 'Ver Reportes',
            canFillForms: 'Llenar Formularios',
            canViewCalls: 'Ver Llamadas',
            canManageSettings: 'Gestionar Configuración',
            canDeleteCalls: 'Eliminar Llamadas'
        };
        return labels[permission] || permission;
    };

    const handleSubmit = () => {
        if (formMode === 'create') {
            onCreateUser();
        } else if (formMode === 'edit') {
            handleUpdateUser();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={() => !submitLoading && onClose()}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {formMode === 'create' ? <PersonAdd color="primary" /> :
                        formMode === 'edit' ? <Edit color="warning" /> : <Visibility color="info" />}
                    <Typography variant="h6">
                        {formMode === 'create' ? 'Crear Nuevo Usuario' :
                            formMode === 'edit' ? 'Editar Usuario' : 'Detalles del Usuario'}
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Grid container spacing={3} sx={{ mt: 0.5 }}>
                    {/* Nombre completo */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Nombre Completo"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleInputChange}
                            required
                            disabled={formMode === 'view' || submitLoading}
                            error={!!formErrors.displayName}
                            helperText={formErrors.displayName}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person color="action" />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>

                    {/* Email */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            disabled={formMode !== 'create' || submitLoading}
                            error={!!formErrors.email}
                            helperText={formErrors.email}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email color="action" />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>

                    {/* Contraseña (solo en creación) */}
                    {formMode === 'create' && (
                        <>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Contraseña"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    disabled={submitLoading}
                                    error={!!formErrors.password}
                                    helperText={formErrors.password}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock color="action" />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Confirmar Contraseña"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    required
                                    disabled={submitLoading}
                                    error={!!formErrors.confirmPassword}
                                    helperText={formErrors.confirmPassword}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock color="action" />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>
                        </>
                    )}

                    {/* Rol */}
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth error={!!formErrors.role}>
                            <InputLabel>Rol del Usuario</InputLabel>
                            <Select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                label="Rol del Usuario"
                                disabled={formMode === 'view' || submitLoading}
                            >
                                <MenuItem value={ROLES.AGENTE}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Group fontSize="small" />
                                        {PERMISSIONS[ROLES.AGENTE].label}
                                    </Box>
                                </MenuItem>
                                <MenuItem value={ROLES.COORDINADOR}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Security fontSize="small" />
                                        {PERMISSIONS[ROLES.COORDINADOR].label}
                                    </Box>
                                </MenuItem>
                                <MenuItem value={ROLES.ADMIN}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AdminPanelSettings fontSize="small" />
                                        {PERMISSIONS[ROLES.ADMIN].label}
                                    </Box>
                                </MenuItem>
                            </Select>
                            {formErrors.role && <FormHelperText>{formErrors.role}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    {/* Departamento */}
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Departamento</InputLabel>
                            <Select
                                name="department"
                                value={formData.department}
                                onChange={handleInputChange}
                                label="Departamento"
                                disabled={formMode === 'view' || submitLoading}
                            >
                                <MenuItem value="">
                                    <em>Sin departamento</em>
                                </MenuItem>
                                <MenuItem value="atencion-cliente">Atención al Cliente</MenuItem>
                                <MenuItem value="acueducto">Acueducto</MenuItem>
                                <MenuItem value="energia">Energía</MenuItem>
                                <MenuItem value="administracion">Administración</MenuItem>
                                <MenuItem value="tecnico">Técnico</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Estado del usuario (solo en edición) */}
                    {formMode !== 'create' && (
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                        disabled={formMode === 'view' || submitLoading}
                                        color="success"
                                    />
                                }
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography>Usuario Activo</Typography>
                                        {!formData.isActive && (
                                            <Chip label="Desactivado" color="error" size="small" />
                                        )}
                                    </Box>
                                }
                            />
                        </Grid>
                    )}
                </Grid>

                {/* Mostrar permisos del rol seleccionado */}
                {formData.role && (
                    <Paper sx={{ mt: 3, p: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            Permisos del rol: {PERMISSIONS[formData.role]?.label}
                        </Typography>
                        <Grid container spacing={1}>
                            {Object.entries(PERMISSIONS[formData.role] || {}).map(([key, value]) => {
                                if (key === 'label') return null;
                                return (
                                    <Grid item xs={12} sm={6} key={key}>
                                        <Chip
                                            label={getPermissionLabel(key)}
                                            color={value ? 'success' : 'default'}
                                            variant={value ? 'filled' : 'outlined'}
                                            size="small"
                                            sx={{ mb: 0.5 }}
                                        />
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Paper>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2.5, pt: 1 }}>
                <Button 
                    onClick={onClose} 
                    color="inherit"
                    disabled={submitLoading}
                >
                    Cancelar
                </Button>
                {formMode !== 'view' && (
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={submitLoading}
                        startIcon={submitLoading ? <CircularProgress size={20} /> : 
                            formMode === 'create' ? <PersonAdd /> : <Edit />}
                    >
                        {submitLoading ? 
                            (formMode === 'create' ? 'Creando...' : 'Actualizando...') :
                            (formMode === 'create' ? 'Crear Usuario' : 'Actualizar')
                        }
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default UserDialog;