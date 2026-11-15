import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { usePetAtivo } from "../context/usePetAtivo";
import LoginHero from "../components/login/LoginHero";
import AuthTabs from "../components/login/AuthTabs";
import "../components/login/login.css";
import petsLogin from "../assets/pets-login.png";

function Login() {
  const { user, login, cadastrar } = useAuth();
  const { petAtivo } = usePetAtivo();

  const destino = petAtivo ? "/farejar" : "/minha-conta";

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
          onSucesso={() => {}}
        />
      </main>

      <div className="login-patinhas" aria-hidden="true">
        <span className="patinha patinha-1">🐾</span>
        <span className="patinha patinha-2">🐾</span>
        <span className="patinha patinha-3">🐾</span>
        <span className="patinha patinha-4">🐾</span>
        <span className="patinha patinha-5">🐾</span>
        <span className="patinha patinha-6">🐾</span>
      </div>

      <img
        src={petsLogin}
        alt="Foto de pets"
        aria-hidden="true"
        className="login-pets-decoracao"
      />
    </div>
  );
}

export default Login;
