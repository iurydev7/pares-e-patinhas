import { useState } from 'react'
import FormField from './FormField'

function CadastroForm({ onCadastrar, onSucesso }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviarFormulario(evento) {
    evento.preventDefault()
    setErro('')

    // Validações no front, antes de chamar a API
    if (!nome.trim() || !email.trim() || !senha || !confirmar) {
      setErro('Preencha todos os campos.')
      return
    }
    if (!email.includes('@') || !email.includes('.')) {
      setErro('Digite um e-mail válido.')
      return
    }
    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (senha !== confirmar) {
      setErro('As senhas não coincidem.')
      return
    }

    setEnviando(true)
    try {
      const criou = await onCadastrar(nome, email, senha)
      if (criou) {
        onSucesso()
      } else {
        setErro('Este e-mail já está cadastrado.')
      }
    } catch {
      setErro('Não foi possível criar a conta agora. Tente novamente em instantes.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="login-form" onSubmit={enviarFormulario} noValidate>
      <h2 className="login-form__titulo">Crie sua conta</h2>
      <p className="login-form__subtitulo">Leva menos de um minuto.</p>

      <FormField
        id="cadastro-nome"
        label="Nome"
        value={nome}
        onChange={(evento) => setNome(evento.target.value)}
        placeholder="Seu nome"
      />
      <FormField
        id="cadastro-email"
        label="E-mail"
        type="email"
        value={email}
        onChange={(evento) => setEmail(evento.target.value)}
        placeholder="voce@email.com"
      />
      <FormField
        id="cadastro-senha"
        label="Senha"
        type="password"
        value={senha}
        onChange={(evento) => setSenha(evento.target.value)}
        placeholder="Mínimo de 6 caracteres"
      />
      <FormField
        id="cadastro-confirmar"
        label="Confirmar senha"
        type="password"
        value={confirmar}
        onChange={(evento) => setConfirmar(evento.target.value)}
        placeholder="Repita a senha"
      />

      {erro && (
        <p className="login-form__erro" role="alert">
          {erro}
        </p>
      )}

      <button className="login-form__botao" type="submit" disabled={enviando}>
        {enviando ? 'Criando conta...' : 'Criar conta'}
      </button>
    </form>
  )
}

export default CadastroForm