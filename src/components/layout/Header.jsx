import { Link } from 'react-router-dom'

function Header() {
  return (
    <nav className="navbar navbar-expand /*bg-dark navbar-dark*/ px-3">
      <Link className="navbar-brand" to="/">Pares & Patinhas</Link>
      <div className="navbar-nav">
        <Link className="nav-link" to="/meu-pet">Meu Pet</Link>
        <Link className="nav-link" to="/farejar">Farejar</Link>
        <Link className="nav-link" to="/login">Login</Link>
      </div>
    </nav>
  )
}

export default Header