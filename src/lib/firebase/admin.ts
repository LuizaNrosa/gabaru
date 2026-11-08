import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function getAdminApp() {
  const existing = getApps()[0];
  if (existing) return existing;

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Variáveis FIREBASE_ADMIN_* não configuradas.");
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export function adminAuth() {
  return getAuth(getAdminApp());
}

/**
 * Firestore do projeto Gabaru (mesmo app Admin). Usado pelo serviço de
 * entitlements (webhook Stripe) e pela leitura do direito de acesso.
 * Lança quando FIREBASE_ADMIN_* não está configurado — os chamadores
 * falham fechado (sem acesso) em vez de expor conteúdo.
 */
export function adminFirestore(): Firestore {
  return getFirestore(getAdminApp());
}

/** Valida o ID token enviado em `Authorization: Bearer <token>`. */
export async function verifyRequestUser(req: Request) {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    return await adminAuth().verifyIdToken(token);
  } catch {
    return null;
  }
}
