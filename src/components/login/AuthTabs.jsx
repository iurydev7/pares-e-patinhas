import { useState } from 'react'
import LoginForm from './LoginForm'
import CadastroForm from './CadastroForm'

function AuthTabs({ onLogin, onCadastrar, onSucesso }) {
  const [aba, setAba] = useState('entrar')

  return (
    <div className="login-painel">
      <div className="login-abas" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={aba === 'entrar'}
          className={aba === 'entrar' ? 'login-aba login-aba--ativa' : 'login-aba'}
          onClick={() => setAba('entrar')}
        >
          Entrar
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={aba === 'criar'}
          className={aba === 'criar' ? 'login-aba login-aba--ativa' : 'login-aba'}
          onClick={() => setAba('criar')}
        >
          Criar conta
        </button>
      </div>

      {aba === 'entrar' ? (
        <LoginForm onLogin={onLogin} onSucesso={onSucesso} />
      ) : (
        <CadastroForm onCadastrar={onCadastrar} onSucesso={onSucesso} />
      )}
    </div>
  )
}

export default AuthTabs