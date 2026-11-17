import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Cropper from "react-easy-crop";

import api from "../services/api";
import { useAuth } from "../context/useAuth";
import { usePetAtivo } from "../context/usePetAtivo";
import "./MinhaConta.css";

const nomesGenero = {
  macho: "Macho",
  femea: "Fêmea",
};

const nomesPorte = {
  pequeno: "Pequeno",
  medio: "Médio",
  grande: "Grande",
};

function carregarTutor(chave, user) {
  const dadosIniciais = {
    name: user?.name || "",
    email: user?.email || "",
    cidade: user?.cidade || "",
    estado: user?.estado || "",

    foto:
      typeof user?.foto === "string"
        ? user.foto
        : String(user?.id) === "1" &&
            user?.email?.toLowerCase() === "carlinhos.jesus@gmail.com"
          ? "/uploads/tutores/Carlinhos-jesus.png"
          : "",
  };

  try {
    const salvo = localStorage.getItem(chave);

    if (salvo) {
      const dados = JSON.parse(salvo);

      if (dados && typeof dados === "object") {
        return {
          name: dados.name ?? dadosIniciais.name,
          email: dados.email ?? dadosIniciais.email,
          cidade: dados.cidade ?? dadosIniciais.cidade,
          estado: dados.estado ?? dadosIniciais.estado,
          foto:
            user?.foto
              ? user.foto
              : typeof dados.foto === "string"
                ? dados.foto
                : dadosIniciais.foto,
        };
      }
    }
  } catch {
    return dadosIniciais;
  }

  return dadosIniciais;
}

function gerarFotoRecortada(url, area) {
  return new Promise((resolve, reject) => {
    const imagem = new Image();

    imagem.onload = () => {
      try {
        const tamanho = 320;
        const canvas = document.createElement("canvas");

        canvas.width = tamanho;
        canvas.height = tamanho;

        const contexto = canvas.getContext("2d");

        if (!contexto) {
          throw new Error("Não foi possível processar a imagem.");
        }

        contexto.drawImage(
          imagem,
          area.x,
          area.y,
          area.width,
          area.height,
          0,
          0,
          tamanho,
          tamanho,
        );

        resolve(canvas.toDataURL("image/jpeg", 0.85));
      } catch {
        reject(new Error("Não foi possível recortar a foto selecionada."));
      }
    };

    imagem.onerror = () => {
      reject(new Error("Não foi possível abrir a foto selecionada."));
    };

    imagem.src = url;
  });
}

function AvatarTutor({ foto, nome }) {
  return (
    <div className="tutor-avatar">
      {foto ? (
        <img
          src={foto}
          alt={`Foto de ${nome || "tutor"}`}
          className="tutor-avatar-imagem rounded-circle"
          width="96"
          height="96"
          style={{ objectFit: "cover" }}
        />
      ) : (
        <div
          className="tutor-avatar-placeholder"
          role="img"
          aria-label="Tutor sem foto"
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fff3f8",
            border: "1px solid #e8bdcf",
            fontSize: "2rem",
          }}
        >
          👤
        </div>
      )}
    </div>
  );
}

function formatarIdade(idade) {
  if (idade === undefined || idade === null || idade === "") {
    return "Idade não informada";
  }

  const numero = Number(idade);

  if (!Number.isFinite(numero) || numero < 0) {
    return "Idade não informada";
  }

  return `${idade} ${numero === 1 ? "ano" : "anos"}`;
}

