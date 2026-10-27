import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import LoginHero from '../components/login/LoginHero'
import AuthTabs from '../components/login/AuthTabs'
import '../components/login/login.css'

function Login() {
  const { user, login, cadastrar } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const origem = location.state?.from

  const destino = 
    origem?.pathname === '/farejar' ||
    origem?.pathname === '/meu-pet' 
      ? origem.pathname + (origem.search || '')
      : '/meu-pet'

function redirecionarAposLogin() {
  navigate(destino, {replace: true})
}

if (user) {
  return <Navigate to={destino} replace />
}

  return (
    <div className="login-page">
      <LoginHero />

      <AuthTabs
        onLogin={login}
        onCadastrar={cadastrar}
        onSucesso={redirecionarAposLogin}
      />
    </div>
  )
}

export default Login