import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/useAuth";
import { usePetAtivo } from "../../context/usePetAtivo";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();
  const { petAtivo } = usePetAtivo();

  const [mostrarModal, setMostrarModal] = useState(false);

  const emPerfilDeFarejar = location.pathname.startsWith("/perfil-pet/");
  const emConversa = location.pathname.startsWith("/chat/");

  function confirmarLogout() {
    logout();
    setMostrarModal(false);
    navigate("/login");
  }

  return (
    <header
      className={`header-container ${user ? "header-logado" : "header-visitante"}`}
    >
      <div className="header-logo">
        <img
          src="/petmatch-symbol.png"
          alt="Logo Pares & Patinhas"
          className="logo-image"
        />

        <Link to="/" className="logo-title">
          Pares & Patinhas
        </Link>

        <span className="logo-badge">Todo pet merece um par</span>
      </div>

      <nav className="header-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          Início
        </NavLink>

        <NavLink
          to="/farejar"
          className={({ isActive }) =>
            isActive || emPerfilDeFarejar ? "nav-item active" : "nav-item"
          }
        >
          Farejar
        </NavLink>

        <NavLink
          to="/meu-pet"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          Meu pet
        </NavLink>

        {user && (
          <NavLink
            to="/conversas"
            className={({ isActive }) =>
              isActive || emConversa ? "nav-item active" : "nav-item"
            }
          >
            Conversas
          </NavLink>
        )}
      </nav>

      <div className="header-user">
        {user ? (
          <div className="header-user-actions">
            {petAtivo && (
              <Link
                to="/minha-conta"
                className="pet-ativo-chip"
                title={`Pet ativo: ${petAtivo.nome}`}
              >
                <span aria-hidden="true">🐾</span>

                <span className="pet-ativo-chip-nome">{petAtivo.nome}</span>
              </Link>
            )}

            <Link to="/minha-conta" className="user-profile user-profile-botao">
              <span className="avatar-placeholder" aria-hidden="true">
                🐾
              </span>

              <span className="user-name">Minha Conta</span>
            </Link>

            <button
              type="button"
              onClick={() => setMostrarModal(true)}
              className="btn-logout"
              style={{
                padding: "8px 18px",
                backgroundColor: "#fee2e2",
                color: "#ef4444",
                border: "none",
                borderRadius: "20px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Sair
            </button>
          </div>
        ) : (
          <Link to="/login" className="user-profile">
            <div className="avatar-placeholder">🐾</div>

            <span className="user-name">Entrar</span>
          </Link>
        )}
      </div>

      {mostrarModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-logout"
            style={{
              position: "relative",
              backgroundColor: "#ffffff",
              padding: "32px 36px",
              borderRadius: "20px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
              textAlign: "center",
              maxWidth: "380px",
              width: "90%",
            }}
          >
            {[
              { top: 12, left: 12 },
              { top: 12, right: 12 },
              { bottom: 12, left: 12 },
              { bottom: 12, right: 12 },
            ].map((posicao, indice) => (
              <span
                key={indice}
                aria-hidden="true"
                style={{
                  position: "absolute",
                  ...posicao,
                  fontSize: "1rem",
                  opacity: 0.65,
                }}
              >
                🐾
              </span>
            ))}

            <h3
              id="titulo-logout"
              style={{
                margin: "0 0 10px",
                color: "#1f2937",
                fontSize: "1.25rem",
                fontWeight: "700",
              }}
            >
              Você quer mesmo deslogar?
            </h3>

            <p
              style={{
                margin: "0 0 22px",
                color: "#6b7280",
                fontSize: "0.95rem",
              }}
            >
              Caso saia, precisará se autenticar novamente.
            </p>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
              }}
            >
              <button
                type="button"
                onClick={confirmarLogout}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: 600,
                  flex: 1,
                }}
              >
                Sim, deslogar
              </button>

              <button
                type="button"
                onClick={() => setMostrarModal(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: 600,
                  flex: 1,
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
