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
  onAuthStateChanged,
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
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function friendlyAuthError(err: unknown): string {
  const code = (err as { code?: string; message?: string })?.code ?? "";
  const msg = (err as { message?: string })?.message ?? "";
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
    case "auth/network-request-failed":
      return "Sem conexão. Confira a internet e tente de novo.";
    default:
      return "Não foi possível concluir. Tente de novo.";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
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
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(getClientAuth(), email, password);
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(getClientAuth(), email, password);
    if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
  }, []);

  const signOut = useCallback(async () => {
    await fbSignOut(getClientAuth());
  }, []);

  const value = useMemo(
    () => ({ user, loading, available: isFirebaseConfigured, signIn, signUp, signOut }),
    [user, loading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}
