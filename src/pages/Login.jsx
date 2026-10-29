import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import LoginHero from "../components/login/LoginHero";
import AuthTabs from "../components/login/AuthTabs";
import "../components/login/login.css";
import petsLogin from "../assets/pets-login.png";

function Login() {
  const { user, login, cadastrar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const origem = location.state?.from;

  const destino =
    origem?.pathname === "/farejar" || origem?.pathname === "/meu-pet"
      ? origem.pathname + (origem.search || "")
      : "/meu-pet";

  function redirecionarAposLogin() {
    navigate(destino, { replace: true });
  }

  if (user) {
    return <Navigate to={destino} replace />;
  }

  return (
    <div className="login-page">
      <main className="login-container">
        <LoginHero />

        <AuthTabs
          onLogin={login}
          onCadastrar={cadastrar}
          onSucesso={redirecionarAposLogin}
        />
      </main>
    <div className="login-patinhas" aria-hidden>
      <span className="patinha patinha-1">🐾</span>
      <span className="patinha patinha-2">🐾</span>
      <span className="patinha patinha-3">🐾</span>
      <span className="patinha patinha-4">🐾</span>
      <span className="patinha patinha-5">🐾</span>
      <span className="patinha patinha-6">🐾</span>
    </div>

      <img
        src={petsLogin}
        alt="foto de pets"
        aria-hidden="true"
        className="login-pets-decoracao"
      />
    </div>
  );
}

export default Login;
