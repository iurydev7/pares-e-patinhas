import "./PetCard.css";

function PetCard({ pet, onCurtir, onPassar }) {
    return (
        <div className="pet-card">
            <img src={pet.imagem} alt={pet.nome} />

            <h2>{pet.nome}</h2>

            <p>Espécie: {pet.especie}</p>
            <p>Sexo: {pet.sexo}</p>
            <p>Raça: {pet.raca}</p>
            <p>Idade: {pet.idade} {pet.idade === 1 ? "ano" : "anos"}</p>
            <p>Cidade: {pet.cidade}</p>
            <p>Estado: {pet.estado}</p>

            <button onClick={onPassar}>
                Passar
            </button>

            <button onClick={onCurtir}>
                Curtir
            </button>
        </div>
    );
}

export default PetCard;