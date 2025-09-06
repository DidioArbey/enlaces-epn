// src/hooks/useAuth.js
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
            profile: userData || {}
          });
        } catch (error) {
          console.error('Error al obtener perfil:', error);
          setUser(user);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔑 Función para iniciar sesión
  const login = async (email, password) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
        default:
          message = 'Error de conexión. Intenta nuevamente';
      }
      
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 📝 Función para registrarse
  const register = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 🏷️ Actualizar perfil
      if (userData.displayName) {
        await updateProfile(user, {
          displayName: userData.displayName
        });
      }

      // 💾 Guardar en Realtime Database
      const userProfile = {
        email: user.email,
        displayName: userData.displayName || '',
        role: userData.role || 'operator',
        department: userData.department || '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      const userRef = ref(database, `${dbRefs.users}/${user.uid}`);
      await set(userRef, userProfile);

      toast.success('¡Cuenta creada exitosamente!');
      return user;
    } catch (error) {
      console.error('Error al registrarse:', error);
      
      let message = 'Error al crear la cuenta';
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
        default:
          message = 'Error al crear la cuenta';
      }
      
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
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

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};