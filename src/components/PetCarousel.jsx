import { useRef } from "react";
import pets from "../data/pets";
import "./PetCarousel.css";

function PetCarousel(){

  const carouselRef = useRef(null);

  function scrollCarousel(direction){
    if (!carouselRef.current) return;

    const card = carouselRef.current.querySelector(".pet-card");
    const cardWidth = card ? card.offsetWidth + 12 : 220;

    carouselRef.current.scrollBy({
      left: direction * cardWidth,
      behavior: "Smooth",
    });
  }

  return(
    <section>
      <div>
        <header>
          <div>
            <h2>Pets perto de você</h2>
            <p>Veja quem está perto de você</p>
          </div>

          <div>
            <button 
            type="button"
            className="pets-arrow"
            onClick={ () => scrollCarousel(-1)}
             aria-label="Pet anterior"> &#8249;
            </button>

          <button
          type="button"
          className="pets-arrow pets-arrow--active"
          onClick={ () => scrollCarousel(1)}
          aria-label="Próximo pet"> &#8250;
          </button>

          </div>
        </header>

        <div className="pets-carousel" ref={carouselRef}>
          {pets.map((pets, index) => (
            <article className="pet-card" key={pets.id}>

              <div className={`pet-card__photo pet-card__photo--${index % 4}`}>
                {pets.imagem ? 
                  ( <img src = {pets.imagem} alt={pets.nome}/> ) :
                  ( <div className="pet-card__placeholder">
                  <span aria-hidden="true">patinhas</span>
                  <small> foto </small>
                    </div>
                  )
                }
              </div>

              <div className="pet-car__body">
                <div className="pet-card__heading">
                  <h3>{pets.nome}</h3>
                  <span className="pet-card__distance"> 
                    {pets.distancia ?? "Perto de você"}
                  </span>
                </div>

              <p className="pet-card__details">
                  {pets.raca ?? pets.especie}
                  {" . "}
                  {pets.idade}{" "}
                  {pets.idade === 1 ? "ano" : "anos"}
              </p>

               
              <span className={`pet-tag pet-tag-- ${(pets.status ?? "Amizade").toLowerCase()}`}> 

                  {pets.status ?? "Amizade"}
              </span>

              <button type="button" className="pet-card__button" onClick={() => console.log(`Dar patinha para {pet.nome}`)}>
                <span className="patinha-icon" aria-hidden="true"><img src="../assets/patinha.png" alt="Patinha" />🐾</span>
                Dar patinha
              </button>              
            </div>
          </article>  

         ))}
        </div>
      </div>
    </section>
  );
}

export default PetCarousel;