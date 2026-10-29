import { useEffect, useState } from "react";
import pets from "../data/pets";
import PetCard from "../components/PetCard";
import './Farejar.css';

const meuPetId = '1'
const  macthId= ['5']

function Farejar() {
  const [fila, setFila] = useState(() =>
    pets.filter((p) => String(p.id) !== meuPetId)
  )
  const [match, setMatch] = useState(null)

  function decidir(tipo) {
    const pet = fila[0]
    if (!pet) return 
      setFila((f) => f.slice(1))
    if (tipo === 'curtir' && macthId.includes(String(pet.id)))
      setMatch(pet)
  }

const pet = fila[0]

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
          <img src={match.imagem} alt={match.name} />
            <p>Você e {match.name} se curtiram.</p>
          <button className="match-botao" onClick={() => setMatch(null)}>Continuar fareajando</button>
        </div>  
      </div>
    )}
  </div>
  )
}

export default Farejar
