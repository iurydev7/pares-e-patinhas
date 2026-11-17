import { Link, Outlet } from "react-router-dom";
import { FaPaw } from "react-icons/fa";
import { usePetAtivo } from "../context/usePetAtivo";

function FarejarGuard() {
  const {
    petAtivo,
    pets,
    carregandoPets,
    erroCarregamentoPets,
  } = usePetAtivo();

  if (carregandoPets) {
    return (
      <main className="container py-5 text-center">
        <p role="status">Carregando os pets da sua conta...</p>
      </main>
    );
  }

  if (erroCarregamentoPets) {
    return (
      <main className="container py-5 text-center">
        <h1 className="h3 fw-bold">Não foi possível carregar seus pets</h1>
        <p className="text-danger" role="alert">
          {erroCarregamentoPets}
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </button>
      </main>
    );
  }

  if (petAtivo) {
    return <Outlet />;
  }

  const possuiPets = pets.length > 0;

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="border rounded-4 bg-white shadow-sm p-4 p-md-5 text-center">
            <FaPaw
              size={48}
              color="#c65383"
              className="mb-4"
              aria-hidden="true"
            />

            <h1 className="h3 fw-bold mb-3">
              {possuiPets
                ? "Selecione um pet para Farejar"
                : "Cadastre seu primeiro pet"}
            </h1>

            <p className="text-muted mb-4">
              {possuiPets
                ? "Você não possui nenhum pet ativo no momento. Acesse Minha Conta e selecione o animal que deseja utilizar para encontrar novos pares."
                : "Para começar a conhecer outros pets, primeiro você precisa cadastrar seu animal no Pares & Patinhas."}
            </p>

            <Link
              to={possuiPets ? "/minha-conta" : "/cadastro-pet"}
              className="btn btn-primary rounded-3 px-4 py-2 fw-semibold"
            >
              {possuiPets ? "Selecionar meu pet" : "Cadastrar meu pet"}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default FarejarGuard;
