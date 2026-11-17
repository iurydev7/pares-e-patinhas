import { useEffect, useRef, useState } from 'react'

const INTERVALO_REENVIO = 60

// A API responde erros como { success: false, message, code }.
function mensagemDeErro(falha, padrao) {
  return falha?.response?.data?.message || padrao
}

// Etapa 2 do cadastro: o usuário digita o código de 6 dígitos recebido por e-mail.
function VerificarEmailForm({ email, onVerificar, onReenviar, onSucesso, onVoltar, reenviarAoAbrir = false }) {
  const [codigo, setCodigo] = useState('')
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [espera, setEspera] = useState(INTERVALO_REENVIO)
  const jaReenviou = useRef(false)

  // Contagem regressiva para liberar o botão "Reenviar código".
  useEffect(() => {
    if (espera <= 0) return
    const timer = setTimeout(() => setEspera((segundos) => segundos - 1), 1000)
    return () => clearTimeout(timer)
  }, [espera])

  // Quem chega aqui pelo login (conta ainda não confirmada) recebe um código novo.
  // Se o último código saiu há menos de 60s a API recusa (429) e o anterior continua valendo.
  useEffect(() => {
    if (!reenviarAoAbrir || jaReenviou.current) return
    jaReenviou.current = true
    onReenviar(email).catch(() => {})
  }, [reenviarAoAbrir, onReenviar, email])

  async function enviarFormulario(evento) {
    evento.preventDefault()
    setErro('')
    setAviso('')

    if (!/^\d{6}$/.test(codigo)) {
      setErro('Digite o código de 6 dígitos.')
      return
    }

    setEnviando(true)
    try {
      await onVerificar(email, codigo)
      onSucesso()
    } catch (falha) {
      setErro(mensagemDeErro(falha, 'Não foi possível confirmar agora. Tente novamente em instantes.'))
    } finally {
      setEnviando(false)
    }
  }

  async function reenviar() {
    setErro('')
    setAviso('')
    try {
      await onReenviar(email)
      setCodigo('')
      setAviso('Enviamos um novo código. O anterior não vale mais.')
      setEspera(INTERVALO_REENVIO)
    } catch (falha) {
      setErro(mensagemDeErro(falha, 'Não foi possível reenviar agora. Tente novamente em instantes.'))
    }
  }

  return (
    <form className="login-form" onSubmit={enviarFormulario} noValidate>
      <h2 className="login-form__titulo">Confirme seu e-mail</h2>
      <p className="login-form__subtitulo">
        Enviamos um código de 6 dígitos para <strong>{email}</strong>. Ele vale por 15 minutos.
        Não achou? Olhe também a caixa de spam.
      </p>

      <div className="form-field">
        <label className="form-field__label" htmlFor="verificacao-codigo">
          Código de verificação
        </label>
        <input
          className="form-field__input form-field__input--codigo"
          id="verificacao-codigo"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={codigo}
          onChange={(evento) => setCodigo(evento.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          autoFocus
        />
      </div>

      {erro && (
        <p className="login-form__erro" role="alert">
          {erro}
        </p>
      )}
      {aviso && (
        <p className="login-form__aviso" role="status">
          {aviso}
        </p>
      )}

      <button className="login-form__botao" type="submit" disabled={enviando}>
        {enviando ? 'Confirmando...' : 'Confirmar e-mail'}
      </button>

      <div className="login-form__acoes">
        <button type="button" className="login-form__link" onClick={reenviar} disabled={espera > 0}>
          {espera > 0 ? `Reenviar código em ${espera}s` : 'Reenviar código'}
        </button>
        <button type="button" className="login-form__link" onClick={onVoltar}>
          Usar outro e-mail
        </button>
      </div>
    </form>
  )
}

export default VerificarEmailForm
