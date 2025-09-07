// src/hooks/useAuth.js - Versión mejorada
import { useState, useEffect, createContext, useContext } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, database, dbRefs } from '../services/firebase';
import { toast } from 'react-toastify';

// 🔐 Contexto de autenticación
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// 🎯 Definir roles del sistema
export const ROLES = {
  ADMIN: 'admin',
  COORDINADOR: 'coordinador',
  AGENTE: 'agente'
};

// 📋 Permisos por rol
export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    canCreateUsers: true,
    canViewDashboard: true,
    canViewReports: true,
    canFillForms: true,
    canViewCalls: true,
    canManageSettings: true,
    canDeleteCalls: true,
    label: 'Administrador'
  },
  [ROLES.COORDINADOR]: {
    canCreateUsers: false,
    canViewDashboard: true,
    canViewReports: true,
    canFillForms: true,
    canViewCalls: true,
    canManageSettings: false,
    canDeleteCalls: false,
    label: 'Coordinador'
  },
  [ROLES.AGENTE]: {
    canCreateUsers: false,
    canViewDashboard: false,
    canViewReports: false,
    canFillForms: true,
    canViewCalls: true,
    canManageSettings: false,
    canDeleteCalls: false,
    label: 'Agente'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 👂 Escuchar cambios de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = ref(database, `${dbRefs.users}/${user.uid}`);
          const snapshot = await get(userRef);
          const userData = snapshot.val();

          setUser({
            ...user,
            profile: userData || { role: ROLES.AGENTE }
          });
        } catch (error) {
          console.error('Error al obtener perfil:', error);
          setUser({
            ...user,
            profile: { role: ROLES.AGENTE }
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔑 Función para iniciar sesión (solo login, sin registro)
  const login = async (email, password) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Verificar si el usuario existe en la base de datos
      const userRef = ref(database, `${dbRefs.users}/${userCredential.user.uid}`);
      const snapshot = await get(userRef);

      if (!snapshot.val()) {
        // Si no existe en la DB, cerrar sesión y mostrar error
        await signOut(auth);
        toast.error('Usuario no autorizado. Contacta al administrador.');
        throw new Error('Usuario no autorizado');
      }

      toast.success('¡Bienvenido a Enlaces EPN!');
      return userCredential.user;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);

      let message = 'Error al iniciar sesión';
      switch (error.code) {
        case 'auth/user-not-found':
          message = 'Usuario no encontrado';
          break;
        case 'auth/wrong-password':
          message = 'Contraseña incorrecta';
          break;
        case 'auth/invalid-email':
          message = 'Email inválido';
          break;
        case 'auth/too-many-requests':
          message = 'Demasiados intentos. Intenta más tarde';
          break;
        case 'auth/user-disabled':
          message = 'Esta cuenta ha sido deshabilitada';
          break;
        default:
          message = error.message === 'Usuario no autorizado' ?
            'Usuario no autorizado. Contacta al administrador.' :
            'Error de conexión. Intenta nuevamente';
      }

      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 👥 Función para crear usuario (solo administradores) - MEJORADA
  const createUser = async (userData) => {
    try {
      if (!hasPermission('canCreateUsers')) {
        throw new Error('Sin permisos para crear usuarios');
      }

      console.log('Iniciando creación de usuario...', { email: userData.email, role: userData.role });

      // Validaciones adicionales
      if (!userData.email || !userData.password || !userData.displayName) {
        throw new Error('Faltan datos obligatorios');
      }

      if (userData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email.trim(),
        userData.password
      );

      const newUser = userCredential.user;
      console.log('Usuario creado en Firebase Auth:', newUser.uid);

      // Actualizar perfil
      if (userData.displayName) {
        await updateProfile(newUser, {
          displayName: userData.displayName.trim()
        });
        console.log('Perfil actualizado en Firebase Auth');
      }

      // Guardar en Realtime Database
      const userProfile = {
        email: newUser.email,
        displayName: userData.displayName?.trim() || '',
        role: userData.role || ROLES.AGENTE,
        department: userData.department || '',
        createdAt: new Date().toISOString(),
        createdBy: user?.uid || 'system',
        isActive: true,
        lastLogin: null,
        updatedAt: new Date().toISOString()
      };

      const userRef = ref(database, `${dbRefs.users}/${newUser.uid}`);
      await set(userRef, userProfile);
      console.log('Perfil guardado en Realtime Database');

      toast.success(`Usuario ${userData.displayName} creado exitosamente`);
      return newUser;
      
    } catch (error) {
      console.error('Error detallado al crear usuario:', error);

      // Si el usuario se creó en Auth pero falló la DB, intentar limpieza
      if (error.code && error.code.startsWith('database/')) {
        console.error('Error en base de datos, pero usuario ya creado en Auth');
        toast.error('Usuario creado pero hubo un error al guardar el perfil. Contacta al administrador.');
      }

      let message = 'Error al crear usuario';
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'Este email ya está registrado';
          break;
        case 'auth/weak-password':
          message = 'La contraseña debe tener al menos 6 caracteres';
          break;
        case 'auth/invalid-email':
          message = 'Email inválido';
          break;
        case 'auth/operation-not-allowed':
          message = 'La creación de usuarios no está habilitada en Firebase';
          break;
        case 'database/permission-denied':
          message = 'Sin permisos para escribir en la base de datos';
          break;
        case 'database/network-error':
          message = 'Error de conexión con la base de datos';
          break;
        default:
          message = error.message || 'Error desconocido al crear usuario';
      }

      toast.error(message);
      throw error;
    }
  };

  // 🔓 Función para cerrar sesión
  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  // 🎯 Funciones de permisos
  const getUserRole = () => user?.profile?.role || ROLES.AGENTE;

  const getUserPermissions = () => PERMISSIONS[getUserRole()] || PERMISSIONS[ROLES.AGENTE];

  const hasPermission = (permission) => {
    const permissions = getUserPermissions();
    return permissions[permission] || false;
  };

  const isRole = (role) => getUserRole() === role;

  const value = {
    user,
    loading,
    login,
    createUser,
    logout,
    isAuthenticated: !!user,

    // Funciones de roles
    getUserRole,
    getUserPermissions,
    hasPermission,
    isRole,

    // Verificaciones rápidas de roles
    isAdmin: isRole(ROLES.ADMIN),
    isCoordinador: isRole(ROLES.COORDINADOR),
    isAgente: isRole(ROLES.AGENTE),

    // Constantes
    ROLES,
    PERMISSIONS
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};