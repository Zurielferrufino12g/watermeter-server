// src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Config desde variables de entorno de Vite (Render las inyecta en build)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,

  // opcional (solo si tienes Analytics)
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// ✅ Validación: si falta algo, te lo dice y NO deja pantalla en blanco
const requiredKeys = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];

const missing = requiredKeys.filter((k) => {
  const v = firebaseConfig[k];
  return !v || (typeof v === "string" && v.trim() === "");
});

if (missing.length > 0) {
  console.error("❌ Firebase config incompleta. Faltan:", missing);
  console.error(
    "➡️ Revisa que las variables existan en Render (FRONTEND) y haz 'Clear build cache' + redeploy."
  );

  // Lanza error claro para que lo veas en consola (y no quede en blanco sin explicación)
  throw new Error(`Firebase config incompleta: ${missing.join(", ")}`);
}

// ✅ Evita doble inicialización (Vite hot reload / React strict mode)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Exportaciones listas para usar
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });