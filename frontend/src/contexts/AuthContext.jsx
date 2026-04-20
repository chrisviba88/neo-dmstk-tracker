import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

// Obtener el project ref de la URL de Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)/)?.[1] || '';
const STORAGE_KEY = `sb-${PROJECT_REF}-auth-token`;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId, accessToken) {
    if (!SUPABASE_URL) return null;
    try {
      // Fetch directo — evitar el cliente Supabase que se cuelga
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`,
        {
          headers: {
            'apikey': API_KEY,
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      if (!res.ok) {
        console.warn('[Auth] Error fetch profile:', res.status);
        return null;
      }
      const data = await res.json();
      return data?.[0] || null;
    } catch (err) {
      console.warn('[Auth] fetchProfile exception:', err);
      return null;
    }
  }

  useEffect(() => {
    async function init() {
      try {
        // Leer sesion de localStorage directamente
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          console.log('[Auth] No hay sesion guardada');
          setLoading(false);
          return;
        }

        const session = JSON.parse(raw);
        if (!session?.access_token || !session?.user) {
          console.log('[Auth] Sesion invalida');
          localStorage.removeItem(STORAGE_KEY);
          setLoading(false);
          return;
        }

        // Verificar que el token no este expirado
        const expiresAt = session.expires_at;
        if (expiresAt && Date.now() / 1000 > expiresAt) {
          console.log('[Auth] Sesion expirada, limpiando');
          localStorage.removeItem(STORAGE_KEY);
          setLoading(false);
          return;
        }

        console.log('[Auth] Sesion encontrada para:', session.user.email);
        setUser(session.user);

        const p = await fetchProfile(session.user.id, session.access_token);
        setProfile(p);
        console.log('[Auth] Perfil cargado:', p?.display_name, p?.role);
      } catch (err) {
        console.error('[Auth] Error init:', err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  // Actualizar last_seen cada 5 minutos
  useEffect(() => {
    if (!user) return;
    const raw = localStorage.getItem(STORAGE_KEY);
    const session = raw ? JSON.parse(raw) : null;
    if (!session?.access_token) return;

    function updateSeen() {
      fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': API_KEY,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ last_seen_at: new Date().toISOString() }),
      }).catch(() => {});
    }

    updateSeen();
    const interval = setInterval(updateSeen, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  async function signIn(email, password) {
    // Login directo con fetch — el cliente Supabase JS se cuelga
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'apikey': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const result = await res.json();

    if (!res.ok || result.error) {
      throw new Error(result.error_description || result.msg || result.error || 'Error de login');
    }

    // Guardar sesion en localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      expires_in: result.expires_in,
      expires_at: result.expires_at,
      token_type: result.token_type,
      user: result.user,
    }));

    setUser(result.user);
    const p = await fetchProfile(result.user.id, result.access_token);
    setProfile(p);

    return result;
  }

  async function signUp(email, password, displayName) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: { 'apikey': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, data: { display_name: displayName } }),
    });
    const result = await res.json();

    if (!res.ok || result.error) {
      throw new Error(result.error_description || result.msg || result.error || 'Error de registro');
    }
    return result;
  }

  function signOut() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setProfile(null);
  }

  async function refreshProfile() {
    if (!user) return;
    const raw = localStorage.getItem(STORAGE_KEY);
    const session = raw ? JSON.parse(raw) : null;
    if (!session?.access_token) return;
    const p = await fetchProfile(user.id, session.access_token);
    setProfile(p);
  }

  const isAdmin = profile?.role === 'admin';
  const isPM = profile?.role === 'pm' || isAdmin;
  const canEdit = isAdmin || isPM;

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      signIn, signUp, signOut, refreshProfile,
      isAdmin, isPM, canEdit,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
