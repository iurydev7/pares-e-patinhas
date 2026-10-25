import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import LoginHero from '../components/login/LoginHero'
import AuthTabs from '../components/login/AuthTabs'
import '../components/login/login.css'

function Login() {
  const { login, cadastrar } = useAuth()
  const navigate = useNavigate()

  function irParaMeuPet() {
    navigate('/meu-pet', { replace: true })
  }

  return (
    <div className="login-page">
      <LoginHero />
      <AuthTabs
        onLogin={login}
        onCadastrar={cadastrar}
        onSucesso={irParaMeuPet}
      />
    </div>
  )
}

export default Login