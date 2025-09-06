// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import NewCallForm from './pages/NewCall/NewCallForm';

// Importar estilos
import './styles/App.scss';
import 'react-toastify/dist/ReactToastify.css';

// 🎨 Tema personalizado de Material-UI
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

// 🛡️ Componente para rutas protegidas
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

// 📄 Páginas temporales
const NewCallPage = () => <NewCallForm />;

const CallsPage = () => (
  <div>
    <h1>📋 Ver Llamadas</h1>
    <p>DataTable con todas las llamadas (próximamente)</p>
  </div>
);

const ReportsPage = () => (
  <div>
    <h1>📊 Reportes</h1>
    <p>Generación de reportes (próximamente)</p>
  </div>
);

const SettingsPage = () => (
  <div>
    <h1>⚙️ Configuración</h1>
    <p>Configuración del sistema (próximamente)</p>
  </div>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* 🔐 Ruta de login */}
              <Route path="/login" element={<Login />} />
              
              {/* 🛡️ Rutas protegidas */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
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
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* 🏠 Redirección por defecto */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>

            {/* 🔔 Contenedor de notificaciones */}
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