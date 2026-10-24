import { useState } from "react";
import pets from "../data/pets";
import PetCard from "../components/PetCard";

function Farejar() {
    const [indiceAtual, setIndiceAtual] = useState(0);

    function passarPet() {
        setIndiceAtual(indiceAtual + 1);
    }

    function curtirPet() {
        const pet = pets[indiceAtual];

        console.log("Pet curtido:", pet.nome);

        passarPet();
    }

    if (indiceAtual >= pets.length) {
        return (
            <div>
                <h1>Farejar</h1>
                <p>Você viu todos os pets!</p>
            </div>
        );
    }

    return (
        <div>
            <h1>Farejar</h1>

            <PetCard
                pet={pets[indiceAtual]}
                onCurtir={curtirPet}
                onPassar={passarPet}
            />
        </div>
    );
}

export default Farejar;