import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PetCard from "../components/PetCard";
import { usePetAtivo } from "../context/usePetAtivo";
import {
  buscarPetsDisponiveis,
  mensagemDeErro,
  registrarInteracao,
} from "../services/farejarService";
import "./Farejar.css";

const chatFuncionando = false;

function Farejar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { petAtivo } = usePetAtivo();

  const [descoberta, setDescoberta] = useState({
    animalId: null,
    animais: [],
    total: 0,
    erro: "",
    carregando: true,
  });
  const [enviando, setEnviando] = useState(false);
  const [match, setMatch] = useState(() =>
    location.state?.match
      ? { ...location.state.match, matchId: location.state.matchId }
      : null,
  );
  const [avisoChat, setAvisoChat] = useState(false);

  useEffect(() => {
    let ativo = true;

    if (!petAtivo?.id) return () => {
      ativo = false;
    };

    buscarPetsDisponiveis(petAtivo.id)
      .then((resultado) => {
        if (ativo) {
          setDescoberta({
            animalId: petAtivo.id,
            animais: resultado.animais,
            total: resultado.total,
            erro: "",
            carregando: false,
          });
        }
      })
      .catch((falha) => {
        if (ativo) {
          setDescoberta({
            animalId: petAtivo.id,
            animais: [],
            total: 0,
            erro: mensagemDeErro(
              falha,
              "Não foi possível carregar os pets disponíveis.",
            ),
            carregando: false,
          });
        }
      })

    return () => {
      ativo = false;
    };
  }, [petAtivo?.id]);

  useEffect(() => {
    if (location.state?.match) {
      navigate("/farejar", { replace: true, state: null });
    }
  }, [location.state?.match, navigate]);

  async function carregarMais(animalId) {
    setDescoberta({
      animalId,
      animais: [],
      total: 0,
      erro: "",
      carregando: true,
    });

    try {
      const resultado = await buscarPetsDisponiveis(animalId);
      setDescoberta({
        animalId,
        animais: resultado.animais,
        total: resultado.total,
        erro: "",
        carregando: false,
      });
    } catch (falha) {
      setDescoberta({
        animalId,
        animais: [],
        total: 0,
        erro: mensagemDeErro(
          falha,
          "Não foi possível carregar os próximos pets.",
        ),
        carregando: false,
      });
    }
  }

  async function decidir(tipo) {
    const fila =
      String(descoberta.animalId) === String(petAtivo?.id)
        ? descoberta.animais
        : [];
    const petAtual = fila[0];

    if (!petAtual || !petAtivo || enviando) return;

    setEnviando(true);

    try {
      const resultado = await registrarInteracao(
        petAtivo.id,
        petAtual.id,
        tipo === "curtir" ? "like" : "dislike",
      );
      const restantes = fila.slice(1);

      setDescoberta({
        animalId: petAtivo.id,
        animais: restantes,
        total: Math.max(0, descoberta.total - 1),
        erro: "",
        carregando: false,
      });

      if (resultado.deuMatch) {
        setMatch({
          ...petAtual,
          matchId: resultado.match?.id,
        });
      }

      if (restantes.length === 0) {
        await carregarMais(petAtivo.id);
      }
    } catch (falha) {
      setDescoberta((atual) => ({
        ...atual,
        erro: mensagemDeErro(
          falha,
          "Não foi possível registrar sua decisão.",
        ),
      }));
    } finally {
      setEnviando(false);
    }
  }

  function abrirChat() {
    if (!chatFuncionando) {
      setAvisoChat(true);
      return;
    }

    if (!match?.matchId) return;

    navigate(`/chat/${match.matchId}`);
  }

  function fecharMatch() {
    setMatch(null);
    setAvisoChat(false);
  }

  const descobertaAtual =
    String(descoberta.animalId) === String(petAtivo?.id);
  const fila = descobertaAtual ? descoberta.animais : [];
  const carregando =
    Boolean(petAtivo?.id) &&
    (!descobertaAtual || descoberta.carregando);
  const erro = descobertaAtual ? descoberta.erro : "";
  const pet = fila[0];

  return (
    <div className="farejar">
      <h1 className="farejar-titulo">Farejar</h1>

      <p className="farejar-subtitulo">
        Um pet por vez. Dê uma patinha para quem você gostou.
      </p>

      {erro && (
        <p className="text-danger" role="alert">
          {erro}
        </p>
      )}

      <section className="farejar-centro">
        {carregando ? (
          <p role="status">Carregando pets...</p>
        ) : !pet ? (
          <div>
            <p className="farejar-vazio">
              {erro
                ? "Não foi possível exibir os pets."
                : "Não há novos pets disponíveis para farejar."}
            </p>
            {petAtivo?.id && (
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => carregarMais(petAtivo.id)}
              >
                {erro ? "Tentar novamente" : "Verificar novamente"}
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="farejar-contagem" aria-live="polite">
              {descoberta.total === 1
                ? "1 pet disponível"
                : `${descoberta.total} pets disponíveis`}
            </p>
            <PetCard
              pet={pet}
              onCurtir={() => decidir("curtir")}
              onPassar={() => decidir("passar")}
              disabled={enviando}
            />
          </>
        )}
      </section>

      {match && (
        <div className="match-fundo">
          <div className="match-caixa">
            <h2>É um match!</h2>

            {match.imagem && <img src={match.imagem} alt={match.nome} />}

            <p>Você e {match.nome} se curtiram.</p>

            {avisoChat && (
              <div className="alert alert-warning" role="alert">
                Em breve
              </div>
            )}

            <div className="match-acoes">
              <button type="button" className="match-botao" onClick={abrirChat}>
                Chat
              </button>

              <button
                type="button"
                className="match-botao"
                onClick={fecharMatch}
              >
                Continuar farejando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Farejar;
