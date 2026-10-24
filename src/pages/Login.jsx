import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoginHero from '../components/login/LoginHero'
import LoginForm from '../components/login/LoginForm'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  function irParaMeuPet() {
    navigate('/meu-pet', { replace: true })
  }

  return (
    <div className="login-page">
      <LoginHero />
      <LoginForm onLogin={login} onSucesso={irParaMeuPet} />
    </div>
  )
}

export default Login