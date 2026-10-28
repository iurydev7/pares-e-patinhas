import logo from "../../../public/petmatch-symbol.png";
import { Link } from "react-router-dom";

function PataIcon() {
  return (
    <svg className="login-hero__pata" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="14" cy="28" r="6.5" fill="currentColor" />
      <circle cx="26" cy="15" r="6.5" fill="currentColor" />
      <circle cx="40" cy="15" r="6.5" fill="currentColor" />
      <circle cx="52" cy="28" r="6.5" fill="currentColor" />
      <path
        d="M32 29C22 29 14 41 16 49C18 57 26 56 32 53C38 56 46 57 48 49C50 41 42 29 32 29Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LoginHero() {
  return (
    <section className="login-hero">
      <Link to="/" className="login-hero__marca">
        <img src={logo} alt="" className="login-hero__imagem" />

        <span>
          Pares <span className="login-hero__e">&amp;</span> Patinhas
        </span>
      </Link>

      <div className="login-hero__cartoes" aria-hidden="true">
        <span className="login-hero__cartao login-hero__cartao--amarelo">
          <PataIcon />
        </span>
        <span className="login-hero__cartao login-hero__cartao--rosa">
          <PataIcon />
        </span>
      </div>

      <h1 className="login-hero__titulo">Todo pet merece um par.</h1>
      <p className="login-hero__texto">
        Entre para farejar pets por perto e dar patinhas.
      </p>
    </section>
  );
}

export default LoginHero;
