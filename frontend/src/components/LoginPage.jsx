import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Lock, Mail, User, Eye, EyeOff, AlertCircle, Loader } from 'lucide-react';

const PALETTE = {
  nectarine: "#D7897F",
  mostaza: "#E2B93B",
  menthe: "#96C7B3",
  lagune: "#6398A9",
  cream: "#FAF8F4",
  warm: "#F3EDE6",
  ink: "#2C2926",
  soft: "#5C5650",
  muted: "#9A948C",
  faint: "#D8D2CA",
  danger: "#C0564A",
  bone: "#FFFDF9",
};

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('login'); // login | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const [debug, setDebug] = useState('');

  // Test de conectividad al montar
  useEffect(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    setDebug(`URL: ${url ? url.substring(0, 30) + '...' : 'NO DEFINIDA'} | Key: ${key ? 'OK (' + key.length + ' chars)' : 'NO DEFINIDA'}`);

    // Test fetch directo (sin supabase client)
    if (url && key) {
      fetch(`${url}/auth/v1/health`, { headers: { apikey: key } })
        .then(r => r.json())
        .then(d => setDebug(prev => prev + ` | Health: ${d.name || 'OK'}`))
        .catch(e => setDebug(prev => prev + ` | Health FAIL: ${e.message}`));
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    setDebug('Intentando login...');

    try {
      setDebug('Enviando login...');

      if (mode === 'login') {
        await signIn(email, password);
        setDebug('Login OK — app lista');
        setSuccess('Login exitoso');
      } else {
        await signUp(email, password, displayName);
        setSuccess('Cuenta creada. Revisa tu correo para confirmar.');
        setMode('login');
      }
    } catch (err) {
      const msg = err?.message || String(err) || 'Error desconocido';
      console.error('[Login] Error:', msg, err);
      setDebug(`Error: ${msg}`);
      if (msg.includes('Invalid login')) setError('Email o contrasena incorrectos');
      else if (msg.includes('already registered')) setError('Este email ya esta registrado');
      else if (msg.includes('Password should be')) setError('La contrasena debe tener minimo 6 caracteres');
      else setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${PALETTE.cream} 0%, ${PALETTE.warm} 50%, ${PALETTE.cream} 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        padding: '0 24px',
      }}>
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            fontSize: 32,
            fontWeight: 700,
            fontFamily: "Georgia, 'Times New Roman', serif",
            color: PALETTE.ink,
            letterSpacing: '-0.5px',
            marginBottom: 8,
          }}>
            DMSTK
          </div>
          <div style={{
            fontSize: 13,
            color: PALETTE.muted,
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}>
            Project Tracker
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: PALETTE.bone,
          borderRadius: 16,
          padding: '36px 32px',
          boxShadow: '0 4px 24px rgba(44, 41, 38, 0.06), 0 1px 4px rgba(44, 41, 38, 0.04)',
          border: `1px solid ${PALETTE.faint}40`,
        }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 600,
            color: PALETTE.ink,
            margin: '0 0 24px',
            textAlign: 'center',
          }}>
            {mode === 'login' ? 'Iniciar sesion' : 'Crear cuenta'}
          </h2>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 8,
              background: PALETTE.danger + '12',
              color: PALETTE.danger,
              fontSize: 13,
              marginBottom: 20,
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {success && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: PALETTE.menthe + '20',
              color: '#2d7a5f',
              fontSize: 13,
              marginBottom: 20,
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: PALETTE.soft, display: 'block', marginBottom: 6 }}>
                  Nombre
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: PALETTE.muted }} />
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Tu nombre"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      fontSize: 14,
                      borderRadius: 8,
                      border: `1px solid ${PALETTE.faint}`,
                      background: PALETTE.cream,
                      color: PALETTE.ink,
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = PALETTE.lagune}
                    onBlur={e => e.target.style.borderColor = PALETTE.faint}
                  />
                </div>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: PALETTE.soft, display: 'block', marginBottom: 6 }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: PALETTE.muted }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  autoComplete="email"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    fontSize: 14,
                    borderRadius: 8,
                    border: `1px solid ${PALETTE.faint}`,
                    background: PALETTE.cream,
                    color: PALETTE.ink,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = PALETTE.lagune}
                  onBlur={e => e.target.style.borderColor = PALETTE.faint}
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: PALETTE.soft, display: 'block', marginBottom: 6 }}>
                Contrasena
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: PALETTE.muted }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimo 6 caracteres"
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 38px',
                    fontSize: 14,
                    borderRadius: 8,
                    border: `1px solid ${PALETTE.faint}`,
                    background: PALETTE.cream,
                    color: PALETTE.ink,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = PALETTE.lagune}
                  onBlur={e => e.target.style.borderColor = PALETTE.faint}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: PALETTE.muted,
                    padding: 2,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: 14,
                fontWeight: 600,
                borderRadius: 8,
                border: 'none',
                background: loading ? PALETTE.muted : PALETTE.ink,
                color: PALETTE.cream,
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background 0.2s, transform 0.1s',
                letterSpacing: '0.3px',
              }}
              onMouseDown={e => { if (!loading) e.target.style.transform = 'scale(0.98)'; }}
              onMouseUp={e => e.target.style.transform = 'scale(1)'}
            >
              {loading && <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              {mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            marginTop: 20,
            fontSize: 13,
            color: PALETTE.muted,
          }}>
            {mode === 'login' ? (
              <>
                No tienes cuenta?{' '}
                <button
                  onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: PALETTE.lagune,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 13,
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  Crear cuenta
                </button>
              </>
            ) : (
              <>
                Ya tienes cuenta?{' '}
                <button
                  onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: PALETTE.lagune,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 13,
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  Iniciar sesion
                </button>
              </>
            )}
          </div>
        </div>

        {/* Debug — eliminar despues */}
        {debug && (
          <div style={{
            marginTop: 16,
            padding: '8px 12px',
            borderRadius: 8,
            background: '#1a1a1a',
            color: '#8f8',
            fontSize: 10,
            fontFamily: 'monospace',
            wordBreak: 'break-all',
            lineHeight: 1.5,
          }}>
            {debug}
          </div>
        )}

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: 24,
          fontSize: 11,
          color: PALETTE.muted,
          letterSpacing: '0.5px',
        }}>
          DMSTK HOUSES — Project Management
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
