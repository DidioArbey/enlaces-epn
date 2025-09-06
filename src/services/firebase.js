// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// 🔧 Configuración de Firebase - Enlaces EPN
const firebaseConfig = {
  apiKey: "AIzaSyCY53gNk2GJqUscd-b9G2VJUY1L7QHMjZU",
  authDomain: "enlaces-epn.firebaseapp.com",
  databaseURL: "https://enlaces-epn-default-rtdb.firebaseio.com",
  projectId: "enlaces-epn",
  storageBucket: "enlaces-epn.firebasestorage.app",
  messagingSenderId: "166765569864",
  appId: "1:166765569864:web:737ff94f37386d14b4f57d"
};

// 🚀 Inicializar Firebase
const app = initializeApp(firebaseConfig);

// 🔐 Servicios de Firebase
export const auth = getAuth(app);
export const database = getDatabase(app);

// 📊 Referencias de la base de datos
export const dbRefs = {
  calls: 'calls',
  users: 'users',
  reports: 'reports',
  settings: 'settings'
};

export default app;