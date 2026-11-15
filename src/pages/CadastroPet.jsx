import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { usePetAtivo } from "../context/usePetAtivo";
import api from "../services/api";
import "./CadastroPet.css";

const LIMITE_FOTOS = 5;
const LIMITE_DESCRICAO = 1000;

const estadosBrasil = [
  ["AC", "Acre"],
  ["AL", "Alagoas"],
  ["AP", "Amapá"],
  ["AM", "Amazonas"],
  ["BA", "Bahia"],
  ["CE", "Ceará"],
  ["DF", "Distrito Federal"],
  ["ES", "Espírito Santo"],
  ["GO", "Goiás"],
  ["MA", "Maranhão"],
  ["MT", "Mato Grosso"],
  ["MS", "Mato Grosso do Sul"],
  ["MG", "Minas Gerais"],
  ["PA", "Pará"],
  ["PB", "Paraíba"],
  ["PR", "Paraná"],
  ["PE", "Pernambuco"],
  ["PI", "Piauí"],
  ["RJ", "Rio de Janeiro"],
  ["RN", "Rio Grande do Norte"],
  ["RS", "Rio Grande do Sul"],
  ["RO", "Rondônia"],
  ["RR", "Roraima"],
  ["SC", "Santa Catarina"],
  ["SP", "São Paulo"],
  ["SE", "Sergipe"],
  ["TO", "Tocantins"],
];

function carregarFotos(pet) {
  if (!pet) return [];

  const imagens = [pet.foto, ...(Array.isArray(pet.fotos) ? pet.fotos : [])]
    .map((item) =>
      typeof item === "string" ? item : item?.imagem || item?.url || "",
    )
    .filter(Boolean);

  return [...new Set(imagens)].slice(0, LIMITE_FOTOS).map((src, index) => ({
    id: `salva-${index}`,
    src,
  }));
}

async function prepararFoto(arquivo) {
  const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];

  if (!tiposPermitidos.includes(arquivo.type)) {
    throw new Error("Selecione imagens JPG, PNG ou WebP.");
  }

  if (arquivo.size > 10 * 1024 * 1024) {
    throw new Error("Cada imagem deve ter no máximo 10 MB.");
  }

  const imagem = await createImageBitmap(arquivo);

  try {
    const escala = Math.min(1, 600 / Math.max(imagem.width, imagem.height));

    const canvas = document.createElement("canvas");

    canvas.width = Math.max(1, Math.round(imagem.width * escala));

    canvas.height = Math.max(1, Math.round(imagem.height * escala));

    const contexto = canvas.getContext("2d");

    if (!contexto) {
      throw new Error("Não foi possível processar a imagem.");
    }

    contexto.fillStyle = "#ffffff";

    contexto.fillRect(0, 0, canvas.width, canvas.height);

    contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg", 0.7);
  } finally {
    imagem.close();
  }
}

