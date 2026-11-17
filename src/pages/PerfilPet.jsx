import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaPaw,
  FaShareAlt,
  FaTimes,
} from "react-icons/fa";

import { useAuth } from "../context/useAuth";
import { usePetAtivo } from "../context/usePetAtivo";
import {
  buscarPetPorId,
  mapearPetFarejar,
  mensagemDeErro,
  registrarInteracao,
} from "../services/farejarService";

import "./MeuPet.css";
import "./PerfilPet.css";

function PerfilPet() {
  const { petId } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { petAtivo } = usePetAtivo();

  const [indiceFoto, setIndiceFoto] = useState(0);
  const [aviso, setAviso] = useState("");
  const [perfil, setPerfil] = useState({
    petId: null,
    pet: null,
    erro: "",
  });
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let ativo = true;

    buscarPetPorId(petId)
      .then((animal) => {
        if (ativo) setPerfil({ petId, pet: animal, erro: "" });
      })
      .catch((falha) => {
        if (ativo) {
          setPerfil({
            petId,
            pet: null,
            erro: mensagemDeErro(
              falha,
              "Não foi possível carregar o perfil.",
            ),
          });
        }
      });

    return () => {
      ativo = false;
    };
  }, [petId]);

  const perfilAtual = String(perfil.petId) === String(petId);
  const pet = perfilAtual ? perfil.pet : null;
  const carregando = !perfilAtual;
  const erroPerfil = perfilAtual ? perfil.erro : "";

  const fotos = pet
    ? [
        ...new Set(
          [
            pet.imagem,
            ...pet.fotos,
          ].filter((foto) => typeof foto === "string" && foto.trim()),
        ),
      ]
    : [];

  const fotoAtiva = fotos[indiceFoto] || fotos[0];

  const disponivel = Boolean(
    petAtivo &&
    pet &&
    String(pet.tutorId) !== String(user?.id) &&
    pet.ativo !== false &&
    pet.disponivel !== false,
  );

  async function decidir(tipo) {
    if (!disponivel || enviando) return;

    setEnviando(true);
    setAviso("");
    try {
      const resultado = await registrarInteracao(
        petAtivo.id,
        pet.id,
        tipo === "curtir" ? "like" : "dislike",
      );
      navigate("/farejar", {
        replace: true,
        state: resultado.deuMatch
          ? { match: mapearPetFarejar(pet), matchId: resultado.match?.id }
          : null,
      });
    } catch (falha) {
      setAviso(
        mensagemDeErro(falha, "Não foi possível registrar sua decisão."),
      );
    } finally {
      setEnviando(false);
    }
  }

  async function compartilharPerfil() {
    const url = window.location.href;

    setAviso("");

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Conheça ${pet.nome} | Pares & Patinhas`,
          text: `Conheça o perfil de ${pet.nome}!`,
          url,
        });

        return;
      } catch (falha) {
        if (falha.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);

      setAviso(
        "Link copiado! O perfil ainda exige acesso autenticado ao aplicativo.",
      );
    } catch {
      setAviso("Não foi possível copiar o link automaticamente.");
    }
  }

  if (carregando) {
    return (
      <main className="container py-5 text-center">
        <p role="status">Carregando perfil do pet...</p>
      </main>
    );
  }

  if (!pet) {
    return (
      <main className="container py-5 text-center">
        <h1 className="h3 fw-bold">Perfil não encontrado</h1>

        <p className="text-muted">
          {erroPerfil || "Este animal não está disponível."}
        </p>

        <Link to="/farejar" className="btn btn-primary">
          Voltar para Farejar
        </Link>
      </main>
    );
  }

  const idade =
    pet.idade == null
      ? "Não informada"
      : `${pet.idade} ${Number(pet.idade) === 1 ? "ano" : "anos"}`;

  const porte = pet.porte || "Não informado";

  const sexo = pet.sexo || "Não informado";

  const vacinas =
    pet.vacinas === "sim"
      ? "Em dia"
      : pet.vacinas === "nao"
        ? "Não estão em dia"
        : "Não informado";

  const descricao = pet.descricao || "";

  const tutorNome = pet.tutor?.nome || pet.tutorNome || "Não informado";

  return (
    <main className="container py-5 meu-pet-pagina perfil-pet-pagina">
      <div className="mb-4">
        <Link to="/farejar" className="meu-pet-voltar">
          <FaArrowLeft aria-hidden="true" />
          <span>Voltar para Farejar</span>
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
                  key={index}
                  type="button"
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
              Perfil do pet
            </span>

            <span className="badge rounded-pill text-dark badge-vacinas">
              {pet.especie}
            </span>
          </div>

          <h1 className="nome-pet">{pet.nome}</h1>

          <p className="mb-2">{pet.raca || "Raça não informada"}</p>

          <p className="perfil-pet-local mb-3">
            <FaMapMarkerAlt className="me-2" aria-hidden="true" />
            {pet.cidade}, {pet.estado}
          </p>

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
                <div className="fw-bold">{sexo}</div>
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
                "Este pet ainda não possui uma descrição cadastrada."}
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2 mt-3 perfil-pet-acoes">
            <button
              type="button"
              className="btn perfil-pet-passar"
              onClick={() => decidir("passar")}
              disabled={!disponivel || enviando}
            >
              <FaTimes className="me-2" aria-hidden="true" />
              {enviando ? "Registrando..." : "Passar"}
            </button>

            <button
              type="button"
              className="btn perfil-pet-patinha"
              onClick={() => decidir("curtir")}
              disabled={!disponivel || enviando}
            >
              <FaPaw className="me-2" aria-hidden="true" />
              {enviando ? "Registrando..." : "Dar patinha"}
            </button>

            <button
              type="button"
              className="btn perfil-pet-compartilhar"
              onClick={compartilharPerfil}
            >
              <FaShareAlt className="me-2" aria-hidden="true" />
              Compartilhar perfil
            </button>
          </div>

          {!disponivel && (
            <p className="text-muted small mt-3">
              Este pet já não está disponível para uma nova decisão na sua fila
              atual.
            </p>
          )}

          {aviso && (
            <p className="text-muted small mt-3" role="status">
              {aviso}
            </p>
          )}
        </section>
      </div>

      <div className="row g-3 mt-3">
        <div className="col-12 col-lg-6">
          <div className="cartao-tutor cartao-tutor-destaque d-flex align-items-center gap-3">
            <div className="icone-tutor">👤</div>

            <div>
              <small>TUTOR RESPONSÁVEL</small>

              <h3 className="h6 fw-bold mb-1">{tutorNome}</h3>

              <small>
                {tutorNome === "Não informado"
                  ? "Dados do tutor ainda não disponíveis."
                  : "Responsável pelo pet"}
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="cartao-seguranca">
            <h3 className="h6 fw-bold">Segurança e proteção animal</h3>

            <p className="small">
              Todo encontro deve acontecer em local seguro, com os dois tutores
              presentes. Conheça o perfil do animal antes de interagir.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default PerfilPet;
