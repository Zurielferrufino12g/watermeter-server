import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración usando variables de entorno (Vite)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // opcional
};

// Validación clara (evita pantalla en blanco)
const requiredKeys = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];

const missing = requiredKeys.filter((key) => !firebaseConfig[key]);

if (missing.length > 0) {
  console.error("❌ Firebase config incompleta");
  console.error("Faltan estas variables:", missing);
  throw new Error(
    `Firebase config incompleta. Revisa variables VITE_ en Render: ${missing.join(
      ", "
    )}`
  );
}

// Evita doble inicialización
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Exportaciones
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});