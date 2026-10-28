import { useState } from "react";
import "./MeuPet.css";
import { FaPaw, FaShareAlt } from "react-icons/fa";

const fotosBento = [
  { id: 1, imagem: "/pets/Bento/Bento-1.png" },
  { id: 2, imagem: "/pets/Bento/Bento-2.png" },
  { id: 3, imagem: "/pets/Bento/Bento-3.png" },
  { id: 4, imagem: "/pets/Bento/Bento-4.png" },
];

const MesmaRaca = [
  {
    id: 1,
    nome: "Nina",
    raca: "Border Collie",
    idade: "2 anos",
    genero: "Fêmea",
    imagem: "/pets/Nina.png",
  },
  {
    id: 2,
    nome: "Zeca",
    raca: "Golden Retriever",
    idade: "5 anos",
    genero: "macho",
    imagem: "/pets/Zeca.png",
  },
  {
    id: 3,
    nome: "Maya",
    raca: "Border Collie",
    idade: "2 anos",
    genero: "Fêmea",
    imagem: "/pets/Maya.png",
  },
];

function MeuPet() {
  const [fotoAtiva, setFotoAtiva] = useState(fotosBento[0].imagem);

  return (
    <main className="container py-5">
      <div className="row g-4">
        <section className="col-12 col-lg-6">
          <div className="foto-principal-pet rounded-4">
            <img src={fotoAtiva} alt="Foto principal do Bento" />
          </div>
          <div className="galeria-miniaturas">
            {fotosBento.map((foto, index) => (
              <button
                type="button"
                key={foto.id}
                className={`miniatura-pet ${
                  fotoAtiva === foto.imagem ? "miniatura-ativa" : ""
                }`}
                onClick={() => setFotoAtiva(foto.imagem)}
                aria-label={`Visualizar foto ${index + 1} do Bento`}
                aria-pressed={fotoAtiva === foto.imagem}
              >
                <img
                  src={foto.imagem}
                  alt={`Miniatura ${index + 1} do Bento`}
                />
              </button>
            ))}
          </div>
        </section>

        <section className="col-12 col-lg-6">
          <div className="d-flex gap-2 mb-2">
            <span className="badge rounded-pill text-dark badge-passeios">
              Passeios
            </span>

            <span className="badge rounded-pill text-dark badge-vacinas">
              Vacinas em dia
            </span>
          </div>

          <h1 className="nome-pet">Bento</h1>
          <p>Border Collie</p>
          <div className="row g-2">
            <div className="col-4">
              <div className="border rounded-3 p-3">
                <small>IDADE</small>
                <div className="fw-bold">3 anos</div>
              </div>
            </div>
            <div className="col-4">
              <div className="border rounded-3 p-3">
                <small>PORTE</small>
                <div className="fw-bold">Grande</div>
              </div>
            </div>
            <div className="col-4">
              <div className="border rounded-3 p-3">
                <small>SEXO</small>
                <div className="fw-bold">Macho</div>
              </div>
            </div>
          </div>
          <div className="border rounded-3 p-3 mt-2">
            <small className="text-muted d-block">DISTÂNCIA</small>
            <strong>2,4 km</strong>
          </div>
          <div className="mt-3">
            <h2 className="h6 fw-bold mb-1">Sobre</h2>
            <p className="text-muted small">
              Bio escrita pelo tutor: jeitinho, rotina, o que o pet gosta de
              fazer.
            </p>
          </div>
          <div className="mt-3">
            <h2 className="h6 fw-bold mb-2">Personalidade</h2>

            <div className="d-flex flex-wrap gap-2">
              <span className="badge-personalidade">Brincalhão</span>
              <span className="badge-personalidade">Sociável</span>
              <span className="badge-personalidade">Ama água</span>
              <span className="badge-personalidade">Ótimo com crianças</span>
            </div>
          </div>
          <div className="d-flex flex-wrap gap-2 mt-3">
            <button type="button" className="btn botao-patinha">
              <FaPaw className="me-2" aria-hidden="true" />
              Dar patinha
            </button>

            <button type="button" className="btn botao-compartilhar">
              <FaShareAlt className="me-2" aria-hidden="true" />
              Compartilhar perfil
            </button>
          </div>
        </section>
      </div>
      <div className="row g-3 mt-3">
        <div className="col-12 col-lg-6">
          <div className="cartao-tutor d-flex align-items-center gap-3">
            <div className="icone-tutor">👤</div>

            <div>
              <small>TUTOR</small>
              <h3 className="h6 fw-bold mb-0">Nome do tutor</h3>
              <small>Perfil verificado</small>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="cartao-seguranca">
            <h3 className="h6 fw-bold">Segurança e proteção animal</h3>

            <p className="small">
              Todo encontro deve acontecer em local público e com os dois
              tutores presentes.
            </p>

            <button type="button" className="btn-denunciar">
              Denunciar este perfil
            </button>
          </div>
        </div>
      </div>
      <section className="mt-5">
        <h2 className="titulo-secao mb-3">Outros Pets</h2>

        <div className="row g-3">
          {MesmaRaca.map((pet) => (
            <div className="col-12 col-md-6 col-lg-4" key={pet.id}>
              <div className="card-pet-raca">
                <div className="imagem-card-pet">
                  <img src={pet.imagem} alt={pet.nome} />
                </div>

                <div className="conteudo-card-pet">
                  <h3 className="nome-card-pet">{pet.nome}</h3>

                  <p className="info-card-pet">
                    {pet.raca} - {pet.idade}, {pet.genero}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default MeuPet;
