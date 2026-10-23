import { Link } from 'react-router-dom'

function Header() {
  return (
    <nav className="navbar navbar-expand bg-dark navbar-dark px-3">
      <Link className="navbar-brand" to="/">TelaViva</Link>
      <div className="navbar-nav">
        <Link className="nav-link" to="/institucional">Institucional</Link>
        <Link className="nav-link" to="/anunciante">Anunciante</Link>
        <Link className="nav-link" to="/admin">Admin</Link>
        <Link className="nav-link" to="/login">Login</Link>
      </div>
    </nav>
  )
}

export default Header