import "./PetCard.css";

function PetCard({ pet, onCurtir, onPassar }) {
    return (
        <div className="pet-card card border-0 shadow-sm h-100">

            <div className="pet-card-imagem">
                <img
                    src={pet.imagem}
                    alt={pet.nome}
                    className="card-img-top"
                />
            </div>

            <div
                className={`card-body pet-card-corpo ${
                    pet.sexo === "Fêmea" ? "pet-femea" : "pet-macho"
                }`}
            >

                <div className="d-flex justify-content-between align-items-center mb-1">
                    <h5 className="card-title pet-card-nome mb-0">
                        {pet.nome}
                    </h5>

                    <span className="pet-card-idade">
                        {pet.idade} {pet.idade === 1 ? "ano" : "anos"}
                    </span>
                </div>

                <p className="pet-card-local mb-2">
                    {pet.cidade}, {pet.estado}
                </p>

                <div className="pet-card-etiquetas mb-3">
                    <span className="badge pet-card-etiqueta">
                        {pet.especie}
                    </span>

                    <span className="badge pet-card-etiqueta">
                        {pet.sexo}
                    </span>
                </div>

                <p className="pet-card-raca mb-3">
                    <strong>Raça:</strong> {pet.raca}
                </p>

                 <div className="d-flex gap-2 pet-card-botoes">
                    <button
                        className="btn pet-btn-passar flex-fill"
                        onClick={onPassar}
                    >
                        ✕ Passar
                    </button>

                    <button
                        className="btn pet-btn-curtir flex-fill"
                        onClick={onCurtir}
                    >
                        ♥ Dar patinha
                    </button>
                </div>

            </div>
        </div>
    );
}

export default PetCard;