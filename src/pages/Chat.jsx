import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  bloquearConversa,
  buscarMensagens,
  desbloquearConversa,
  enviarMensagem,
  mensagemDeErro,
} from "../services/chatService";
import "./Chat.css";

const TAMANHO_MAXIMO = 1000;
const INTERVALO_ATUALIZACAO = 4000;

// Junta mensagens novas às atuais sem repetir (mesmo id) e mantém a ordem.
function mesclar(atuais, novas) {
  const porId = new Map(atuais.map((mensagem) => [mensagem.id, mensagem]));

  for (const mensagem of novas) porId.set(mensagem.id, mensagem);

  return [...porId.values()].sort((a, b) => a.id - b.id);
}

function formatarHora(data) {
  const quando = new Date(data);

  if (Number.isNaN(quando.getTime())) return "";

  return quando.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ConversaAberta({ matchId }) {
  const [conversa, setConversa] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [temMais, setTemMais] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [naoEncontrada, setNaoEncontrada] = useState(false);
  const [erro, setErro] = useState("");
  const [erroAtualizacao, setErroAtualizacao] = useState("");
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [confirmandoBloqueio, setConfirmandoBloqueio] = useState(false);

  const ultimoIdRef = useRef(null);
  const fimRef = useRef(null);

  const ultimoId = mensagens.length ? mensagens[mensagens.length - 1].id : null;

  useEffect(() => {
    ultimoIdRef.current = ultimoId;
  }, [ultimoId]);

  // Rola até a mensagem mais recente quando chega uma nova.
  useEffect(() => {
    fimRef.current?.scrollIntoView({ block: "end" });
  }, [ultimoId]);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const dados = await buscarMensagens(matchId);

        if (!ativo) return;

        setConversa(dados.conversa);
        setMensagens(dados.mensagens);
        setTemMais(dados.temMais);
        setErro("");
      } catch (falha) {
        if (!ativo) return;

        if (falha.response?.status === 404) {
          setNaoEncontrada(true);
        } else {
          setErro(
            mensagemDeErro(falha, "Não foi possível carregar a conversa."),
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();

    // Busca só as mensagens novas a cada poucos segundos, enquanto a aba está visível.
    const timer = setInterval(async () => {
      if (document.hidden) return;

      try {
        const dados = await buscarMensagens(
          matchId,
          ultimoIdRef.current ? { depoisDe: ultimoIdRef.current } : {},
        );

        if (!ativo) return;

        setConversa(dados.conversa);
        setErroAtualizacao("");

        if (dados.mensagens.length > 0) {
          setMensagens((atuais) => mesclar(atuais, dados.mensagens));
        }
      } catch (falha) {
        if (!ativo || document.hidden) return;

        if (falha.response?.status === 404) {
          setNaoEncontrada(true);
        } else {
          setErroAtualizacao(
            mensagemDeErro(
              falha,
              "Não foi possível atualizar as mensagens.",
            ),
          );
        }
      }
    }, INTERVALO_ATUALIZACAO);

    return () => {
      ativo = false;
      clearInterval(timer);
    };
  }, [matchId]);

  async function carregarAnteriores() {
    if (mensagens.length === 0) return;

    try {
      const dados = await buscarMensagens(matchId, {
        antesDe: mensagens[0].id,
      });

      setMensagens((atuais) => mesclar(atuais, dados.mensagens));
      setTemMais(dados.temMais);
    } catch (falha) {
      setErro(
        mensagemDeErro(falha, "Não foi possível carregar mensagens antigas."),
      );
    }
  }

  async function enviar(evento) {
    evento.preventDefault();

    const limpo = texto.trim();

    if (!limpo || enviando) return;

    setEnviando(true);
    setErro("");

    try {
      const mensagem = await enviarMensagem(matchId, limpo);

      setMensagens((atuais) => mesclar(atuais, [mensagem]));
      setTexto("");
    } catch (falha) {
      setErro(mensagemDeErro(falha, "Não foi possível enviar a mensagem."));
    } finally {
      setEnviando(false);
    }
  }

  // Enter envia; Shift + Enter quebra a linha.
  function aoTeclar(evento) {
    if (evento.key === "Enter" && !evento.shiftKey) {
      enviar(evento);
    }
  }

  async function alternarBloqueio() {
    setErro("");

    try {
      const situacao = conversa.bloqueadaPorMim
        ? await desbloquearConversa(matchId)
        : await bloquearConversa(matchId);

      setConversa((atual) => ({
        ...atual,
        bloqueada: situacao.bloqueada,
        bloqueadaPorMim: situacao.bloqueadaPorMim,
      }));
    } catch (falha) {
      setErro(mensagemDeErro(falha, "Não foi possível alterar o bloqueio."));
    } finally {
      setConfirmandoBloqueio(false);
    }
  }

  if (carregando) {
    return (
      <div className="chat-pagina">
        <p role="status">Carregando conversa...</p>
      </div>
    );
  }

  if (naoEncontrada || !conversa) {
    return (
      <div className="chat-pagina">
        <h1 className="chat-titulo">Conversa não encontrada</h1>
        <p className="chat-subtitulo">
          {erro || "Esta conversa não existe ou você não participa dela."}
        </p>
        <Link to="/conversas" className="chat-voltar">
          Ver minhas conversas
        </Link>
      </div>
    );
  }

  return (
    <div className="chat-pagina">
      <header className="chat-cabecalho">
        <Link to="/conversas" className="chat-voltar" aria-label="Voltar para conversas">
          ← Conversas
        </Link>

        <div className="chat-cabecalho-nomes">
          <h1 className="chat-titulo chat-titulo--conversa">
            {conversa.outroPet.nome}
          </h1>
          <p className="chat-subtitulo chat-subtitulo--conversa">
            Tutor(a): {conversa.outroTutor.nome} · match com{" "}
            {conversa.meuPet.nome}
          </p>
        </div>

        {conversa.bloqueadaPorMim ? (
          <button type="button" className="chat-acao" onClick={alternarBloqueio}>
            Desbloquear
          </button>
        ) : (
          <button
            type="button"
            className="chat-acao chat-acao--perigo"
            onClick={() => setConfirmandoBloqueio(true)}
          >
            Bloquear
          </button>
        )}
      </header>

      {confirmandoBloqueio && (
        <div className="chat-confirmacao" role="alertdialog" aria-label="Confirmar bloqueio">
          <p>
            Bloquear {conversa.outroTutor.nome}? Vocês não poderão mais trocar
            mensagens até você desbloquear.
          </p>
          <div className="chat-confirmacao-acoes">
            <button type="button" className="chat-acao chat-acao--perigo" onClick={alternarBloqueio}>
              Bloquear
            </button>
            <button type="button" className="chat-acao" onClick={() => setConfirmandoBloqueio(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <section className="chat-mensagens" aria-label="Mensagens" aria-live="polite">
        {temMais && (
          <button type="button" className="chat-anteriores" onClick={carregarAnteriores}>
            Carregar mensagens anteriores
          </button>
        )}

        {mensagens.length === 0 && (
          <p className="chat-vazio">
            Nenhuma mensagem ainda. Que tal começar com um oi?
          </p>
        )}

        {/*
          SEGURANÇA: o texto é sempre renderizado como texto ({mensagem.texto}).
          O React escapa HTML automaticamente. Nunca use dangerouslySetInnerHTML aqui.
        */}
        {mensagens.map((mensagem) => (
          <div
            key={mensagem.id}
            className={
              mensagem.minha ? "chat-balao chat-balao--minha" : "chat-balao"
            }
          >
            <p className="chat-balao-texto">
              {mensagem.indisponivel ? (
                <em>Mensagem indisponível.</em>
              ) : (
                mensagem.texto
              )}
            </p>
            <span className="chat-balao-hora">
              {formatarHora(mensagem.enviadaEm)}
            </span>
          </div>
        ))}

        <div ref={fimRef} />
      </section>

      {(erro || erroAtualizacao) && (
        <p className="chat-erro" role="alert">
          {erro || erroAtualizacao}
        </p>
      )}

      {conversa.bloqueada ? (
        <p className="chat-bloqueada" role="status">
          {conversa.bloqueadaPorMim
            ? "Você bloqueou esta conversa. Desbloqueie para voltar a conversar."
            : "Não é possível enviar mensagens nesta conversa."}
        </p>
      ) : (
        <form className="chat-envio" onSubmit={enviar}>
          <label className="visually-hidden" htmlFor="chat-texto">
            Mensagem
          </label>
          <textarea
            id="chat-texto"
            className="chat-campo"
            rows={2}
            maxLength={TAMANHO_MAXIMO}
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
            onKeyDown={aoTeclar}
            placeholder="Escreva uma mensagem"
          />
          <button
            type="submit"
            className="chat-enviar"
            disabled={enviando || !texto.trim()}
          >
            {enviando ? "Enviando..." : "Enviar"}
          </button>
          <span className="chat-contador" aria-hidden="true">
            {texto.length}/{TAMANHO_MAXIMO}
          </span>
        </form>
      )}

      <p className="chat-aviso">
        Para sua segurança, não compartilhe senhas, documentos ou dados
        bancários pelo chat.
      </p>
    </div>
  );
}

// `key` recria a tela ao trocar de conversa: nenhuma mensagem de uma conversa "sobra" na outra.
function Chat() {
  const { matchId } = useParams();

  return <ConversaAberta key={matchId} matchId={matchId} />;
}

export default Chat;
