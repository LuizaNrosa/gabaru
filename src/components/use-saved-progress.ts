"use client";
import { useEffect, useRef, useState } from "react";

/** Salva apenas neste navegador. Nunca substitui uma sessão antes de carregá-la. */
export function useSavedProgress<T>(key: string, state: T, restore: (value: T) => void, initial: T) {
  const [loadedKey, setLoadedKey] = useState("");
  const [resumed, setResumed] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const restoreRef = useRef(restore);
  const initialRef = useRef(initial);
  initialRef.current = initial;
  restoreRef.current = restore;
  useEffect(() => {
    setResumed(false);
    restoreRef.current(initialRef.current);
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.version === 1 && saved.state && typeof saved.state === "object") {
          restoreRef.current(saved.state as T);
          setResumed(true);
        }
      }
      setStorageAvailable(true);
    } catch { setStorageAvailable(false); }
    setLoadedKey(key);
  }, [key]);
  useEffect(() => {
    if (loadedKey !== key) return;
    try { window.localStorage.setItem(key, JSON.stringify({ version: 1, state })); }
    catch { setStorageAvailable(false); }
  }, [key, loadedKey, state]);
  return { resumed, storageAvailable, dismissResume: () => setResumed(false) };
}
