/**
 * Supabase Realtime via direct WebSocket connection.
 * Escucha cambios en la tabla tasks y notifica al callback.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)/)?.[1] || '';
const AUTH_STORAGE_KEY = `sb-${PROJECT_REF}-auth-token`;

function getAccessToken() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return API_KEY;
    const session = JSON.parse(raw);
    return session?.access_token || API_KEY;
  } catch {
    return API_KEY;
  }
}

let ws = null;
let heartbeatInterval = null;
let reconnectTimeout = null;
let onChangeCallback = null;
let onStatusCallback = null;

function getWsUrl() {
  const httpUrl = SUPABASE_URL;
  const wsUrl = httpUrl.replace('https://', 'wss://').replace('http://', 'ws://');
  return `${wsUrl}/realtime/v1/websocket?apikey=${API_KEY}&vsn=1.0.0`;
}

function sendJson(payload) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function startHeartbeat() {
  stopHeartbeat();
  heartbeatInterval = setInterval(() => {
    sendJson({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: null });
  }, 30000);
}

function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

export function connectRealtime(onChange, onStatus) {
  onChangeCallback = onChange;
  onStatusCallback = onStatus;

  if (!SUPABASE_URL || !API_KEY) {
    console.warn('[Realtime] No Supabase config');
    return;
  }

  if (ws) disconnect();

  const token = getAccessToken();
  ws = new WebSocket(getWsUrl());

  ws.onopen = () => {
    console.log('[Realtime] Conectado');
    onStatus?.('connected');

    // Join the realtime channel for tasks table
    sendJson({
      topic: `realtime:public:tasks`,
      event: 'phx_join',
      payload: {
        config: {
          broadcast: { self: false },
          postgres_changes: [
            { event: '*', schema: 'public', table: 'tasks' }
          ]
        },
        access_token: token,
      },
      ref: '1',
    });

    startHeartbeat();
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);

      // Postgres changes
      if (msg.event === 'postgres_changes') {
        const payload = msg.payload;
        if (payload?.data) {
          const { type, record, old_record } = payload.data;
          onChange?.({ type, record, old_record });
        }
      }

      // System reply to join
      if (msg.event === 'phx_reply' && msg.payload?.status === 'ok') {
        console.log('[Realtime] Subscrito a cambios en tasks');
      }
    } catch (err) {
      // Ignore parse errors for heartbeat responses
    }
  };

  ws.onclose = (event) => {
    console.log('[Realtime] Desconectado', event.code);
    stopHeartbeat();
    onStatus?.('disconnected');

    // Auto-reconnect after 5 seconds
    reconnectTimeout = setTimeout(() => {
      console.log('[Realtime] Reconectando...');
      connectRealtime(onChangeCallback, onStatusCallback);
    }, 5000);
  };

  ws.onerror = (err) => {
    console.warn('[Realtime] Error:', err);
    onStatus?.('error');
  };
}

export function disconnect() {
  stopHeartbeat();
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  if (ws) {
    ws.close();
    ws = null;
  }
}
