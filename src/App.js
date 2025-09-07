// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Alert, Box } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import NewCallForm from './pages/NewCall/NewCallForm';
import CallsTable from './pages/Calls/CallsTable';
import Reports from './pages/Reports/Reports';
import UserManagement from './pages/UserManagement/UserManagement'; // ← AGREGAR ESTA LÍNEA

// Importar estilos
import './styles/App.scss';
import 'react-toastify/dist/ReactToastify.css';

// Tema personalizado de Material-UI
const theme = createTheme({
  palette: {
    primary: {
      main: '#1e40af', // Azul EPN
    },
    secondary: {
      main: '#059669', // Verde EPN
    },
    background: {
      default: '#f9fafb',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }
  
  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
};

// Componente para rutas protegidas con permisos específicos
const PermissionProtectedRoute = ({ children, permission }) => {
  const { hasPermission, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }
  
  if (!hasPermission(permission)) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          No tienes permisos para acceder a esta sección.
        </Alert>
      </Box>
    );
  }
  
  return children;
};

// Páginas de la aplicación
const DashboardPage = () => (
  <PermissionProtectedRoute permission="canViewDashboard">
    <Dashboard />
  </PermissionProtectedRoute>
);

const NewCallPage = () => (
  <PermissionProtectedRoute permission="canFillForms">
    <NewCallForm />
  </PermissionProtectedRoute>
);

const CallsPage = () => (
  <PermissionProtectedRoute permission="canViewCalls">
    <CallsTable />
  </PermissionProtectedRoute>
);

const ReportsPage = () => (
  <PermissionProtectedRoute permission="canViewReports">
    <Reports />
  </PermissionProtectedRoute>
);

const UserManagementPage = () => (  // ← AGREGAR ESTA FUNCIÓN
  <PermissionProtectedRoute permission="canCreateUsers">
    <UserManagement />
  </PermissionProtectedRoute>
);

const SettingsPage = () => (
  <PermissionProtectedRoute permission="canManageSettings">
    <div>
      <h1>⚙️ Configuración</h1>
      <p>Configuración del sistema (próximamente)</p>
    </div>
  </PermissionProtectedRoute>
);

// Página de redirección inteligente según rol
const SmartRedirect = () => {
  const { hasPermission, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }
  
  // Redirigir según permisos
  if (hasPermission('canViewDashboard')) {
    return <Navigate to="/dashboard" replace />;
  } else if (hasPermission('canFillForms')) {
    return <Navigate to="/new-call" replace />;
  } else if (hasPermission('canViewCalls')) {
    return <Navigate to="/calls" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Ruta de login */}
              <Route path="/login" element={<Login />} />
              
              {/* Rutas protegidas */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/new-call" 
                element={
                  <ProtectedRoute>
                    <NewCallPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/calls" 
                element={
                  <ProtectedRoute>
                    <CallsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reports" 
                element={
                  <ProtectedRoute>
                    <ReportsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/user-management" 
                element={
                  <ProtectedRoute>
                    <UserManagementPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirección inteligente por defecto */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <SmartRedirect />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Contenedor de notificaciones */}
            <ToastContainer
              position="top-right"
              autoClose={4000}
              hideProgressBar={false}
              closeOnClick
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;