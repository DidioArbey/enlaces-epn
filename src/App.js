// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './pages/Login/Login';

// Importar estilos
import './styles/App.scss';
import 'react-toastify/dist/ReactToastify.css';

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
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// 📄 Dashboard temporal
const DashboardPage = () => {
  const { user, logout } = useAuth();
  
  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>📊 Dashboard - Enlaces EPN</h1>
        <button 
          onClick={logout}
          style={{
            padding: '8px 16px',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Cerrar Sesión
        </button>
      </div>
      <p>¡Bienvenido, {user?.displayName || user?.email}!</p>
      <div style={{ marginTop: '20px' }}>
        <p>✅ Sistema de autenticación funcionando</p>
        <p>🔥 Firebase conectado correctamente</p>
        <p>📝 Próximo paso: Desarrollar formulario de llamadas</p>
      </div>
    </div>
  );
};

function App() {
  return (
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
                  <DashboardPage />
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
  );
}

export default App;