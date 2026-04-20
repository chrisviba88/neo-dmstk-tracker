import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './contexts/AuthContext'
import App from './App.jsx'
import LoginPage from './components/LoginPage'
import { useAuth } from './contexts/AuthContext'
import './index.css'

function Root() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FAF8F4',
        fontFamily: "'DM Sans', sans-serif",
        color: '#9A948C',
        fontSize: 14,
      }}>
        Cargando...
      </div>
    );
  }

  if (!user || !profile) {
    return <LoginPage />;
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </React.StrictMode>,
)
