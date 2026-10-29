import { useRef } from "react";
import { Link } from "react-router-dom";
import pets from "../data/pets";
import patinha from '../assets/patinha.png'
import "./PetCarousel.css";

function PetCarousel(){

  const carouselRef = useRef(null);

  function scrollCarousel(direction) {
    const el = carouselRef.current;
    if (!el) return;

    const card = el.querySelector(".pet-card");
    const gap = Number.parseFloat(getComputedStyle(el).columnGap) || 0;
    const cardWidth = card ? card.offsetWidth + gap : 220;
    const maxScroll = el.scrollWidth - el.clientWidth;
    let target = el.scrollLeft + direction * cardWidth;

    // Dá a volta para o início se chegar ao fim e tentar avançar
    if (direction === 1 && el.scrollLeft >= maxScroll - 10) target = 0;
    
    // Vai para o final se estiver no início e tentar recuar
    if (direction === -1 && el.scrollLeft <= 0) target = maxScroll;

    el.scrollTo({ left: target, behavior: "smooth" });
  
  // const carouselRef = useRef(null);

  // function scrollCarousel(direction){
  //   if (!carouselRef.current) return;

  //   const {scrollLeft, clientWidth, scrollWidth} = carouselRef.current;
  //   const card = carouselRef.current.querySelector(".pet-card");
  //   const cardWidth = card ? card.offsetWidth + 12 : 220;

  //   if()

  //   carouselRef.current.scrollBy({
  //     left: direction * cardWidth,
  //     behavior: "smooth",
  //   });
  }

  return(
    <section className="pets-section">
      <div className="pets-container">
        <header className="pets-header">
          <div>
            <h2>Pets perto de você</h2>
            <p>Veja quem está perto de você</p>
          </div>

          <div className="pets-controls">
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
          aria-label="Próximo pet">&#8250;
          </button>

          </div>
        </header>

        <div className="pets-carousel" ref={carouselRef}>
          {pets.map((pets, index) => (
            // <article className="pet-card" key={pets.id}>

            <article className={`pet-card ${pets.sexo === "Macho" ? "pet-card__photo--blue":"pet-card__photo--pink"}`}  key={pets.id}>

              

              <div className={`pet-card__photo pet-card__photo--${index % 10}`}>
                {pets.imagem ? 
                  ( <img src = {pets.imagem} alt={pets.nome}/> ) :
                  ( <div className="pet-card__placeholder">
                  <span aria-hidden="true">patinhas</span>
                  <small> foto </small>
                    </div>
                  )
                }
              </div>

              <div className="pet-card__body">
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

              <Link to="/login" className="pet-card__button">
                <img className="patinha-icon" src={patinha} alt=""/>
                Dar patinha
              </Link>              
            </div>
          </article>  

         ))}
        </div>
      </div>
    </section>
  );
}

export default PetCarousel;