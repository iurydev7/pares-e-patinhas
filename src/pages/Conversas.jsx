import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { buscarConversas, mensagemDeErro } from "../services/chatService";
import "./Chat.css";

function Conversas() {
  const [conversas, setConversas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const lista = await buscarConversas();

        if (!ativo) return;

        setConversas(lista);
        setErro("");
      } catch (falha) {
        if (!ativo) return;

        setErro(
          mensagemDeErro(falha, "Não foi possível carregar suas conversas."),
        );
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();

    // Atualiza a lista (não lidas e última mensagem) enquanto a aba está visível.
    const timer = setInterval(() => {
      if (!document.hidden) carregar();
    }, 15000);

    return () => {
      ativo = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="chat-pagina">
      <h1 className="chat-titulo">Conversas</h1>
      <p className="chat-subtitulo">
        Converse com os tutores dos pets que deram match com o seu.
      </p>

      {erro && (
        <p className="chat-erro" role="alert">
          {erro}
        </p>
      )}

      {carregando ? (
        <p role="status">Carregando conversas...</p>
      ) : conversas.length === 0 && !erro ? (
        <p className="chat-vazio">
          Você ainda não tem conversas. Quando um pet der match com o seu, a
          conversa aparece aqui.
        </p>
      ) : (
        <ul className="conversas-lista">
          {conversas.map((conversa) => (
            <li key={conversa.matchId}>
              <Link to={`/chat/${conversa.matchId}`} className="conversa-item">
                <span className="conversa-avatar" aria-hidden="true">
                  🐾
                </span>

                <span className="conversa-texto">
                  <span className="conversa-nome">
                    {conversa.outroPet.nome}
                    <span className="conversa-tutor">
                      {" "}
                      · {conversa.outroTutor.nome}
                    </span>
                  </span>

                  <span className="conversa-previa">
                    {conversa.bloqueada
                      ? "Conversa bloqueada"
                      : conversa.ultimaMensagem
                        ? `${conversa.ultimaMensagem.minha ? "Você: " : ""}${
                            conversa.ultimaMensagem.indisponivel
                              ? "Mensagem indisponível"
                              : conversa.ultimaMensagem.texto
                          }`
                        : `Match com ${conversa.meuPet.nome}. Diga oi!`}
                  </span>
                </span>

                {conversa.naoLidas > 0 && (
                  <span
                    className="conversa-nao-lidas"
                    aria-label={`${conversa.naoLidas} não lidas`}
                  >
                    {conversa.naoLidas}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Conversas;
