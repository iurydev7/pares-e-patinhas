
import { useEffect, useState } from 'react'
import api from '../services/api'
import { AuthContext } from './AuthContext'

const CHAVE = 'pp_usuario'
const TEMPO_SESSAO = 10 * 1000 
function lerUsuarioSalvo() {
  try {
    const salvo = localStorage.getItem(CHAVE)

    if (!salvo) return null

    const sessao = JSON.parse(salvo)

    if (
      !sessao.usuario ||
      typeof sessao.expiraEm !== 'number' ||
      Date.now() >= sessao.expiraEm
    ) {
      localStorage.removeItem(CHAVE)
      return null
    }

    return sessao.usuario
  } catch {
    localStorage.removeItem(CHAVE)
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(lerUsuarioSalvo)

  function logout() {
    localStorage.removeItem(CHAVE)
    setUser(null)
  }

  function iniciarSessao(registro) {
    const usuario = {
      id: registro.id,
      name: registro.name,
      email: registro.email,
    }

    const sessao = {
      usuario,
      expiraEm: Date.now() + TEMPO_SESSAO,
    }

    localStorage.setItem(CHAVE, JSON.stringify(sessao))
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

  async function cadastrar(nome, email, senha) {
    const emailLimpo = email.trim().toLowerCase()

    const existentes = await api.get('/users', {
      params: { email: emailLimpo },
    })

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

  useEffect(() => {
    if (!user) return

    const sessaoSalva = localStorage.getItem(CHAVE)

    if (!sessaoSalva) {
      return
    }

    let expiraEm

    try {
      expiraEm = JSON.parse(sessaoSalva).expiraEm
    } catch {
      return
    }

    const tempoRestante = expiraEm - Date.now()

    if (tempoRestante <= 0) {
      return
    }

    const timer = setTimeout(() => {
      logout()
    }, tempoRestante)

    return () => clearTimeout(timer)
  }, [user])

  return (
    <AuthContext.Provider
      value={{ user, login, cadastrar, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
