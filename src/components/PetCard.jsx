function PetCard({ pet, onCurtir, onPassar }) {
    return (
        <div className="pet-card">
            <img src={pet.imagem} alt={pet.nome} />

            <h2>{pet.nome}</h2>

            <p>Espécie: {pet.especie}</p>
            <p>Idade: {pet.idade} anos</p>

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