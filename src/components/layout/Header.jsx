import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mostrarModal, setMostrarModal] = useState(false);

  const confirmarLogout = () => {
    logout();
    setMostrarModal(false);
    navigate('/login');
  };

  return (
    <header className="header-container">
      {/* Logotipo e Badge */}
      <div className="header-logo">
        <img src="/petmatch-symbol.png" alt="Logo PetMatch" className="logo-image" />
        <Link to="/" className="logo-title">Pares & Patinhas</Link>
        <span className="logo-badge">Todo pet merece um par</span>
      </div>

      {/* Navegação Central */}
      <nav className="header-nav">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Início
        </NavLink>
        <NavLink to="/farejar" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Farejar
        </NavLink>
        <NavLink to="/meu-pet" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Meu pet
        </NavLink>
      </nav>

      {/* Botão de Entrar ou Logout */}
      <div className="header-user">
        {user ? (
          <button 
            onClick={() => setMostrarModal(true)} 
            className="btn-logout" 
            style={{ 
              padding: '8px 18px', 
              backgroundColor: '#fee2e2', 
              color: '#ef4444', 
              border: 'none', 
              borderRadius: '20px', 
              cursor: 'pointer', 
              fontWeight: '600'
            }}
          >
            Sair
          </button>
        ) : (
          <Link to="/login" className="user-profile">
            <div className="avatar-placeholder">🐾</div>
            <span className="user-name">Entrar</span>
          </Link>
        )}
      </div>

      {/* Modal de Confirmação com Patinhas nos Cantos */}
      {mostrarModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            position: 'relative',
            backgroundColor: '#ffffff',
            padding: '32px 36px',
            borderRadius: '20px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            textAlign: 'center',
            maxWidth: '380px',
            width: '90%'
          }}>
            {/* Patinhas nos 4 cantos */}
            <span style={{ position: 'absolute', top: '12px', left: '12px', fontSize: '1rem', opacity: 0.65 }}>🐾</span>
            <span style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '1rem', opacity: 0.65 }}>🐾</span>
            <span style={{ position: 'absolute', bottom: '12px', left: '12px', fontSize: '1rem', opacity: 0.65 }}>🐾</span>
            <span style={{ position: 'absolute', bottom: '12px', right: '12px', fontSize: '1rem', opacity: 0.65 }}>🐾</span>

            <h3 style={{ margin: '0 0 10px 0', color: '#1f2937', fontSize: '1.25rem', fontWeight: '700' }}>
              Você quer mesmo deslogar?
            </h3>
            <p style={{ margin: '0 0 22px 0', color: '#6b7280', fontSize: '0.95rem' }}>
              Caso saia, precisará se autenticar novamente.
            </p>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={confirmarLogout}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  flex: 1
                }}
              >
                Sim, deslogar
              </button>
              <button 
                onClick={() => setMostrarModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  flex: 1
                }}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}