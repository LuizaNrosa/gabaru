import * as SecureStore from "expo-secure-store";
// Somente refresh token no armazenamento protegido; senha não é persistida.
const key = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
const tokenKey = "gabaru.refresh";
export async function signIn(email: string, password: string) {
  if (!key)
    throw new Error(
      "Login aguardando a configuração pública do Firebase no build.",
    );
  const r = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );
  const data = await r.json();
  if (!r.ok)
    throw new Error(
      "Não foi possível entrar. Confira os dados ou tente novamente mais tarde.",
    );
  await SecureStore.setItemAsync(tokenKey, data.refreshToken);
  return { email: data.email as string, uid: data.localId as string };
}
export async function restoreSession() {
  if (!key) return null;
  const refresh = await SecureStore.getItemAsync(tokenKey);
  if (!refresh) return null;
  const r = await fetch(
    `https://securetoken.googleapis.com/v1/token?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refresh,
      }).toString(),
    },
  );
  if (!r.ok) {
    if (r.status === 400 || r.status === 401)
      await SecureStore.deleteItemAsync(tokenKey);
    return null;
  }
  const data = await r.json();
  await SecureStore.setItemAsync(tokenKey, data.refresh_token);
  return { uid: data.user_id as string };
}
export async function signOut() {
  await SecureStore.deleteItemAsync(tokenKey);
}
