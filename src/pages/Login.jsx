
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { usePetAtivo } from "../context/usePetAtivo";

import LoginHero from "../components/login/LoginHero";
import AuthTabs from "../components/login/AuthTabs";

import "../components/login/login.css";
import petsLogin from "../assets/pets-login.png";

function Login() {
  const { user, login, cadastrar, verificarEmail, reenviarCodigo, verificando } =
    useAuth();
  const { petAtivo } = usePetAtivo();

  const navigate = useNavigate();
  const location = useLocation();

  // Destino padrão conforme a situação do tutor
  const destinoPadrao = petAtivo ? "/farejar" : "/minha-conta";

  // Recupera a rota que o usuário tentou acessar
  const origem = location.state?.from;

  const rotaSolicitada = origem?.pathname;

  const rotaPermitida =
    rotaSolicitada === "/minha-conta" ||
    rotaSolicitada === "/meu-pet" ||
    (rotaSolicitada === "/farejar" && petAtivo);

  const destino = rotaPermitida
    ? rotaSolicitada + (origem.search || "")
    : destinoPadrao;

  function redirecionarAposLogin() {
    navigate(destino, { replace: true });
  }

  // Aguarda a validação do JWT
  if (verificando) {
    return (
      <div role="status">
        Verificando sua sessão...
      </div>
    );
  }

  // Impede que um usuário autenticado acesse o login
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
          onVerificar={verificarEmail}
          onReenviar={reenviarCodigo}
          onSucesso={redirecionarAposLogin}
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
