import { useState } from 'react'
import api from '../services/api'
import { AuthContext } from './AuthContext'

const CHAVE = 'pp_usuario'

function lerUsuarioSalvo() {
  try {
    const salvo = localStorage.getItem(CHAVE)

    if (salvo) {
      return JSON.parse(salvo)
    } else {
      return null
    }
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  // O estado do usuário logado agora vive AQUI, em um lugar só.
  // Todos os componentes que chamam useAuth() enxergam este mesmo estado.
  const [user, setUser] = useState(lerUsuarioSalvo)

  // Guarda a sessão (sem a senha) no navegador e no estado
  function iniciarSessao(registro) {
    const usuario = { id: registro.id, name: registro.name, email: registro.email }
    localStorage.setItem(CHAVE, JSON.stringify(usuario))
    setUser(usuario)
  }

  async function login(email, senha) {
    const resposta = await api.get('/users', {
      params: { email: email.trim().toLowerCase() },
    })
    const encontrado = resposta.data[0]

    if (!encontrado || encontrado.password !== senha) {
      return false
    }

    iniciarSessao(encontrado)
    return true
  }

  // Cria a conta gravando um novo usuário no db.json (POST /users).
  // Retorna false se o e-mail já existe; true se criou (e já deixa logado).
  async function cadastrar(nome, email, senha) {
    const emailLimpo = email.trim().toLowerCase()

    const existentes = await api.get('/users', { params: { email: emailLimpo } })
    if (existentes.data.length > 0) {
      return false
    }

    const resposta = await api.post('/users', {
      name: nome.trim(),
      email: emailLimpo,
      password: senha,
    })

    iniciarSessao(resposta.data)
    return true
  }

  function logout() {
    localStorage.removeItem(CHAVE)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, cadastrar, logout }}>
      {children}
    </AuthContext.Provider>
  )
}