function ConteudoMinhaConta({ user, atualizarFotoTutor }) {
  const {
    pets,
    petAtivo,
    carregandoPets,
    erroCarregamentoPets,
    avisoCachePets,
    selecionarPet,
    desselecionarPet,
  } = usePetAtivo();

  const identificador = user?.id ?? user?.email ?? "visitante";
  const chaveTutor = `tutor-editado-${identificador}`;

  const [editandoTutor, setEditandoTutor] = useState(false);

  const [dadosTutor, setDadosTutor] = useState(() =>
    carregarTutor(chaveTutor, user),
  );

  const [formTutor, setFormTutor] = useState(dadosTutor);
  const [erroTutor, setErroTutor] = useState("");
  const [erroPet, setErroPet] = useState("");

  const [editorAberto, setEditorAberto] = useState(false);
  const [imagemParaRecorte, setImagemParaRecorte] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaRecortePixels, setAreaRecortePixels] = useState(null);
  const [processandoFoto, setProcessandoFoto] = useState(false);

  const urlTemporariaRef = useRef(null);

  useEffect(() => {
    return () => {
      if (urlTemporariaRef.current) {
        URL.revokeObjectURL(urlTemporariaRef.current);
        urlTemporariaRef.current = null;
      }
    };
  }, []);

  function alterarCampo(evento) {
    const { name, value } = evento.target;

    setFormTutor((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function limparImagemTemporaria() {
    if (urlTemporariaRef.current) {
      URL.revokeObjectURL(urlTemporariaRef.current);
      urlTemporariaRef.current = null;
    }
  }

  function fecharEditorFoto() {
    if (processandoFoto) {
      return;
    }

    setEditorAberto(false);
    setImagemParaRecorte("");
    setAreaRecortePixels(null);
    limparImagemTemporaria();
  }

  function alterarFotoTutor(evento) {
    const arquivo = evento.target.files?.[0];

    evento.target.value = "";

    if (!arquivo) {
      return;
    }

    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];

    if (!tiposPermitidos.includes(arquivo.type)) {
      setErroTutor("Escolha uma imagem JPG, PNG ou WebP.");
      return;
    }

    if (arquivo.size > 8 * 1024 * 1024) {
      setErroTutor("A imagem deve ter no máximo 8 MB.");
      return;
    }

    limparImagemTemporaria();

    const url = URL.createObjectURL(arquivo);

    urlTemporariaRef.current = url;

    setImagemParaRecorte(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setAreaRecortePixels(null);
    setErroTutor("");
    setEditorAberto(true);
  }

  async function aplicarRecorte() {
    if (!imagemParaRecorte || !areaRecortePixels || processandoFoto) {
      return;
    }

    setProcessandoFoto(true);
    setErroTutor("");

    try {
      const fotoRecortada = await gerarFotoRecortada(
        imagemParaRecorte,
        areaRecortePixels,
      );

      setFormTutor((anterior) => ({
        ...anterior,
        foto: fotoRecortada,
      }));

      setEditorAberto(false);
      setImagemParaRecorte("");
      setAreaRecortePixels(null);
      limparImagemTemporaria();
    } catch (erro) {
      setErroTutor(
        erro instanceof Error
          ? erro.message
          : "Não foi possível recortar a foto.",
      );
    } finally {
      setProcessandoFoto(false);
    }
  }

  function removerFotoTutor() {
    setFormTutor((anterior) => ({
      ...anterior,
      foto: "",
    }));

    setErroTutor("");
  }

  async function salvarTutor(evento) {
    evento.preventDefault();

    if (processandoFoto || editorAberto) {
      return;
    }

    const dadosAtualizados = {
      name: formTutor.name.trim(),
      email: formTutor.email.trim(),
      cidade: formTutor.cidade.trim(),
      estado: formTutor.estado.trim(),
      foto: formTutor.foto || "",
    };

    const camposObrigatorios = [
      dadosAtualizados.name,
      dadosAtualizados.email,
      dadosAtualizados.cidade,
      dadosAtualizados.estado,
    ];

    if (camposObrigatorios.some((valor) => !valor)) {
      setErroTutor("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      const resposta = await api.patch("/auth/me", {
        foto: dadosAtualizados.foto,
      });
      dadosAtualizados.foto = resposta.data.tutor.foto || "";

      let falhaAoSalvarNoNavegador = false;
      try {
        localStorage.setItem(chaveTutor, JSON.stringify(dadosAtualizados));
      } catch {
        falhaAoSalvarNoNavegador = true;
      }

      setDadosTutor(dadosAtualizados);
      setFormTutor(dadosAtualizados);
      atualizarFotoTutor(dadosAtualizados.foto);
      setEditandoTutor(false);
      setErroTutor(
        falhaAoSalvarNoNavegador
          ? "A foto foi salva na conta, mas os demais dados não puderam ser salvos neste navegador."
          : "",
      );
    } catch (falha) {
      setErroTutor(
        falha.response?.data?.message ||
          falha.response?.data?.mensagem ||
          "Não foi possível salvar a foto do tutor.",
      );
    }
  }

  function cancelarEdicao() {
    setFormTutor(dadosTutor);
    setErroTutor("");
    setEditandoTutor(false);
  }

  function alternarSelecaoPet(id) {
    try {
      const estaAtivo = petAtivo && String(petAtivo.id) === String(id);

      if (estaAtivo) {
        desselecionarPet();
      } else {
        selecionarPet(id);
      }

      setErroPet("");
    } catch (falha) {
      setErroPet(
        falha instanceof Error
          ? falha.message
          : "Não foi possível alterar a seleção do pet.",
      );
    }
  }

  return (
    <main className="minha-conta py-5">
      <div className="container">
        <div className="cadastro-pet-conteudo">
          <div className="cadastro-pet-cabecalho">
            <h1 className="fw-bold">Minha Conta</h1>

            <p>Gerencie seus dados e os perfis dos seus pets.</p>
          </div>

          <section className="formulario-pet mb-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
              <h2 className="fw-bold mb-0">Dados do Tutor</h2>

              {!editandoTutor && (
                <button
                  type="button"
                  className="btn btn-primary btn-acao-conta"
                  onClick={() => setEditandoTutor(true)}
                >
                  Editar Tutor
                </button>
              )}
            </div>

            {editandoTutor ? (
              <form onSubmit={salvarTutor}>
                <div className="tutor-foto-edicao d-flex align-items-center flex-wrap gap-3 mb-4">
                  <AvatarTutor foto={formTutor.foto} nome={formTutor.name} />

                  <div className="tutor-foto-controles flex-grow-1">
                    <label
                      htmlFor="fotoTutor"
                      className="form-label fw-semibold"
                    >
                      Foto do tutor
                    </label>

                    <input
                      id="fotoTutor"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="form-control"
                      onChange={alterarFotoTutor}
                      disabled={processandoFoto}
                    />

                    <small className="d-block text-muted mt-1">
                      JPG, PNG ou WebP. Até 8 MB.
                    </small>

                    <small className="d-block text-muted mt-1">
                      Você poderá ajustar o enquadramento antes de salvar.
                    </small>

                    {formTutor.foto && (
                      <button
                        type="button"
                        className="btn btn-link text-danger p-0 mt-2"
                        onClick={removerFotoTutor}
                        disabled={processandoFoto}
                      >
                        Remover foto
                      </button>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="nomeTutor" className="form-label">
                    Nome
                  </label>

                  <input
                    id="nomeTutor"
                    type="text"
                    name="name"
                    className="form-control"
                    value={formTutor.name}
                    onChange={alterarCampo}
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="emailTutor" className="form-label">
                    E-mail
                  </label>

                  <input
                    id="emailTutor"
                    type="email"
                    name="email"
                    className="form-control"
                    value={formTutor.email}
                    onChange={alterarCampo}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label htmlFor="cidadeTutor" className="form-label">
                      Cidade
                    </label>

                    <input
                      id="cidadeTutor"
                      type="text"
                      name="cidade"
                      className="form-control"
                      placeholder="Ex.: Fortaleza"
                      value={formTutor.cidade}
                      onChange={alterarCampo}
                      autoComplete="address-level2"
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label htmlFor="estadoTutor" className="form-label">
                      Estado
                    </label>

                    <input
                      id="estadoTutor"
                      type="text"
                      name="estado"
                      className="form-control"
                      placeholder="Ex.: Ceará"
                      value={formTutor.estado}
                      onChange={alterarCampo}
                      autoComplete="address-level1"
                      required
                    />
                  </div>
                </div>

                {erroTutor && (
                  <p className="text-danger" role="alert">
                    {erroTutor}
                  </p>
                )}

                <div className="tutor-form-acoes">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={processandoFoto}
                  >
                    Salvar alterações
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-cancelar-tutor"
                    onClick={cancelarEdicao}
                    disabled={processandoFoto}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="tutor-perfil-layout d-flex align-items-start flex-wrap gap-3">
                <AvatarTutor foto={dadosTutor.foto} nome={dadosTutor.name} />

                <div className="tutor-perfil-informacoes flex-grow-1">
                  <p>
                    <strong>Nome:</strong> {dadosTutor.name || "Não informado"}
                  </p>

                  <p>
                    <strong>E-mail:</strong>{" "}
                    {dadosTutor.email || "Não informado"}
                  </p>

                  <p>
                    <strong>Cidade:</strong>{" "}
                    {dadosTutor.cidade || "Não informado"}
                  </p>

                  <p>
                    <strong>Estado:</strong>{" "}
                    {dadosTutor.estado || "Não informado"}
                  </p>
                </div>
              </div>
            )}
          </section>

          <section className="formulario-pet mb-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
              <h2 className="fw-bold mb-0">Meus Pets</h2>

              <Link
                to="/cadastro-pet"
                className="btn btn-primary btn-acao-conta"
              >
                + Adicionar Pet
              </Link>
            </div>

            {carregandoPets && (
              <p role="status">Carregando os pets da sua conta...</p>
            )}

            {avisoCachePets && (
              <p className="text-muted" role="status">
                {avisoCachePets}
              </p>
            )}

            {erroCarregamentoPets && (
              <p className="text-danger" role="alert">
                Não foi possível carregar os pets: {erroCarregamentoPets}
              </p>
            )}

            {erroPet && (
              <p className="text-danger" role="alert">
                {erroPet}
              </p>
            )}

            {!carregandoPets &&
            !erroCarregamentoPets &&
            pets.length === 0 ? (
              <p>Você ainda não possui pets cadastrados.</p>
            ) : !carregandoPets && pets.length > 0 ? (
              <div className="row g-3 lista-cards-pets">
                {pets.map((pet) => {
                  const ativo = Boolean(
                    petAtivo && String(petAtivo.id) === String(pet.id),
                  );

                  return (
                    <div className="col-12 col-sm-6 col-lg-4" key={pet.id}>
                      <article
                        className={`pet-card-perfil ${
                          ativo ? "pet-card-perfil-ativo" : ""
                        }`}
                      >
                        <Link
                          to={`/meu-pet/${encodeURIComponent(String(pet.id))}`}
                          className="pet-card-link-perfil"
                          aria-label={`Visualizar perfil de ${pet.nome}`}
                        />

                        <div className="pet-card-midia">
                          {pet.foto ? (
                            <img
                              src={pet.foto}
                              alt={`Foto de ${pet.nome}`}
                              className="pet-card-foto"
                            />
                          ) : (
                            <div className="pet-card-sem-foto">
                              <span aria-hidden="true">🐾</span>

                              <small>Sem foto</small>
                            </div>
                          )}

                          {ativo && (
                            <span className="pet-card-selo-ativo">
                              <span aria-hidden="true">✓</span>
                              Ativo
                            </span>
                          )}
                        </div>

                        <div className="pet-card-conteudo">
                          <div className="pet-card-identidade">
                            <h3>{pet.nome || "Pet sem nome"}</h3>

                            <p className="pet-card-raca">
                              {pet.raca || "Raça não informada"}
                            </p>
                          </div>

                          <div className="pet-card-detalhes">
                            <span>{formatarIdade(pet.idade)}</span>

                            <span>
                              {nomesGenero[pet.genero] ||
                                pet.genero ||
                                "Não informado"}
                            </span>

                            <span>
                              {nomesPorte[pet.porte] ||
                                pet.porte ||
                                "Não informado"}
                            </span>
                          </div>

                          <div className="pet-card-rodape">
                            <button
                              type="button"
                              className={`pet-card-botao-selecionar ${
                                ativo ? "pet-card-botao-desselecionar" : ""
                              }`}
                              onClick={() => alternarSelecaoPet(pet.id)}
                              aria-pressed={ativo}
                            >
                              <span aria-hidden="true">
                                {ativo ? "✓" : "🐾"}
                              </span>

                              {ativo
                                ? "Desselecionar para Farejar"
                                : "Selecionar para Farejar"}
                            </button>
                          </div>
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </section>
        </div>
      </div>

      {editorAberto && (
        <div
          className="modal d-block"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-editor-foto-tutor"
          style={{
            backgroundColor: "rgba(25, 16, 24, 0.72)",
            zIndex: 2000,
            overflowY: "auto",
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: "540px" }}
          >
            <div
              className="modal-content"
              style={{
                borderRadius: "18px",
                overflow: "hidden",
                border: "1px solid #f0dce5",
              }}
            >
              <div className="modal-header">
                <h2
                  id="titulo-editor-foto-tutor"
                  className="modal-title fs-5 fw-bold"
                  style={{ color: "#443039" }}
                >
                  Ajustar foto do tutor
                </h2>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="Fechar editor"
                  onClick={fecharEditorFoto}
                  disabled={processandoFoto}
                />
              </div>

              <div className="modal-body">
                <p
                  className="text-center mb-3"
                  style={{ fontSize: "14px", color: "#765f6b" }}
                >
                  Arraste a foto e centralize o rosto dentro do círculo.
                </p>

                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "min(42vh, 320px)",
                    minHeight: "220px",
                    backgroundColor: "#282027",
                    borderRadius: "14px",
                    overflow: "hidden",
                    touchAction: "none",
                  }}
                >
                  <Cropper
                    image={imagemParaRecorte}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(_, areaPixels) =>
                      setAreaRecortePixels(areaPixels)
                    }
                    zoomWithScroll={true}
                  />
                </div>

                <div className="mt-4">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <label
                      htmlFor="zoomFotoTutor"
                      className="fw-semibold"
                      style={{
                        color: "#443039",
                        fontSize: "14px",
                      }}
                    >
                      Zoom da foto
                    </label>

                    <span
                      style={{
                        color: "#963c60",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      {zoom.toFixed(1)}x
                    </span>
                  </div>

                  <input
                    id="zoomFotoTutor"
                    type="range"
                    className="form-range"
                    min="1"
                    max="3"
                    step="0.01"
                    value={zoom}
                    onChange={(evento) => setZoom(Number(evento.target.value))}
                    disabled={processandoFoto}
                    style={{ accentColor: "#c65383" }}
                  />

                  <small className="d-block text-muted mt-2">
                    Use o controle de zoom ou a roda do mouse. No celular, você
                    também pode ajustar com os dedos.
                  </small>
                </div>

                {erroTutor && (
                  <p className="text-danger small mt-3 mb-0" role="alert">
                    {erroTutor}
                  </p>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={fecharEditorFoto}
                  disabled={processandoFoto}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={aplicarRecorte}
                  disabled={processandoFoto || !areaRecortePixels}
                >
                  {processandoFoto ? "Processando..." : "Aplicar foto"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function MinhaConta() {
  const { user, atualizarFotoTutor } = useAuth();

  const identificador = user?.id ?? user?.email ?? "visitante";

  return (
    <ConteudoMinhaConta
      key={identificador}
      user={user}
      atualizarFotoTutor={atualizarFotoTutor}
    />
  );
}
