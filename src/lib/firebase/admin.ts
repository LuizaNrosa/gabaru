import {getServerEnv} from '../../env.mjs';
import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";

export function getAdminApp() {
  const existing = getApps()[0];
  if (existing) return existing;

  const projectId = getServerEnv().FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = getServerEnv().FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = getServerEnv().FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Variáveis FIREBASE_ADMIN_* não configuradas.");
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export async function adminAuth() {
  const { getAuth } = await import("firebase-admin/auth");
  return getAuth(getAdminApp());
}

/** Valida o ID token enviado em `Authorization: Bearer <token>`. */
export async function verifyRequestUser(req: Request) {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    const auth = await adminAuth();
    return await auth.verifyIdToken(token, true);
  } catch {
    return null;
  }
}

export async function adminDb(){const {getFirestore}=await import("firebase-admin/firestore");return getFirestore(getAdminApp());}
export async function verifySessionCookie(cookie:string){try{return await (await adminAuth()).verifySessionCookie(cookie,true);}catch{return null;}}
