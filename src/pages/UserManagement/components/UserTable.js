// src/pages/UserManagement/components/UserTable.js
import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tooltip,
    Box,
    TablePagination,
    Alert,
    CircularProgress,
    Button
} from '@mui/material';
import {
    Visibility,
    Edit,
    Delete,
    Security,
    Group,
    AdminPanelSettings,
    PersonAdd
} from '@mui/icons-material';
import { ref, remove } from 'firebase/database';
import { database, dbRefs } from '../../../services/firebase';
import { ROLES, PERMISSIONS } from '../../../hooks/useAuth';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const UserTable = ({ 
    users, 
    filteredUsers, 
    loading, 
    currentUser, 
    onOpenDialog, 
    onCreateUser 
}) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDeleteUser = async (userId, userName) => {
        if (userId === currentUser?.uid) {
            toast.error('No puedes eliminar tu propia cuenta');
            return;
        }

        const confirmed = window.confirm(
            `¿Estás seguro de que deseas eliminar al usuario "${userName}"?\n\nEsta acción no se puede deshacer y eliminará todos los datos asociados al usuario.`
        );

        if (confirmed) {
            try {
                setDeleteLoading(true);
                const userRef = ref(database, `${dbRefs.users}/${userId}`);
                await remove(userRef);
                toast.success('Usuario eliminado exitosamente');
            } catch (error) {
                console.error('Error al eliminar usuario:', error);
                toast.error('Error al eliminar usuario: ' + (error.message || 'Error desconocido'));
            } finally {
                setDeleteLoading(false);
            }
        }
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

    const paginatedUsers = filteredUsers.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    // Mostrar indicador de carga
    if (loading) {
        return (
            <Box sx={{ mb: 3 }}>
                <Alert severity="info" icon={<CircularProgress size={20} />}>
                    Cargando usuarios...
                </Alert>
            </Box>
        );
    }

    // Mostrar mensaje si no hay usuarios
    if (users.length === 0) {
        return (
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
                        onClick={onCreateUser}
                    >
                        Crear Primer Usuario
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
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
                                                    <Chip 
                                                        label="Tú" 
                                                        size="small" 
                                                        color="info" 
                                                        variant="outlined" 
                                                    />
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
                                                onClick={() => onOpenDialog(user, 'view')}
                                                color="primary"
                                            >
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Editar">
                                            <IconButton
                                                size="small"
                                                onClick={() => onOpenDialog(user, 'edit')}
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
                                                    disabled={deleteLoading}
                                                >
                                                    {deleteLoading ? 
                                                        <CircularProgress size={16} /> : 
                                                        <Delete fontSize="small" />
                                                    }
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
    );
};

export default UserTable;