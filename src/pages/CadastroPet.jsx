import "./CadastroPet.css";

function CadastroPet() {
  return (
    <main className="cadastro-pet py-5">
      <div className="container">
        <div className="cadastro-pet-conteudo">
          <div className="cadastro-pet-cabecalho">
            <h1 className="fw-bold">Cadastrar meu pet</h1>

            <p>
              Preencha as informações abaixo para criar o perfil do seu pet no
              Pares & Patinhas.
            </p>
          </div>

          <div className="formulario-pet">
            <h2 className="fw-bold mb-4">Informações do pet</h2>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label htmlFor="nome" className="form-label">
                  Nome do pet
                </label>

                <input
                  type="text"
                  id="nome"
                  className="form-control"
                  placeholder="Ex: Bento"
                />
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="raca" className="form-label">
                  Raça
                </label>

                <input
                  type="text"
                  id="raca"
                  className="form-control"
                  placeholder="Ex: Border Collie"
                />
              </div>

              <div className="col-12 col-md-4">
                <label htmlFor="idade" className="form-label">
                  Idade (anos)
                </label>

                <input
                  type="number"
                  id="idade"
                  min="0"
                  className="form-control"
                  placeholder="Ex: 2"
                />
              </div>

              <fieldset className="col-12 col-md-4">
                <legend className="form-label">Gênero</legend>

                <div className="d-flex gap-4 flex-wrap">
                  <div className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="genero"
                      id="genero-macho"
                      value="macho"
                    />

                    <label className="form-check-label" htmlFor="genero-macho">
                      Macho
                    </label>
                  </div>

                  <div className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="genero"
                      id="genero-femea"
                      value="femea"
                    />

                    <label className="form-check-label" htmlFor="genero-femea">
                      Fêmea
                    </label>
                  </div>
                </div>
              </fieldset>

              <div className="col-12 col-md-4">
                <label htmlFor="porte" className="form-label">
                  Porte
                </label>

                <select id="porte" className="form-select" defaultValue="">
                  <option value="" disabled>
                    Selecione
                  </option>

                  <option value="pequeno">Pequeno</option>

                  <option value="medio">Médio</option>

                  <option value="grande">Grande</option>
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="vacinas" className="form-label">
                  Vacinas em dia?
                </label>

                <select id="vacinas" className="form-select" defaultValue="">
                  <option value="" disabled>
                    Selecione
                  </option>

                  <option value="sim">Sim</option>

                  <option value="nao">Não</option>
                </select>
              </div>

              <div className="col-12">
                <label htmlFor="personalidade" className="form-label">
                  Personalidade do pet
                </label>

                <textarea
                  id="personalidade"
                  className="form-control"
                  rows="4"
                  placeholder="Conte um pouco sobre o seu pet..."
                />
              </div>

              <div className="col-12">
                <label htmlFor="fotos" className="form-label">
                  Fotos do pet
                </label>

                <input
                  type="file"
                  id="fotos"
                  className="form-control"
                  accept="image/*"
                  multiple
                />

                <small className="text-muted">
                  Selecione as fotos que deseja adicionar.
                </small>
              </div>
            </div>

            <div className="cadastro-pet-acoes mt-4">
              <button type="button" className="btn-cadastrar-pet">
                Cadastrar meu pet
              </button>
            </div>

            <p className="text-muted small mt-3 mb-0">
              Protótipo visual: o cadastro ainda não salva dados.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default CadastroPet;
