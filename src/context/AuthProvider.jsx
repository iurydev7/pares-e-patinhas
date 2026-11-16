
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

const TOKEN_KEY = "pp_token";
const CHAVE_ANTIGA = "pp_usuario";

// Lê o horário de expiração informado no JWT
function obterExpiracao(token) {
  try {
    const partePayload = token.split(".")[1];

    if (!partePayload) return null;

    const base64 = partePayload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const payload = JSON.parse(atob(base64));

    if (typeof payload.exp !== "number") {
      return null;
    }

    // O JWT usa segundos; JavaScript usa milissegundos
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

// Adapta o formato do backend ao frontend
function formatarTutor(tutor) {
  return {
    id: tutor.id,
    name: tutor.nome,
    email: tutor.email,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [verificando, setVerificando] = useState(true);

  // Encerra a sessão local
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CHAVE_ANTIGA);
    setUser(null);
  }, []);

  // Inicia a sessão após login ou cadastro
  function iniciarSessao(token, tutor) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(CHAVE_ANTIGA);

    setUser(formatarTutor(tutor));
  }

  // Autentica um tutor existente
  async function login(email, senha) {
    try {
      const resposta = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        senha,
      });

      const { token, tutor } = resposta.data;

      if (!token || !tutor) {
        throw new Error("Resposta de autenticação inválida.");
      }

      iniciarSessao(token, tutor);

      return true;
    } catch (error) {
      if (error.response?.status === 401) {
        return false;
      }

      // 403 = senha correta, mas o e-mail ainda não foi confirmado com o código
      if (
        error.response?.status === 403 &&
        error.response.data?.code === "EMAIL_NAO_VERIFICADO"
      ) {
        return "verificar";
      }

      throw error;
    }
  }

  // Cria a conta (ainda sem sessão): a API envia um código para o e-mail informado.
  // true = conta criada, falta confirmar o código; false = e-mail já cadastrado.
  async function cadastrar(nome, email, senha) {
    try {
      await api.post("/auth/register", {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha,
      });

      return true;
    } catch (error) {
      if (error.response?.status === 409) {
        return false;
      }

      throw error;
    }
  }

  // Confirma o código recebido por e-mail; a API já devolve a sessão (token)
  async function verificarEmail(email, codigo) {
    const resposta = await api.post("/auth/verify-email", {
      email: email.trim().toLowerCase(),
      codigo,
    });

    const { token, tutor } = resposta.data;

    if (!token || !tutor) {
      throw new Error("Resposta de verificação inválida.");
    }

    iniciarSessao(token, tutor);
  }

  // Pede um novo código (o anterior deixa de valer)
  async function reenviarCodigo(email) {
    await api.post("/auth/resend-code", {
      email: email.trim().toLowerCase(),
    });
  }

  // Valida a sessão ao iniciar ou atualizar a aplicação
  useEffect(() => {
    let ativo = true;

    localStorage.removeItem(CHAVE_ANTIGA);

    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setVerificando(false);
      return;
    }

    const expiracao = obterExpiracao(token);

    if (!expiracao || Date.now() >= expiracao) {
      logout();
      setVerificando(false);
      return;
    }

    async function validarSessao() {
      try {
        const resposta = await api.get("/auth/me");

        if (
          !ativo ||
          localStorage.getItem(TOKEN_KEY) !== token
        ) {
          return;
        }

        const tutor = resposta.data.tutor;

        if (!tutor) {
          throw new Error("Tutor não encontrado.");
        }

        setUser(formatarTutor(tutor));
      } catch (error) {
        if (
          !ativo ||
          localStorage.getItem(TOKEN_KEY) !== token
        ) {
          return;
        }

        // Token rejeitado pelo backend
        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          logout();
        } else {
          // Não libera acesso se a validação falhar
          setUser(null);
        }
      } finally {
        if (ativo) {
          setVerificando(false);
        }
      }
    }

    validarSessao();

    return () => {
      ativo = false;
    };
  }, [logout]);

  // Encerra a sessão quando o JWT expirar
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem(TOKEN_KEY);
    const expiracao = token ? obterExpiracao(token) : null;

    if (!expiracao || Date.now() >= expiracao) {
      logout();
      return;
    }

    const tempoRestante = expiracao - Date.now();

    const timer = setTimeout(() => {
      logout();
    }, tempoRestante);

    return () => clearTimeout(timer);
  }, [user, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        cadastrar,
        verificarEmail,
        reenviarCodigo,
        logout,
        verificando,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
