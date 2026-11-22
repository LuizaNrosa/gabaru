"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { getClientAuth, isFirebaseConfigured } from "@/lib/firebase/client";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  /** false quando as chaves do Firebase não estão configuradas. */
  available: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function friendlyAuthError(err: unknown): string {
  const code = (err as { code?: string; message?: string })?.code ?? "";
  const msg = (err as { message?: string })?.message ?? "";
  if(msg === "session-unavailable")return "Não foi possível confirmar sua sessão. Entre novamente ou tente mais tarde.";
  if (msg === "firebase-not-configured") {
    return "O login ainda não está disponível. Volte em breve.";
  }
  switch (code) {
    case "auth/invalid-email":
      return "Esse e-mail não parece certo. Confira e tente de novo.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
      return "E-mail ou senha não conferem.";
    case "auth/email-already-in-use":
      return "Já existe uma conta com esse e-mail. Tente entrar.";
    case "auth/weak-password":
      return "A senha precisa ter pelo menos 6 caracteres.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Espere um pouco e tente de novo.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "A janela do Google foi fechada antes de terminar. Tente de novo.";
    case "auth/popup-blocked":
      return "O navegador bloqueou a janela do Google. Libere pop-ups para o Gabaru e tente de novo.";
    case "auth/account-exists-with-different-credential":
      return "Esse e-mail já tem conta com senha. Entre com e-mail e senha.";
    case "auth/operation-not-allowed":
      return "O login com Google ainda não está ativo. Use e-mail e senha por enquanto.";
    case "auth/network-request-failed":
      return "Sem conexão. Confira a internet e tente de novo.";
    default:
      return "Não foi possível concluir. Tente de novo.";
  }
}

async function syncServerSession(user:User){const response=await fetch('/api/auth/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idToken:await user.getIdToken()})});if(!response.ok)throw new Error('session-unavailable');}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return;
    }
    try {
      const unsub = onAuthStateChanged(
        getClientAuth(),
        (u) => {
          setUser(u);
          setLoading(false);
        },
        () => setLoading(false),
      );
      return unsub;
    } catch {
      queueMicrotask(() => setLoading(false));
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const credential=await signInWithEmailAndPassword(getClientAuth(), email, password);
    await syncServerSession(credential.user);
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(getClientAuth(), email, password);
    if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
    await syncServerSession(cred.user);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const credential = await signInWithPopup(getClientAuth(), provider);
    await syncServerSession(credential.user);
  }, []);

  const signOut = useCallback(async () => {
    const response=await fetch('/api/auth/session',{method:'DELETE'});if(!response.ok)throw new Error('session-unavailable');
    await fbSignOut(getClientAuth());
  }, []);

  const value = useMemo(
    () => ({ user, loading, available: isFirebaseConfigured, signIn, signUp, signInWithGoogle, signOut }),
    [user, loading, signIn, signUp, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}
