import { useState } from "react";
import pets from "../data/pets";
import PetCard from "../components/PetCard";

const PETS_QUE_CURTIRAM = [3];

export default function Farejar() {
     const [indice, setIndice] = useState(0);
     const [match, setMatch] = useState(null);

     const pet = pets[indice];

     function curtir() {
    if (PETS_QUE_CURTIRAM.includes(pet.id)) {
      setMatch(pet);
    }
    setIndice(indice + 1);
  }

  function passar() {
    setIndice(indice + 1);
  }

  return (
    <main>
      <h1>Farejar</h1>
      <p>Um pet por vez. Dê uma patinha para quem você gostou.</p>

      {match && (
        <div>
          Patinhas dadas com {match.nome}!
          <button onClick={() => setMatch(null)}>
            Continuar
          </button>
        </div>
      )}

      {pet ? (
        <PetCard pet={pet} onCurtir={curtir} onPassar={passar} />
      ) : (
        <div>
          <p>Acabou as patinhas para se conectar!</p>
        </div>
      )}
    </main>
  );
}

