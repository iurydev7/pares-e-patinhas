import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaPaw,
  FaShareAlt,
  FaTimes,
} from "react-icons/fa";

import pets from "../data/pets";
import { useAuth } from "../context/useAuth";
import { usePetAtivo } from "../context/usePetAtivo";
import {
  lerFilaFarejar,
  removerDaFilaFarejar,
} from "../services/farejarStorage";

import "./MeuPet.css";
import "./PerfilPet.css";

const matchIds = ["5"];

function PerfilPet() {
  const { petId } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { petAtivo } = usePetAtivo();

  const [indiceFoto, setIndiceFoto] = useState(0);
  const [aviso, setAviso] = useState("");

  const pet = pets.find((item) => String(item.id) === String(petId));

  const tutorId = String(user?.id ?? user?.email ?? "visitante");

  const fotos = pet
    ? [
        ...new Set(
          [
            pet.imagem,
            ...(Array.isArray(pet.fotos)
              ? pet.fotos.map((foto) =>
                  typeof foto === "string" ? foto : foto?.imagem || foto?.url,
                )
              : []),
          ].filter((foto) => typeof foto === "string" && foto.trim()),
        ),
      ]
    : [];

  const fotoAtiva = fotos[indiceFoto] || fotos[0];

  const disponivel = Boolean(
    petAtivo &&
    pet &&
    lerFilaFarejar(tutorId, petAtivo.id).some(
      (item) => String(item.id) === String(pet.id),
    ),
  );

  function decidir(tipo) {
    if (!pet || !petAtivo) return;

    try {
      const resultado = removerDaFilaFarejar(tutorId, petAtivo.id, pet.id);

      if (!resultado.alterou) {
        setAviso("Este pet não está mais disponível na sua fila.");
        return;
      }

      const houveMatch = tipo === "curtir" && matchIds.includes(String(pet.id));

      navigate("/farejar", {
        replace: true,
        state: houveMatch ? { matchPetId: pet.id } : null,
      });
    } catch {
      setAviso("Não foi possível registrar sua decisão.");
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

  if (!pet) {
    return (
      <main className="container py-5 text-center">
        <h1 className="h3 fw-bold">Perfil não encontrado</h1>

        <p className="text-muted">
          Este animal não está disponível nos dados atuais.
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
              disabled={!disponivel}
            >
              <FaTimes className="me-2" aria-hidden="true" />
              Passar
            </button>

            <button
              type="button"
              className="btn perfil-pet-patinha"
              onClick={() => decidir("curtir")}
              disabled={!disponivel}
            >
              <FaPaw className="me-2" aria-hidden="true" />
              Dar patinha
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
