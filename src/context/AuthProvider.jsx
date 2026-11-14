import { useEffect, useState } from "react";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

const CHAVE = "pp_usuario";
const TEMPO_SESSAO = 30 * 30 * 1000;
function lerUsuarioSalvo() {
  try {
    const token = localStorage.getItem("pp_token");

    if (!token) {
      localStorage.removeItem(CHAVE);
      return null;
    }
    const salvo = localStorage.getItem(CHAVE);

    if (!salvo) return null;

    const sessao = JSON.parse(salvo);

    if (
      !sessao.usuario ||
      typeof sessao.expiraEm !== "number" ||
      Date.now() >= sessao.expiraEm
    ) {
      localStorage.removeItem(CHAVE);
      return null;
    }

    return sessao.usuario;
  } catch {
    localStorage.removeItem(CHAVE);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(lerUsuarioSalvo);
  const [verificando, setVerificando] = useState(true);

  function logout() {
    localStorage.removeItem("pp_token");
    setUser(null);
  }

  function iniciarSessao(registro) {
    const usuario = {
      id: registro.id,
      name: registro.name,
      email: registro.email,
    };

    const sessao = {
      usuario,
      expiraEm: Date.now() + TEMPO_SESSAO,
    };

    localStorage.setItem(CHAVE, JSON.stringify(sessao));
    setUser(usuario);
  }

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

      localStorage.setItem("pp_token", token);

      const usuario = {
        id: tutor.id,
        name: tutor.nome,
        email: tutor.email,
      };

      iniciarSessao(usuario);

      return true;
    } catch (error) {
      if (error.response?.status === 401) {
        return false;
      }

      throw error;
    }
  }

  async function cadastrar(nome, email, senha) {
    const emailLimpo = email.trim().toLowerCase();

    const existentes = await api.get("/users", {
      params: { email: emailLimpo },
    });

    if (existentes.data.length > 0) {
      return false;
    }

    const resposta = await api.post("/users", {
      name: nome.trim(),
      email: emailLimpo,
      password: senha,
    });

    iniciarSessao(resposta.data);
    return true;
  }

  useEffect(() => {
    if (!user) return;

    const sessaoSalva = localStorage.getItem(CHAVE);

    if (!sessaoSalva) {
      return;
    }

    let expiraEm;

    try {
      expiraEm = JSON.parse(sessaoSalva).expiraEm;
    } catch {
      return;
    }

    const tempoRestante = expiraEm - Date.now();

    if (tempoRestante <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      logout();
    }, tempoRestante);

    return () => clearTimeout(timer);
  }, [user]);
  useEffect(() => {
    let ativo = true;

    const token = localStorage.getItem("pp_token");

    if (!token) {
      setUser(null);
      setVerificando(false);
      return;
    }

    async function validarSessao() {
      try {
        const resposta = await api.get("/auth/me");

        if (!ativo) return;

        const tutor = resposta.data.tutor;

        if (!tutor) {
          throw new Error("Dados do tutor não encontrados.");
        }

        setUser({
          id: tutor.id,
          name: tutor.nome,
          email: tutor.email,
        });
      } catch (error) {
        if (!ativo) return;

        setUser(null);

        if (error.response?.status === 401) {
          localStorage.removeItem("pp_token");
          localStorage.removeItem(CHAVE);
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
  }, []);
  return (
    <AuthContext.Provider
      value={{ user, login, cadastrar, logout, verificando }}
    >
      {children}
    </AuthContext.Provider>
  );
}
