import { useState } from "react";
import api from '../services/api'

const CHAVE = "pp_usuario";

function lerUsuarioSalvo() {
  try {
    const salvo = localStorage.getItem(CHAVE);

    if (salvo) {
      return JSON.parse(salvo);
    } else {
      return null;
    }
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState(lerUsuarioSalvo);

  async function login(email, senha) {
    const resposta = await api.get("/users", {
        params: { email: email.trim() },
    });
    const encontrado = resposta.data[0]

    if(!encontrado || encontrado.password !== senha){
        return false
    }

    const usuario = {id: encontrado.id, name: encontrado.name, email: encontrado.email}
    localStorage.setItem(CHAVE, JSON.stringify(usuario))
    setUser (usuario)
    return true
  }

  function logout() {
    localStorage.removeItem(CHAVE)
    setUser(null)
  }

  return {user, login, logout}
}
