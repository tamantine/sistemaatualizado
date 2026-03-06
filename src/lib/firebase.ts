// =============================================
// Configuração do Firebase
// =============================================
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC1Phtow8msMe02ujOEkF2wMAZHuI-z1UU",
  authDomain: "hortifruti-pdv.firebaseapp.com",
  projectId: "hortifruti-pdv",
  storageBucket: "hortifruti-pdv.firebasestorage.app",
  messagingSenderId: "511530261155",
  appId: "1:511530261155:web:f10d578c52cfa0507d3d16"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Serviços do Firebase
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
