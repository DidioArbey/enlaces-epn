// src/pages/UserManagement/UserManagement.js - Versión unificada
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
    FormControlLabel,
    InputAdornment,
    Tooltip,
    Paper,
    TablePagination,
    FormHelperText,
    CircularProgress
} from '@mui/material';
import {
    PersonAdd,
    Visibility,
    Edit,
    Delete,
    Security,
    Group,
    AdminPanelSettings,
    Email,
    Lock,
    Person,
    Search,
    FilterList,
    Clear,
    Refresh
} from '@mui/icons-material';
import { ref, onValue, remove, update } from 'firebase/database';
import { database, dbRefs } from '../../services/firebase';
import { useAuth, ROLES, PERMISSIONS } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const UserManagement = () => {
    // Todos los hooks al inicio
    const { createUser, hasPermission, user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formMode, setFormMode] = useState('create');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [formErrors, setFormErrors] = useState({});

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        displayName: '',
        role: ROLES.AGENTE,
        department: '',
        isActive: true
    });

    // Cargar usuarios
    useEffect(() => {
        if (!hasPermission('canCreateUsers')) {
            setLoading(false);
            return;
        }

        const usersRef = ref(database, dbRefs.users);
        setLoading(true);

        const unsubscribe = onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const usersArray = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                usersArray.sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
                    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
                    return dateB - dateA;
                });
                setUsers(usersArray);
                setFilteredUsers(usersArray);
            } else {
                setUsers([]);
                setFilteredUsers([]);
            }
            setLoading(false);
        }, (error) => {
            console.error('Error al cargar usuarios:', error);
            toast.error('Error al cargar usuarios: ' + error.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [hasPermission]);

    // Filtrar usuarios
    useEffect(() => {
        let filtered = [...users];

        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.department?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (roleFilter) {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        setFilteredUsers(filtered);
        setPage(0);
    }, [users, searchTerm, roleFilter]);

    // Verificar permisos después de hooks
    if (!hasPermission('canCreateUsers')) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">
                    No tienes permisos para acceder a la gestión de usuarios.
                </Alert>
            </Box>
        );
    }

    // Funciones auxiliares
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

    const getRoleColor = (role) => {
        switch (role) {
            case ROLES.ADMIN: return 'error';
            case ROLES.COORDINADOR: return 'warning';
            case ROLES.AGENTE: return 'info';
            default: return 'default';
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case ROLES.ADMIN: return <AdminPanelSettings fontSize="small" />;
            case ROLES.COORDINADOR: return <Security fontSize="small" />;
            case ROLES.AGENTE: return <Group fontSize="small" />;
            default: return <Group fontSize="small" />;
        }
    };

    // Validación
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

        const emailExists = users.some(user =>
            user.email === formData.email &&
            (formMode === 'create' || user.id !== selectedUser?.id)
        );

        if (emailExists) {
            errors.email = 'Este email ya está registrado';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Manejadores
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

    const handleCreateUser = async () => {
        if (!validateForm()) {
            toast.error('Por favor corrige los errores en el formulario');
            return;
        }

        try {
            setSubmitLoading(true);
            await createUser(formData);
            setOpenDialog(false);
            resetForm();
            toast.success('Usuario creado exitosamente');
        } catch (error) {
            console.error('Error al crear usuario:', error);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleUpdateUser = async () => {
        if (!validateForm()) {
            toast.error('Por favor corrige los errores en el formulario');
            return;
        }

        if (!selectedUser) return;

        try {
            setSubmitLoading(true);
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
            setOpenDialog(false);
            resetForm();
            toast.success('Usuario actualizado exitosamente');
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            toast.error('Error al actualizar usuario');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (userId === currentUser?.uid) {
            toast.error('No puedes eliminar tu propia cuenta');
            return;
        }

        const confirmed = window.confirm(
            `¿Estás seguro de que deseas eliminar al usuario "${userName}"?\n\nEsta acción no se puede deshacer.`
        );

        if (confirmed) {
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

    const openUserDialog = (user, mode) => {
        setSelectedUser(user);
        setFormData({
            email: user?.email || '',
            password: '',
            confirmPassword: '',
            displayName: user?.displayName || '',
            role: user?.role || ROLES.AGENTE,
            department: user?.department || '',
            isActive: user?.isActive !== false
        });
        setFormMode(mode);
        setFormErrors({});
        setOpenDialog(true);
    };

    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            displayName: '',
            role: ROLES.AGENTE,
            department: '',
            isActive: true
        });
        setSelectedUser(null);
        setFormMode('create');
        setFormErrors({});
    };

    const clearFilters = () => {
        setSearchTerm('');
        setRoleFilter('');
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedUsers = filteredUsers.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                        Gestión de Usuarios
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Administra los usuarios del sistema y sus permisos
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={() => window.location.reload()}
                        disabled={loading}
                    >
                        Actualizar
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<PersonAdd />}
                        onClick={() => {
                            resetForm();
                            setOpenDialog(true);
                        }}
                        size="large"
                        disabled={submitLoading}
                    >
                        Crear Usuario
                    </Button>
                </Box>
            </Box>

            {/* Loading */}
            {loading && (
                <Box sx={{ mb: 3 }}>
                    <Alert severity="info" icon={<CircularProgress size={20} />}>
                        Cargando usuarios...
                    </Alert>
                </Box>
            )}

            {/* Estadísticas */}
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

            {/* Filtros */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <FilterList color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" fontWeight="bold">
                            Filtros
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
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Buscar usuarios"
                                placeholder="Nombre, email o departamento..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search color="action" />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Filtrar por rol</InputLabel>
                                <Select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    label="Filtrar por rol"
                                >
                                    <MenuItem value="">Todos los roles</MenuItem>
                                    <MenuItem value={ROLES.ADMIN}>Administrador</MenuItem>
                                    <MenuItem value={ROLES.COORDINADOR}>Coordinador</MenuItem>
                                    <MenuItem value={ROLES.AGENTE}>Agente</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Mensaje si no hay usuarios */}
            {!loading && users.length === 0 && (
                <Card sx={{ mb: 3 }}>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                        <Group sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No hay usuarios registrados
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Crea el primer usuario para comenzar
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<PersonAdd />}
                            onClick={() => {
                                resetForm();
                                setOpenDialog(true);
                            }}
                        >
                            Crear Primer Usuario
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Tabla */}
            {users.length > 0 && (
                <Card>
                    <CardContent sx={{ p: 0 }}>
                        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                            <Typography variant="h6" fontWeight="bold">
                                Lista de Usuarios ({filteredUsers.length})
                            </Typography>
                        </Box>

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
                                    {paginatedUsers.map((user) => (
                                        <TableRow key={user.id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {getRoleIcon(user.role)}
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {user.displayName || 'Sin nombre'}
                                                        </Typography>
                                                        {user.id === currentUser?.uid && (
                                                            <Chip label="Tú" size="small" color="info" variant="outlined" />
                                                        )}
                                                    </Box>
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
                                                <Tooltip title="Ver detalles">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => openUserDialog(user, 'view')}
                                                        color="primary"
                                                    >
                                                        <Visibility fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Editar">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => openUserDialog(user, 'edit')}
                                                        color="warning"
                                                    >
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                {user.id !== currentUser?.uid && (
                                                    <Tooltip title="Eliminar">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDeleteUser(user.id, user.displayName)}
                                                            color="error"
                                                        >
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            component="div"
                            count={filteredUsers.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Filas por página:"
                            labelDisplayedRows={({ from, to, count }) =>
                                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                            }
                        />
                    </CardContent>
                </Card>
            )}

            {/* Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => !submitLoading && setOpenDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
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
                                    <MenuItem value=""><em>Sin departamento</em></MenuItem>
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
                                            disabled={formMode === 'view' || submitLoading}
                                            color="success"
                                        />
                                    }
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {!formData.isActive && (
                                                <Chip label="Desactivado" color="error" size="small" />
                                            )}
                                        </Box>
                                    }
                                />
                            </Grid>
                        )}
                    </Grid>

                    {/* Permisos del rol */}
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
                        onClick={() => setOpenDialog(false)} 
                        color="inherit"
                        disabled={submitLoading}
                    >
                        Cancelar
                    </Button>
                    {formMode === 'create' && (
                        <Button
                            onClick={handleCreateUser}
                            variant="contained"
                            disabled={submitLoading}
                            startIcon={submitLoading ? <CircularProgress size={20} /> : <PersonAdd />}
                        >
                            {submitLoading ? 'Creando...' : 'Crear Usuario'}
                        </Button>
                    )}
                    {formMode === 'edit' && (
                        <Button
                            onClick={handleUpdateUser}
                            variant="contained"
                            disabled={submitLoading}
                            startIcon={submitLoading ? <CircularProgress size={20} /> : <Edit />}
                        >
                            {submitLoading ? 'Actualizando...' : 'Actualizar'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserManagement;