import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaEdit, FaTrashAlt, FaShareAlt, FaArrowLeft } from "react-icons/fa";
import { useAuth } from "../context/useAuth";
import { usePetAtivo } from "../context/usePetAtivo";
import "./MeuPet.css";

const nomesGenero = {
  macho: "Macho",
  femea: "Fêmea",
};

const nomesPorte = {
  pequeno: "Pequeno",
  medio: "Médio",
  grande: "Grande",
};

function carregarDadosTutor(user) {
  const identificador = user?.id ?? user?.email ?? "visitante";
  const chaveTutor = `tutor-editado-${identificador}`;

  const dadosIniciais = {
    name: user?.name || "",
    email: user?.email || "",
    cidade: user?.cidade || "",
    estado: user?.estado || "",

    foto:
      String(user?.id) === "1" &&
      user?.email?.toLowerCase() === "carlinhos.jesus@gmail.com"
        ? "/uploads/tutores/Carlinhos-jesus.png"
        : user?.foto || "",
  };

  try {
    const salvo = localStorage.getItem(chaveTutor);

    if (salvo) {
      const dados = JSON.parse(salvo);

      if (dados && typeof dados === "object" && !Array.isArray(dados)) {
        return {
          name: dados.name ?? dadosIniciais.name,
          email: dados.email ?? dadosIniciais.email,
          cidade: dados.cidade ?? dadosIniciais.cidade,
          estado: dados.estado ?? dadosIniciais.estado,
          foto:
            typeof dados.foto === "string" ? dados.foto : dadosIniciais.foto,
        };
      }
    }
  } catch {
    return dadosIniciais;
  }

  return dadosIniciais;
}

