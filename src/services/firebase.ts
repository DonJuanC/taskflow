import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firestore NO se inicializa acá a propósito: este archivo lo importan
// Login/Register/Navbar/AuthContext (auth es necesario desde el primer
// render). Si "firebase/firestore" se cargara desde acá, quedaría en el
// bundle inicial aunque el usuario nunca llegue a ver una tarea. La
// inicialización de Firestore vive en services/tasks.ts, que solo se carga
// cuando se entra a "/" (ver el lazy() en App.tsx).
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
