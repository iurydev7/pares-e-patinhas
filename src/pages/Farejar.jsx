import { useState } from "react";
import pets from "../data/pets";
import PetCard from "../components/PetCard";
import './Farejar.css';
import { useNavigate } from "react-router-dom";

const meuPetId = '1'
const  macthId= ['5']

const chatFuncionando = false

function Farejar() {
  const [fila, setFila] = useState(() =>
    pets.filter((p) => String(p.id) !== meuPetId)
  )
  const [match, setMatch] = useState(null)
  const [avisoChat, setAvisoChat] = useState(false);

  function decidir(tipo) {
    const pet = fila[0]
    if (!pet) return 
      setFila((f) => f.slice(1))
    if (tipo === 'curtir' && macthId.includes(String(pet.id))) {
      setMatch(pet)
    }
  }

const pet = fila[0]

const navigate = useNavigate();

function abrirChat() {
  if (!chatFuncionando) {
    setAvisoChat(true);
    return;
  }
  const id = macthId
  setMatch(null);
  navigate(`/chat/${id}`);
}

function fecharMatch() {
  setMatch(null);
  setAvisoChat(false);
}

return (
  <div className="farejar">
    <h1 className="farejar-titulo">Farejar</h1>
    <p className="farejar-subtitulo">Um pet por vez. Dê uma patinha para quem você gostou.
    </p>
  <section className="farejar-centro">
    {!pet ? (
      <p className="farejar-vazio">Acabaram os pets!</p>
    ) : (
      <PetCard
          pet={pet}
          onCurtir={() => decidir('curtir')}
          onPassar={() => decidir('passar')}
      />
    )}
  </section>

    {match && ( 
      <div className="match-fundo">
        <div className="match-caixa">
          <h2>É um match!</h2>
          <img src={match.imagem} alt={match.nome}/>
            <p>Você e {match.nome} se curtiram.</p>
            {avisoChat && (
              <div className="alert alert-warning" role="alert">
              Em breve
              </div>
            )}

            <div className="match-acoes">
              <button className="match-botao" onClick={abrirChat}>
                chat
              </button>
              <button className="match-botao" onClick={() => setMatch(null)}>
                Continuar farejando
                </button>
            </div>
        </div>  
      </div>
    )}
  </div>
  )
}

export default Farejar