function PerfilPet({ pet, pets, petAtivo, excluirPet, user }) {
  const navigate = useNavigate();

  const [indiceFoto, setIndiceFoto] = useState(0);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [erro, setErro] = useState("");
  const [avisoCompartilhamento, setAvisoCompartilhamento] = useState("");

  const dadosTutor = carregarDadosTutor(user);

  const fotos = [
    ...new Set(
      [
        pet.foto,
        ...(Array.isArray(pet.fotos)
          ? pet.fotos.map((foto) =>
              typeof foto === "string" ? foto : foto?.imagem || foto?.url,
            )
          : []),
      ].filter((foto) => typeof foto === "string" && foto.trim()),
    ),
  ];

  const fotoAtiva = fotos[indiceFoto] || fotos[0];

  const ativo = String(petAtivo?.id) === String(pet.id);

  const outrosPets = pets.filter(
    (outro) => String(outro.id) !== String(pet.id),
  );

  const idade =
    pet.idade === undefined || pet.idade === null || pet.idade === ""
      ? "Não informada"
      : `${pet.idade} ${Number(pet.idade) === 1 ? "ano" : "anos"}`;

  const genero = nomesGenero[pet.genero] || pet.genero || "Não informado";

  const porte = nomesPorte[pet.porte] || pet.porte || "Não informado";

  const vacinas =
    pet.vacinas === "sim"
      ? "Em dia"
      : pet.vacinas === "nao"
        ? "Não estão em dia"
        : "Não informado";

  const descricao =
    typeof pet.descricao === "string" && pet.descricao.trim()
      ? pet.descricao
      : pet.personalidade || "";

  async function compartilharPerfil() {
    const url = window.location.href;

    setAvisoCompartilhamento("");

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Conheça ${pet.nome} | Pares & Patinhas`,
          text: `Conheça o perfil de ${pet.nome}!`,
          url,
        });

        return;
      } catch (falha) {
        if (falha.name === "AbortError") {
          return;
        }
      }
    }

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Área de transferência indisponível.");
      }

      await navigator.clipboard.writeText(url);

      setAvisoCompartilhamento(
        "Link copiado! Esta página ainda é privada e só pode ser aberta pela sua conta neste navegador.",
      );
    } catch {
      setAvisoCompartilhamento(
        "Não foi possível copiar automaticamente. Copie o endereço da barra do navegador.",
      );
    }
  }

  function excluirPerfil() {
    try {
      excluirPet(pet.id);
      navigate("/minha-conta", { replace: true });
    } catch (falha) {
      setErro(
        falha instanceof Error
          ? falha.message
          : "Não foi possível excluir o pet.",
      );
    }
  }

  return (
    <>
      <main className="container py-5 meu-pet-pagina">
        <div className="mb-4">
          <Link to="/minha-conta" className="meu-pet-voltar">
            <FaArrowLeft aria-hidden="true" />
            <span>Voltar para Meus Pets</span>
          </Link>
        </div>

        <div className="row g-4">
          <section className="col-12 col-lg-6">
            <div className="foto-principal-pet rounded-4">
              {fotoAtiva ? (
                <img
                  src={fotoAtiva}
                  alt={`Foto principal de ${pet.nome}`}
                  className="foto-perfil-proprio-pet"
                />
              ) : (
                <div className="meu-pet-sem-foto">
                  <span aria-hidden="true">🐾</span>
                  <p>Nenhuma foto cadastrada</p>
                </div>
              )}
            </div>

            {fotos.length > 1 && (
              <div className="galeria-miniaturas">
                {fotos.map((foto, index) => (
                  <button
                    type="button"
                    key={`${index}-${foto.slice(0, 30)}`}
                    className={`miniatura-pet ${
                      indiceFoto === index ? "miniatura-ativa" : ""
                    }`}
                    onClick={() => setIndiceFoto(index)}
                    aria-label={`Visualizar foto ${index + 1} de ${pet.nome}`}
                    aria-pressed={indiceFoto === index}
                  >
                    <img
                      src={foto}
                      alt={`Miniatura ${index + 1} de ${pet.nome}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="col-12 col-lg-6">
            <div className="d-flex gap-2 mb-2 flex-wrap">
              <span className="badge rounded-pill text-dark badge-passeios">
                Meu pet
              </span>

              {ativo && (
                <span className="badge rounded-pill text-dark badge-vacinas">
                  🐾 Pet ativo
                </span>
              )}

              {pet.vacinas === "sim" && (
                <span className="badge rounded-pill text-dark badge-vacinas">
                  Vacinas em dia
                </span>
              )}
            </div>

            <h1 className="nome-pet">{pet.nome}</h1>

            <p>{pet.raca || "Raça não informada"}</p>

            <div className="row g-2">
              <div className="col-6 col-md-3">
                <div className="border rounded-3 p-3 h-100 meu-pet-info-box">
                  <small className="text-muted d-block">IDADE</small>
                  <div className="fw-bold">{idade}</div>
                </div>
              </div>

              <div className="col-6 col-md-3">
                <div className="border rounded-3 p-3 h-100 meu-pet-info-box">
                  <small className="text-muted d-block">PORTE</small>
                  <div className="fw-bold">{porte}</div>
                </div>
              </div>

              <div className="col-6 col-md-3">
                <div className="border rounded-3 p-3 h-100 meu-pet-info-box">
                  <small className="text-muted d-block">SEXO</small>
                  <div className="fw-bold">{genero}</div>
                </div>
              </div>

              <div className="col-6 col-md-3">
                <div className="border rounded-3 p-3 h-100 meu-pet-info-box">
                  <small className="text-muted d-block">VACINAÇÃO</small>
                  <div className="fw-bold">{vacinas}</div>
                </div>
              </div>
            </div>

            <div className="border rounded-3 p-3 mt-2 meu-pet-descricao-box">
              <small className="text-muted d-block mb-2">DESCRIÇÃO</small>

              <p className="mb-0">
                {descricao ||
                  "O tutor ainda não adicionou uma descrição para este pet."}
              </p>
            </div>

            <div className="meu-pet-acoes d-flex flex-wrap gap-2 mt-4">
              <Link
                to={`/editar-pet/${encodeURIComponent(String(pet.id))}`}
                className="btn botao-patinha"
              >
                <FaEdit className="me-2" aria-hidden="true" />
                Editar Pet
              </Link>

              <button
                type="button"
                className="btn botao-excluir-pet"
                onClick={() => {
                  setErro("");
                  setConfirmarExclusao(true);
                }}
              >
                <FaTrashAlt className="me-2" aria-hidden="true" />
                Excluir Pet
              </button>

              <button
                type="button"
                className="btn botao-compartilhar"
                onClick={compartilharPerfil}
              >
                <FaShareAlt className="me-2" aria-hidden="true" />
                Compartilhar perfil
              </button>
            </div>

            {avisoCompartilhamento && (
              <p className="small text-muted mt-3" role="status">
                {avisoCompartilhamento}
              </p>
            )}
          </section>
        </div>

        <div className="row g-3 mt-3">
          <div className="col-12 col-lg-6">
            <div className="cartao-tutor cartao-tutor-destaque d-flex align-items-center gap-3">
              <div
                className={`icone-tutor ${
                  dadosTutor.foto ? "icone-tutor-com-foto" : ""
                }`}
                style={
                  dadosTutor.foto
                    ? {
                        width: 64,
                        height: 64,
                        minWidth: 64,
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        overflow: "hidden",
                        flexShrink: 0,
                      }
                    : undefined
                }
              >
                {dadosTutor.foto ? (
                  <img
                    src={dadosTutor.foto}
                    alt={`Foto do tutor ${dadosTutor.name || ""}`.trim()}
                    width="64"
                    height="64"
                    style={{
                      display: "block",
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center",
                      borderRadius: "50%",
                    }}
                  />
                ) : (
                  "👤"
                )}
              </div>

              <div style={{ minWidth: 0, overflowWrap: "anywhere" }}>
                <small>TUTOR RESPONSÁVEL</small>

                <h3 className="h6 fw-bold mb-1">
                  {dadosTutor.name || "Não informado"}
                </h3>

                <small className="d-block mb-2">Responsável pelo pet</small>

                <small className="d-block">
                  <strong>E-mail:</strong> {dadosTutor.email || "Não informado"}
                </small>

                <small className="d-block">
                  <strong>Cidade:</strong>{" "}
                  {dadosTutor.cidade || "Não informado"}
                </small>

                <small className="d-block">
                  <strong>Estado:</strong>{" "}
                  {dadosTutor.estado || "Não informado"}
                </small>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="cartao-seguranca">
              <h3 className="h6 fw-bold">Segurança e proteção animal</h3>

              <p className="small">
                Mantenha os dados e as informações de saúde do seu pet
                atualizados. Todo encontro deve acontecer em local seguro, com
                os tutores presentes.
              </p>
            </div>
          </div>
        </div>

        {outrosPets.length > 0 && (
          <section className="mt-5">
            <h2 className="titulo-secao mb-3">Seus outros pets</h2>

            <div className="row g-3">
              {outrosPets.map((outro) => (
                <div className="col-12 col-md-6 col-lg-4" key={outro.id}>
                  <Link
                    to={`/meu-pet/${encodeURIComponent(String(outro.id))}`}
                    className="text-decoration-none"
                  >
                    <div className="card-pet-raca">
                      <div className="imagem-card-pet">
                        {outro.foto ? (
                          <img src={outro.foto} alt={`Foto de ${outro.nome}`} />
                        ) : (
                          <div className="d-flex align-items-center justify-content-center h-100">
                            <span style={{ fontSize: "40px" }}>🐾</span>
                          </div>
                        )}
                      </div>

                      <div className="conteudo-card-pet">
                        <h3 className="nome-card-pet">{outro.nome}</h3>

                        <p className="info-card-pet">
                          {outro.raca || "Raça não informada"}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {confirmarExclusao && (
        <div
          className="modal d-block"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-excluir-pet"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1050,
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4">
              <div className="modal-header">
                <h2
                  id="titulo-excluir-pet"
                  className="modal-title fs-5 fw-bold"
                >
                  Excluir {pet.nome}?
                </h2>
              </div>

              <div className="modal-body">
                <p>
                  Deseja realmente excluir o perfil de{" "}
                  <strong>{pet.nome}</strong>?
                </p>

                <p className="text-danger small">
                  Os dados deste pet serão removidos do navegador. Esta ação não
                  poderá ser desfeita.
                </p>

                {erro && (
                  <p className="text-danger" role="alert">
                    {erro}
                  </p>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setConfirmarExclusao(false)}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={excluirPerfil}
                >
                  Sim, excluir pet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MeuPet() {
  const { petId } = useParams();
  const { user } = useAuth();
  const { pets, petAtivo, excluirPet } = usePetAtivo();

  const pet = petId
    ? pets.find((item) => String(item.id) === String(petId))
    : petAtivo;

  if (!pet) {
    return (
      <main className="container py-5 text-center">
        <h1 className="h3 fw-bold">
          {petId ? "Pet não encontrado" : "Nenhum pet ativo"}
        </h1>

        <p className="text-muted">
          Acesse Minha Conta para visualizar ou selecionar um pet.
        </p>

        <Link to="/minha-conta" className="btn btn-primary">
          Ir para Minha Conta
        </Link>
      </main>
    );
  }

  return (
    <PerfilPet
      key={String(pet.id)}
      pet={pet}
      pets={pets}
      petAtivo={petAtivo}
      excluirPet={excluirPet}
      user={user}
    />
  );
}

export default MeuPet;
