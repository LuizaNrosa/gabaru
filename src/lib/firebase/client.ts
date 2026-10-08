import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// NEXT_PUBLIC_* precisam ser referenciadas literalmente para o Next inlinar no build.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

/** Inicialização preguiçosa: build e páginas públicas funcionam sem as chaves. */
export function getClientAuth(): Auth {
  if (!isFirebaseConfigured) throw new Error("firebase-not-configured");
  const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getAuth(app);
}
