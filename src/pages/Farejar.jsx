import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import pets from "../data/pets";
import PetCard from "../components/PetCard";
import { useAuth } from "../context/useAuth";
import { usePetAtivo } from "../context/usePetAtivo";
import {
  lerFilaFarejar,
  removerDaFilaFarejar,
} from "../services/farejarStorage";
import "./Farejar.css";

const matchIds = ["5"];
const chatFuncionando = false;

function Farejar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();
  const { petAtivo } = usePetAtivo();

  const tutorId = String(user?.id ?? user?.email ?? "visitante");

  const petAtivoId = petAtivo?.id;

  const [fila, setFila] = useState(() => lerFilaFarejar(tutorId, petAtivoId));

  const [match, setMatch] = useState(() => {
    const idMatch = location.state?.matchPetId;

    return pets.find((pet) => String(pet.id) === String(idMatch)) || null;
  });

  const [avisoChat, setAvisoChat] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (location.state?.matchPetId != null) {
      navigate("/farejar", {
        replace: true,
        state: null,
      });
    }
  }, [location.state?.matchPetId, navigate]);

  function decidir(tipo) {
    const petAtual = fila[0];

    if (!petAtual) return;

    try {
      const resultado = removerDaFilaFarejar(tutorId, petAtivoId, petAtual.id);

      if (!resultado.alterou) return;

      setFila(resultado.fila);
      setErro("");

      if (tipo === "curtir" && matchIds.includes(String(petAtual.id))) {
        setMatch(petAtual);
      }
    } catch {
      setErro("Não foi possível registrar sua decisão.");
    }
  }

  function abrirChat() {
    if (!chatFuncionando) {
      setAvisoChat(true);
      return;
    }

    if (!match) return;

    navigate(`/chat/${match.id}`);
  }

  function fecharMatch() {
    setMatch(null);
    setAvisoChat(false);
  }

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
        {!pet ? (
          <p className="farejar-vazio">Acabaram os pets!</p>
        ) : (
          <PetCard
            pet={pet}
            onCurtir={() => decidir("curtir")}
            onPassar={() => decidir("passar")}
          />
        )}
      </section>

      {match && (
        <div className="match-fundo">
          <div className="match-caixa">
            <h2>É um match!</h2>

            <img src={match.imagem} alt={match.nome} />

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
