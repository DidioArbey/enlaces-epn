// src/components/layout/Layout.js
import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Box,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    useTheme,
    useMediaQuery,
    Badge,
    Tooltip
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard,
    Add,
    TableView,
    Assessment,
    AccountCircle,
    Logout,
    Settings,
    Notifications,
    Business,
    Group,
    AdminPanelSettings,
    Security
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const drawerWidth = 260;

const Layout = ({ children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, hasPermission, getUserPermissions, isRole, ROLES } = useAuth();

    // Configurar elementos del menú según permisos
    const getMenuItems = () => {
        const items = [];

        // Dashboard - Solo admin y coordinador
        if (hasPermission('canViewDashboard')) {
            items.push({
                text: 'Dashboard',
                icon: <Dashboard />,
                path: '/dashboard',
                description: 'Panel principal con métricas'
            });
        }

        // Nueva Llamada - Todos pueden llenar formularios
        if (hasPermission('canFillForms')) {
            items.push({
                text: 'Nueva Llamada',
                icon: <Add />,
                path: '/new-call',
                description: 'Registrar nueva llamada'
            });
        }

        // Ver Llamadas - Todos pueden ver llamadas
        if (hasPermission('canViewCalls')) {
            items.push({
                text: 'Ver Llamadas',
                icon: <TableView />,
                path: '/calls',
                description: 'Lista de todas las llamadas'
            });
        }

        // Reportes - Solo admin y coordinador
        if (hasPermission('canViewReports')) {
            items.push({
                text: 'Reportes',
                icon: <Assessment />,
                path: '/reports',
                description: 'Generar y descargar reportes'
            });
        }

        // Gestión de Usuarios - Solo admin
        if (hasPermission('canCreateUsers')) {
            items.push({
                text: 'Usuarios',
                icon: <Group />,
                path: '/user-management',
                description: 'Gestionar usuarios del sistema'
            });
        }

        // Configuración - Solo admin
        if (hasPermission('canManageSettings')) {
            items.push({
                text: 'Configuración',
                icon: <Settings />,
                path: '/settings',
                description: 'Configuración del sistema'
            });
        }

        return items;
    };

    const menuItems = getMenuItems();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        handleProfileMenuClose();
        await logout();
        navigate('/login');
    };

    const handleNavigation = (path) => {
        navigate(path);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const getUserRole = () => {
        const permissions = getUserPermissions();
        return permissions?.label || 'Usuario';
    };

    const getRoleIcon = () => {
        if (isRole(ROLES.ADMIN)) return <AdminPanelSettings sx={{ fontSize: 20 }} />;
        if (isRole(ROLES.COORDINADOR)) return <Security sx={{ fontSize: 20 }} />;
        return <AccountCircle sx={{ fontSize: 20 }} />;
    };

    const getRoleColor = () => {
        if (isRole(ROLES.ADMIN)) return 'error.main';
        if (isRole(ROLES.COORDINADOR)) return 'warning.main';
        return 'info.main';
    };

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header del Drawer */}
            <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Business sx={{ mr: 1, fontSize: 32 }} />
                    <Typography variant="h6" fontWeight="bold">
                        Enlaces EPN
                    </Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Sistema de Gestión de Llamadas
                </Typography>
            </Box>

            <Divider />

            {/* Menu Items - Solo mostrar los permitidos */}
            <List sx={{ flex: 1, px: 1, py: 2 }}>
                {menuItems.map((item) => (
                    <Tooltip key={item.text} title={item.description} placement="right">
                        <ListItem disablePadding sx={{ mb: 1 }}>
                            <ListItemButton
                                selected={location.pathname === item.path}
                                onClick={() => handleNavigation(item.path)}
                                sx={{
                                    borderRadius: 2,
                                    mx: 1,
                                    '&.Mui-selected': {
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'primary.dark',
                                        },
                                        '& .MuiListItemIcon-root': {
                                            color: 'white',
                                        },
                                    },
                                    '&:hover': {
                                        backgroundColor: 'action.hover',
                                    },
                                }}
                            >
                                <ListItemIcon>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontSize: '0.9rem',
                                        fontWeight: location.pathname === item.path ? 600 : 400
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    </Tooltip>
                ))}
            </List>

            {/* User Info con rol */}
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {getRoleIcon()}
                    <Box sx={{ ml: 1, flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                            Conectado como:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium" noWrap>
                            {user?.displayName || user?.email}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                color: getRoleColor(),
                                fontWeight: 'bold'
                            }}
                        >
                            {getUserRole()}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* App Bar */}
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    bgcolor: 'white',
                    color: 'text.primary',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'primary.main', fontWeight: 600 }}>
                        Sistema de Gestión de Llamadas
                    </Typography>

                    {/* Notificaciones - Solo para admin y coordinador */}
                    {(isRole(ROLES.ADMIN) || isRole(ROLES.COORDINADOR)) && (
                        <IconButton color="inherit" sx={{ mr: 1 }}>
                            <Badge badgeContent={3} color="error">
                                <Notifications />
                            </Badge>
                        </IconButton>
                    )}

                    {/* Profile Menu */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
                            <Typography variant="body2" color="text.primary" fontWeight="medium">
                                {user?.displayName || 'Usuario'}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{ color: getRoleColor(), fontWeight: 'bold' }}
                            >
                                {getUserRole()}
                            </Typography>
                        </Box>
                        <IconButton
                            size="large"
                            aria-label="account menu"
                            aria-controls="profile-menu"
                            aria-haspopup="true"
                            onClick={handleProfileMenuOpen}
                            color="inherit"
                        >
                            <Avatar
                                sx={{
                                    width: 36,
                                    height: 36,
                                    bgcolor: getRoleColor(),
                                    fontSize: '1rem'
                                }}
                            >
                                {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                            </Avatar>
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Profile Menu */}
            <Menu
                id="profile-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                onClick={handleProfileMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                sx={{
                    '& .MuiPaper-root': {
                        minWidth: 200,
                        mt: 1
                    }
                }}
            >
                <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle2" color="text.primary">
                        {user?.displayName || user?.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {user?.email}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            display: 'block',
                            color: getRoleColor(),
                            fontWeight: 'bold'
                        }}
                    >
                        {getUserRole()}
                    </Typography>
                </Box>

                <MenuItem onClick={handleProfileMenuClose}>
                    <ListItemIcon>
                        <AccountCircle fontSize="small" />
                    </ListItemIcon>
                    Mi Perfil
                </MenuItem>

                {hasPermission('canManageSettings') && (
                    <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/settings'); }}>
                        <ListItemIcon>
                            <Settings fontSize="small" />
                        </ListItemIcon>
                        Configuración
                    </MenuItem>
                )}

                <Divider />

                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <ListItemIcon>
                        <Logout fontSize="small" color="error" />
                    </ListItemIcon>
                    Cerrar Sesión
                </MenuItem>
            </Menu>

            {/* Navigation Drawer */}
            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            >
                {/* Mobile drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        },
                    }}
                >
                    {drawer}
                </Drawer>

                {/* Desktop drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            border: 'none',
                            borderRight: '1px solid',
                            borderColor: 'divider'
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    bgcolor: 'grey.50',
                    minHeight: '100vh',
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                }}
            >
                <Toolbar /> {/* Spacer for AppBar */}
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default Layout;