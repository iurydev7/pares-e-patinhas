import { useState } from 'react'
import FormField from './FormField'

function LoginForm({ onLogin, onSucesso }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviarFormulario(evento) {
    evento.preventDefault()
    setErro('')

    if (!email.trim() || !senha) {
      setErro('Preencha e-mail e senha.')
      return
    }

    setEnviando(true)
    try {
      const deuCerto = await onLogin(email, senha)
      if (deuCerto) {
        onSucesso()
      } else {
        setErro('E-mail ou senha incorretos.')
      }
    } catch {
      setErro('Não foi possível entrar agora. Tente novamente em instantes.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="login-form" onSubmit={enviarFormulario} noValidate>
      <h2 className="login-form__titulo">Que bom te ver de novo</h2>
      <p className="login-form__subtitulo">Entre com seu e-mail e senha.</p>

      <FormField
        id="email"
        label="E-mail"
        type="email"
        value={email}
        onChange={(evento) => setEmail(evento.target.value)}
        placeholder="voce@email.com"
      />
      <FormField
        id="senha"
        label="Senha"
        type="password"
        value={senha}
        onChange={(evento) => setSenha(evento.target.value)}
        placeholder="Sua senha"
      />

      {erro && (
        <p className="login-form__erro" role="alert">
          {erro}
        </p>
      )}

      <button className="login-form__botao" type="submit" disabled={enviando}>
        {enviando ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}

export default LoginForm