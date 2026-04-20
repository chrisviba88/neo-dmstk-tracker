/**
 * Acceso a datos via Supabase REST API con auth.
 * Usa fetch directo (el cliente JS de Supabase se cuelga para auth).
 * Lee el access_token de localStorage automáticamente.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)/)?.[1] || '';
const AUTH_STORAGE_KEY = `sb-${PROJECT_REF}-auth-token`;

function getAccessToken() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    // Verificar que no esté expirado
    if (session.expires_at && Date.now() / 1000 > session.expires_at) {
      return null;
    }
    return session.access_token || null;
  } catch {
    return null;
  }
}

function headers(extra = {}) {
  const token = getAccessToken();
  return {
    'apikey': API_KEY,
    'Authorization': `Bearer ${token || API_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    ...extra,
  };
}

// GET — select tasks (or any table)
export async function dbSelect(table, query = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}?${query}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error ${res.status} al leer ${table}`);
  }
  return res.json();
}

// INSERT — una o varias filas
export async function dbInsert(table, rows) {
  const body = Array.isArray(rows) ? rows : [rows];
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error ${res.status} al insertar en ${table}`);
  }
  return res.json();
}

// UPDATE — actualizar por id
export async function dbUpdate(table, id, changes) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(changes),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error ${res.status} al actualizar ${table}`);
  }
  return res.json();
}

// DELETE — eliminar por id
export async function dbDelete(table, id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'DELETE',
    headers: headers({ 'Prefer': 'return=minimal' }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error ${res.status} al eliminar de ${table}`);
  }
  return true;
}

// RPC — llamar funciones de Supabase
export async function dbRpc(fn, params = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error ${res.status} al ejecutar ${fn}`);
  }
  return res.json();
}

// Helper: check if user is authenticated
export function isAuthenticated() {
  return !!getAccessToken();
}