function FormularioPet({ petId, petOriginal, adicionarPet, atualizarPet }) {
  const navigate = useNavigate();
  const emEdicao = Boolean(petId);

  const [fotos, setFotos] = useState(() => carregarFotos(petOriginal));

  const [descricao, setDescricao] = useState(
    (petOriginal?.descricao || petOriginal?.personalidade || "").slice(
      0,
      LIMITE_DESCRICAO,
    ),
  );

  const [erro, setErro] = useState("");
  const [processando, setProcessando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function selecionarFotos(evento) {
    const arquivos = Array.from(evento.target.files || []);

    evento.target.value = "";

    if (arquivos.length === 0) return;

    if (fotos.length + arquivos.length > LIMITE_FOTOS) {
      setErro(`Você pode cadastrar até ${LIMITE_FOTOS} fotos por pet.`);
      return;
    }

    setErro("");
    setProcessando(true);

    try {
      const novasFotos = await Promise.all(
        arquivos.map(async (arquivo) => ({
          id: crypto.randomUUID(),
          src: await prepararFoto(arquivo),
        })),
      );

      setFotos((anteriores) => [...anteriores, ...novasFotos]);
    } catch (falha) {
      setErro(
        falha instanceof Error
          ? falha.message
          : "Não foi possível carregar as fotos.",
      );
    } finally {
      setProcessando(false);
    }
  }

  function moverFoto(origem, destino) {
    setFotos((anteriores) => {
      if (
        origem < 0 ||
        destino < 0 ||
        origem >= anteriores.length ||
        destino >= anteriores.length ||
        origem === destino
      ) {
        return anteriores;
      }

      const lista = [...anteriores];
      const [fotoMovida] = lista.splice(origem, 1);

      lista.splice(destino, 0, fotoMovida);

      return lista;
    });
  }

  function definirPrincipal(indice) {
    moverFoto(indice, 0);
  }

  function removerFoto(id) {
    setFotos((anteriores) => anteriores.filter((foto) => foto.id !== id));
  }

  function receberFotoArrastada(evento, destino) {
    evento.preventDefault();

    const origemTexto = evento.dataTransfer.getData("text/plain");

    if (!origemTexto) return;

    const origem = Number(origemTexto);

    if (!Number.isInteger(origem)) return;

    moverFoto(origem, destino);
  }

  async function salvarPet(evento) {
    evento.preventDefault();

    if (salvando || processando) return;

    const formulario = new FormData(evento.currentTarget);

    setErro("");
    setSalvando(true);

    const imagensOrdenadas = fotos.map((foto) => foto.src);

    const dadosPet = {
      nome: String(formulario.get("nome") || "").trim(),

      especie: String(formulario.get("especie") || ""),

      raca: String(formulario.get("raca") || "").trim(),

      idade: Number(formulario.get("idade")),

      genero: String(formulario.get("genero") || ""),

      porte: String(formulario.get("porte") || ""),

      vacinas: String(formulario.get("vacinas") || ""),

      cidade: String(formulario.get("cidade") || "").trim(),

      estado: String(formulario.get("estado") || ""),

      descricao: descricao.slice(0, LIMITE_DESCRICAO).trim(),

      foto: imagensOrdenadas[0] || "",

      fotos: imagensOrdenadas,
    };

    const dadosAnimalApi = {
      nome: dadosPet.nome,
      especie: dadosPet.especie,
      sexo: dadosPet.genero,
      raca: dadosPet.raca,
      idadeAnos: dadosPet.idade,
      idadeMeses: 0,
      porte: dadosPet.porte,
      descricao: dadosPet.descricao,
      cidade: dadosPet.cidade,
      estado: dadosPet.estado,
    };

    try {
      if (emEdicao) {
        if (petOriginal?.apiId) {
          await api.put(`/animals/${petOriginal.apiId}`, dadosAnimalApi);
          atualizarPet(petId, dadosPet);
        } else {
          const resposta = await api.post("/animals", dadosAnimalApi);

          atualizarPet(petId, {
            ...dadosPet,
            apiId: resposta.data.id,
          });
        }

        navigate(`/meu-pet/${encodeURIComponent(String(petId))}`);
      } else {
        const resposta = await api.post("/animals", dadosAnimalApi);

        adicionarPet({
          ...dadosPet,
          apiId: resposta.data.id,
        });

        navigate("/minha-conta");
      }
    } catch (falha) {
      setErro(
        falha?.name === "QuotaExceededError"
          ? "O armazenamento do navegador está cheio. Tente usar fotos menores."
          : falha?.response?.data?.erro ||
              falha?.response?.data?.message ||
              (falha instanceof Error
                ? falha.message
                : "Não foi possível salvar o pet."),
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="cadastro-pet py-5">
      <div className="container">
        <div className="cadastro-pet-conteudo">
          <div className="cadastro-pet-cabecalho">
            <h1 className="fw-bold">
              {emEdicao
                ? `Editar ${petOriginal?.nome || "Pet"}`
                : "Cadastrar meu pet"}
            </h1>

            <p>
              {emEdicao
                ? "Atualize as informações e organize as fotos do seu pet."
                : "Preencha as informações e escolha as fotos do perfil do seu pet."}
            </p>
          </div>

          {emEdicao && !petOriginal ? (
            <div className="formulario-pet">
              <h2 className="h5">Pet não encontrado</h2>

              <Link to="/minha-conta" className="btn btn-outline-secondary">
                Voltar para Meus Pets
              </Link>
            </div>
          ) : (
            <form className="formulario-pet" onSubmit={salvarPet}>
              <h2 className="fw-bold mb-4">Informações do pet</h2>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label htmlFor="nome" className="form-label">
                    Nome do pet
                  </label>

                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    className="form-control"
                    defaultValue={petOriginal?.nome || ""}
                    maxLength={120}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="especie" className="form-label">
                    Espécie
                  </label>

                  <select
                    id="especie"
                    name="especie"
                    className="form-select"
                    defaultValue={petOriginal?.especie || ""}
                    required
                  >
                    <option value="" disabled>
                      Selecione
                    </option>

                    <option value="Cachorro">Cachorro</option>

                    <option value="Gato">Gato</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="raca" className="form-label">
                    Raça
                  </label>

                  <input
                    id="raca"
                    name="raca"
                    type="text"
                    className="form-control"
                    defaultValue={petOriginal?.raca || ""}
                    maxLength={100}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="idade" className="form-label">
                    Idade (anos)
                  </label>

                  <input
                    id="idade"
                    name="idade"
                    type="number"
                    min="0"
                    className="form-control"
                    defaultValue={petOriginal?.idade ?? ""}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="porte" className="form-label">
                    Porte
                  </label>

                  <select
                    id="porte"
                    name="porte"
                    className="form-select"
                    defaultValue={petOriginal?.porte || ""}
                    required
                  >
                    <option value="" disabled>
                      Selecione
                    </option>

                    <option value="pequeno">Pequeno</option>

                    <option value="medio">Médio</option>

                    <option value="grande">Grande</option>
                  </select>
                </div>

                <fieldset className="col-12 col-md-6 cadastro-pet-sexo-fieldset">
                  <legend className="form-label">Sexo</legend>

                  <div className="cadastro-pet-sexo-opcoes">
                    <div className="form-check">
                      <input
                        id="genero-macho"
                        name="genero"
                        type="radio"
                        value="macho"
                        className="form-check-input"
                        defaultChecked={petOriginal?.genero === "macho"}
                        required
                      />

                      <label
                        htmlFor="genero-macho"
                        className="form-check-label"
                      >
                        Macho
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        id="genero-femea"
                        name="genero"
                        type="radio"
                        value="femea"
                        className="form-check-input"
                        defaultChecked={petOriginal?.genero === "femea"}
                      />

                      <label
                        htmlFor="genero-femea"
                        className="form-check-label"
                      >
                        Fêmea
                      </label>
                    </div>
                  </div>
                </fieldset>

                <div className="col-12 col-md-6">
                  <label htmlFor="vacinas" className="form-label">
                    Vacinas em dia?
                  </label>

                  <select
                    id="vacinas"
                    name="vacinas"
                    className="form-select"
                    defaultValue={petOriginal?.vacinas || ""}
                    required
                  >
                    <option value="" disabled>
                      Selecione
                    </option>

                    <option value="sim">Sim</option>

                    <option value="nao">Não</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="cidade" className="form-label">
                    Cidade
                  </label>

                  <input
                    id="cidade"
                    name="cidade"
                    type="text"
                    className="form-control"
                    placeholder="Ex.: Fortaleza"
                    defaultValue={petOriginal?.cidade || ""}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="estado" className="form-label">
                    Estado
                  </label>

                  <select
                    id="estado"
                    name="estado"
                    className="form-select"
                    defaultValue={petOriginal?.estado || ""}
                    required
                  >
                    <option value="" disabled>
                      Selecione seu estado
                    </option>

                    {estadosBrasil.map(([sigla, nome]) => (
                      <option key={sigla} value={sigla}>
                        {nome} ({sigla})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12">
                  <label htmlFor="descricao" className="form-label">
                    Descrição
                  </label>

                  <textarea
                    id="descricao"
                    name="descricao"
                    className="form-control"
                    rows={4}
                    maxLength={LIMITE_DESCRICAO}
                    value={descricao}
                    onChange={(evento) => setDescricao(evento.target.value)}
                    placeholder="Conte sobre o comportamento, os gostos e a personalidade do seu pet..."
                    aria-describedby="contador-descricao"
                  />

                  <div
                    id="contador-descricao"
                    className="text-end text-muted small mt-1"
                  >
                    {descricao.length}/{LIMITE_DESCRICAO} caracteres
                  </div>
                </div>
              </div>

              <div className="cadastro-pet-secao-fotos mt-4">
                <div className="cadastro-pet-fotos-topo">
                  <div>
                    <h2 className="fw-bold mb-1">Fotos do pet</h2>

                    <p className="text-muted small mb-0">
                      Selecione até 5 fotos e organize a ordem antes de salvar.
                    </p>
                  </div>

                  <span className="cadastro-pet-contador">
                    {fotos.length}/{LIMITE_FOTOS} fotos
                  </span>
                </div>

                <label htmlFor="fotos" className="form-label mt-3">
                  Adicionar fotos
                </label>

                <input
                  id="fotos"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="form-control"
                  multiple
                  onChange={selecionarFotos}
                  disabled={
                    processando || salvando || fotos.length >= LIMITE_FOTOS
                  }
                  aria-describedby="orientacao-fotos"
                />

                <p id="orientacao-fotos" className="text-muted small mt-2">
                  JPG, PNG ou WebP. Até 10 MB por imagem. A foto número 1 será a
                  capa do perfil.
                </p>

                {processando && (
                  <p className="text-muted small" role="status">
                    Preparando suas fotos...
                  </p>
                )}

                {fotos.length > 0 && (
                  <>
                    <div className="cadastro-pet-galeria">
                      {fotos.map((foto, index) => (
                        <div
                          className={`cadastro-pet-foto-item ${
                            index === 0 ? "cadastro-pet-foto-principal" : ""
                          }`}
                          key={foto.id}
                          draggable={!processando && !salvando}
                          onDragStart={(evento) => {
                            evento.dataTransfer.setData(
                              "text/plain",
                              String(index),
                            );

                            evento.dataTransfer.effectAllowed = "move";
                          }}
                          onDragOver={(evento) => evento.preventDefault()}
                          onDrop={(evento) =>
                            receberFotoArrastada(evento, index)
                          }
                        >
                          <div className="cadastro-pet-foto-preview">
                            <img
                              src={foto.src}
                              alt={`Foto na posição ${index + 1}`}
                            />

                            <span className="cadastro-pet-foto-numero">
                              {index === 0
                                ? "1 · Principal"
                                : `Foto ${index + 1}`}
                            </span>
                          </div>

                          <div className="cadastro-pet-foto-controles">
                            {index > 0 ? (
                              <button
                                type="button"
                                className="cadastro-pet-btn-capa"
                                onClick={() => definirPrincipal(index)}
                                disabled={processando || salvando}
                              >
                                Definir como principal
                              </button>
                            ) : (
                              <span className="cadastro-pet-label-capa">
                                ✓ Foto de capa
                              </span>
                            )}

                            <div className="cadastro-pet-controles-linha">
                              <button
                                type="button"
                                onClick={() => moverFoto(index, index - 1)}
                                disabled={
                                  index === 0 || processando || salvando
                                }
                                aria-label={`Mover foto ${index + 1} para a esquerda`}
                              >
                                ←
                              </button>

                              <button
                                type="button"
                                onClick={() => moverFoto(index, index + 1)}
                                disabled={
                                  index === fotos.length - 1 ||
                                  processando ||
                                  salvando
                                }
                                aria-label={`Mover foto ${index + 1} para a direita`}
                              >
                                →
                              </button>

                              <button
                                type="button"
                                className="cadastro-pet-remover-foto"
                                onClick={() => removerFoto(foto.id)}
                                disabled={processando || salvando}
                                aria-label={`Remover foto ${index + 1}`}
                              >
                                Remover
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="text-muted small mt-2">
                      Arraste as fotos para alterar a ordem ou use as setas. A
                      primeira imagem será a principal.
                    </p>
                  </>
                )}
              </div>

              {erro && (
                <p className="text-danger mt-3" role="alert">
                  {erro}
                </p>
              )}

              <div className="cadastro-pet-acoes mt-4 d-flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="btn-cadastrar-pet"
                  disabled={salvando || processando}
                >
                  {salvando
                    ? "Salvando..."
                    : emEdicao
                      ? "Salvar alterações"
                      : "Cadastrar meu pet"}
                </button>

                <Link
                  to={
                    emEdicao
                      ? `/meu-pet/${encodeURIComponent(String(petId))}`
                      : "/minha-conta"
                  }
                  className="btn btn-outline-secondary btn-cancelar-pet"
                >
                  Cancelar
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

function CadastroPet() {
  const { petId } = useParams();

  const { pets, adicionarPet, atualizarPet } = usePetAtivo();

  const petOriginal = petId
    ? pets.find((pet) => String(pet.id) === String(petId))
    : null;

  return (
    <FormularioPet
      key={petId || "novo"}
      petId={petId}
      petOriginal={petOriginal}
      adicionarPet={adicionarPet}
      atualizarPet={atualizarPet}
    />
  );
}

export default CadastroPet;
