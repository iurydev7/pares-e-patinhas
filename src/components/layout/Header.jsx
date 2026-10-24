import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Header.css';

export default function Header() {
  return (
    <header className="header-container">
      {/* Logotipo e Badge */}
      <div className="header-logo">
        <Link to="/" className="logo-title">Pares & Patinhas</Link>
        <span className="logo-badge">Todo pet merece um par</span>
      </div>

      {/* Navegação Central */}
      <nav className="header-nav">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Início
        </NavLink>
        <NavLink to="/farejar" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Farejar
        </NavLink>
        <NavLink to="/meu-pet" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Meu pet
        </NavLink>
      </nav>

      {/* Botão de Entrar */}
      <div className="header-user">
        <Link to="/login" className="user-profile">
          <div className="avatar-placeholder">🐾</div>
          <span className="user-name">Entrar</span>
        </Link>
      </div>
    </header>
  );
}