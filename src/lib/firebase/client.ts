import {env} from '../../env.mjs';
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";

// Os acessos literais NEXT_PUBLIC_* para o build estão centralizados em src/env.mjs.
const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

/** Inicialização preguiçosa: build e páginas públicas funcionam sem as chaves. */
const emulatedAuth = new WeakSet<Auth>();
export function getClientAuth(): Auth {
  if (!isFirebaseConfigured) throw new Error("firebase-not-configured");
  const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const auth=getAuth(app);
  const emulator=env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL;
  if(emulator&&!emulatedAuth.has(auth)&&typeof location!=='undefined'&&['localhost','127.0.0.1'].includes(location.hostname)&&firebaseConfig.projectId?.startsWith('demo-')){
    const url=new URL(emulator);if(url.protocol==='http:'&&['127.0.0.1','localhost'].includes(url.hostname)){connectAuthEmulator(auth,url.origin,{disableWarnings:true});emulatedAuth.add(auth);}
  }
  return auth;
}
