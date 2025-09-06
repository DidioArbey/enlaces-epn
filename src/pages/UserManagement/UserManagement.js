// src/pages/UserManagement/UserManagement.js
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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Switch,
    FormControlLabel
} from '@mui/material';
import {
    PersonAdd,
    Visibility,
    Edit,
    Delete,
    Security,
    Group,
    AdminPanelSettings
} from '@mui/icons-material';
import { ref, onValue, remove, update } from 'firebase/database';
import { database, dbRefs } from '../../services/firebase';
import { useAuth, ROLES, PERMISSIONS } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const UserManagement = () => {
    const { createUser, hasPermission, user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formMode, setFormMode] = useState('create'); // 'create' | 'view' | 'edit'

    // Estados del formulario
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        displayName: '',
        role: ROLES.AGENTE,
        department: '',
        isActive: true
    });

    // Verificar permisos
    if (!hasPermission('canCreateUsers')) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">
                    No tienes permisos para acceder a la gestión de usuarios.
                </Alert>
            </Box>
        );
    }

    // Cargar usuarios
    useEffect(() => {
        const usersRef = ref(database, dbRefs.users);

        const unsubscribe = onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const usersArray = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                setUsers(usersArray);
            } else {
                setUsers([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Manejar cambios en el formulario
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Crear nuevo usuario
    const handleCreateUser = async () => {
        if (!formData.email || !formData.password || !formData.displayName) {
            toast.error('Por favor completa todos los campos obligatorios');
            return;
        }

        try {
            await createUser(formData);
            setOpenDialog(false);
            resetForm();
            toast.success('Usuario creado exitosamente');
        } catch (error) {
            // El error ya se maneja en el hook
        }
    };

    // Ver detalles del usuario
    const handleViewUser = (user) => {
        setSelectedUser(user);
        setFormData({
            email: user.email,
            password: '',
            displayName: user.displayName,
            role: user.role,
            department: user.department || '',
            isActive: user.isActive !== false
        });
        setFormMode('view');
        setOpenDialog(true);
    };

    // Editar usuario
    const handleEditUser = (user) => {
        setSelectedUser(user);
        setFormData({
            email: user.email,
            password: '',
            displayName: user.displayName,
            role: user.role,
            department: user.department || '',
            isActive: user.isActive !== false
        });
        setFormMode('edit');
        setOpenDialog(true);
    };

    // Actualizar usuario
    const handleUpdateUser = async () => {
        if (!selectedUser) return;

        try {
            const userRef = ref(database, `${dbRefs.users}/${selectedUser.id}`);
            const updateData = {
                displayName: formData.displayName,
                role: formData.role,
                department: formData.department,
                isActive: formData.isActive,
                updatedAt: new Date().toISOString(),
                updatedBy: currentUser?.uid
            };

            await update(userRef, updateData);
            setOpenDialog(false);
            resetForm();
            toast.success('Usuario actualizado exitosamente');
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            toast.error('Error al actualizar usuario');
        }
    };

    // Eliminar usuario
    const handleDeleteUser = async (userId) => {
        if (userId === currentUser?.uid) {
            toast.error('No puedes eliminar tu propia cuenta');
            return;
        }

        if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            try {
                const userRef = ref(database, `${dbRefs.users}/${userId}`);
                await remove(userRef);
                toast.success('Usuario eliminado exitosamente');
            } catch (error) {
                console.error('Error al eliminar usuario:', error);
                toast.error('Error al eliminar usuario');
            }
        }
    };

    // Resetear formulario
    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            displayName: '',
            role: ROLES.AGENTE,
            department: '',
            isActive: true
        });
        setSelectedUser(null);
        setFormMode('create');
    };

    // Obtener color del chip por rol
    const getRoleColor = (role) => {
        switch (role) {
            case ROLES.ADMIN:
                return 'error';
            case ROLES.COORDINADOR:
                return 'warning';
            case ROLES.AGENTE:
                return 'info';
            default:
                return 'default';
        }
    };

    // Obtener icono por rol
    const getRoleIcon = (role) => {
        switch (role) {
            case ROLES.ADMIN:
                return <AdminPanelSettings fontSize="small" />;
            case ROLES.COORDINADOR:
                return <Security fontSize="small" />;
            case ROLES.AGENTE:
                return <Group fontSize="small" />;
            default:
                return <Group fontSize="small" />;
        }
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                        👥 Gestión de Usuarios
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Administra los usuarios del sistema y sus permisos
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<PersonAdd />}
                    onClick={() => {
                        resetForm();
                        setOpenDialog(true);
                    }}
                >
                    Crear Usuario
                </Button>
            </Box>

            {/* Estadísticas rápidas */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" color="primary" fontWeight="bold">
                                {users.length}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                Total Usuarios
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" color="error" fontWeight="bold">
                                {users.filter(u => u.role === ROLES.ADMIN).length}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                Administradores
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" color="warning.main" fontWeight="bold">
                                {users.filter(u => u.role === ROLES.COORDINADOR).length}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                Coordinadores
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" color="info.main" fontWeight="bold">
                                {users.filter(u => u.role === ROLES.AGENTE).length}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                Agentes
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabla de usuarios */}
            <Card>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Lista de Usuarios
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Usuario</strong></TableCell>
                                    <TableCell><strong>Email</strong></TableCell>
                                    <TableCell><strong>Rol</strong></TableCell>
                                    <TableCell><strong>Departamento</strong></TableCell>
                                    <TableCell><strong>Estado</strong></TableCell>
                                    <TableCell><strong>Creado</strong></TableCell>
                                    <TableCell><strong>Acciones</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {getRoleIcon(user.role)}
                                                <Typography variant="body2" fontWeight="medium">
                                                    {user.displayName}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={PERMISSIONS[user.role]?.label || user.role}
                                                color={getRoleColor(user.role)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{user.department || '-'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.isActive !== false ? 'Activo' : 'Inactivo'}
                                                color={user.isActive !== false ? 'success' : 'error'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {user.createdAt ?
                                                format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: es }) :
                                                '-'
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleViewUser(user)}
                                                color="primary"
                                            >
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEditUser(user)}
                                                color="warning"
                                            >
                                                <Edit fontSize="small" />
                                            </IconButton>
                                            {user.id !== currentUser?.uid && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    color="error"
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Dialog para crear/editar/ver usuario */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {formMode === 'create' ? 'Crear Nuevo Usuario' :
                        formMode === 'edit' ? 'Editar Usuario' : 'Detalles del Usuario'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Nombre Completo"
                                name="displayName"
                                value={formData.displayName}
                                onChange={handleInputChange}
                                required
                                disabled={formMode === 'view'}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                disabled={formMode !== 'create'}
                            />
                        </Grid>
                        {formMode === 'create' && (
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Contraseña"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                        )}
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Rol</InputLabel>
                                <Select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    label="Rol"
                                    disabled={formMode === 'view'}
                                >
                                    <MenuItem value={ROLES.AGENTE}>
                                        {PERMISSIONS[ROLES.AGENTE].label}
                                    </MenuItem>
                                    <MenuItem value={ROLES.COORDINADOR}>
                                        {PERMISSIONS[ROLES.COORDINADOR].label}
                                    </MenuItem>
                                    <MenuItem value={ROLES.ADMIN}>
                                        {PERMISSIONS[ROLES.ADMIN].label}
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Departamento</InputLabel>
                                <Select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    label="Departamento"
                                    disabled={formMode === 'view'}
                                >
                                    <MenuItem value="">Sin departamento</MenuItem>
                                    <MenuItem value="atencion-cliente">Atención al Cliente</MenuItem>
                                    <MenuItem value="acueducto">Acueducto</MenuItem>
                                    <MenuItem value="energia">Energía</MenuItem>
                                    <MenuItem value="administracion">Administración</MenuItem>
                                    <MenuItem value="tecnico">Técnico</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        {formMode !== 'create' && (
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                            disabled={formMode === 'view'}
                                        />
                                    }
                                    label="Usuario Activo"
                                />
                            </Grid>
                        )}
                    </Grid>

                    {/* Mostrar permisos del rol seleccionado */}
                    {formData.role && (
                        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                Permisos del rol: {PERMISSIONS[formData.role]?.label}
                            </Typography>
                            <Grid container spacing={1}>
                                {Object.entries(PERMISSIONS[formData.role] || {}).map(([key, value]) => {
                                    if (key === 'label') return null;
                                    return (
                                        <Grid item xs={6} key={key}>
                                            <Chip
                                                label={getPermissionLabel(key)}
                                                color={value ? 'success' : 'default'}
                                                variant={value ? 'filled' : 'outlined'}
                                                size="small"
                                            />
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>
                        Cancelar
                    </Button>
                    {formMode === 'create' && (
                        <Button onClick={handleCreateUser} variant="contained">
                            Crear Usuario
                        </Button>
                    )}
                    {formMode === 'edit' && (
                        <Button onClick={handleUpdateUser} variant="contained">
                            Actualizar
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );

    // Función auxiliar para etiquetas de permisos
    function getPermissionLabel(permission) {
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
    }
};

export default UserManagement;