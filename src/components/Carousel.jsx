import'./Carousel.css'
import { Link } from "react-router-dom";
import { Carousel } from "react-bootstrap";
import imgHero from'../assets/img_hero.png'
import img3Hero from '../assets/img03_hero.png'
import img2Hero from '../assets/img02_hero.png'

const hero = [
  {
    image: imgHero,
    className: "slide-especial",
    title : "Todo pet merece um par",
    description: "Crie o perfil do seu pet e comece a farejar.",
    button: {
      text: "Criar perfil do pet",
      url: "/meu-pet"
    },

  },
  {
    image: img2Hero,      
      title: "Amizades",
      description: "Um amigo para seu pet.",
  },
  {
    image: img3Hero,
      title: "Adoção",
      description: "Encontre um pet para você.",
  },
];

function CarouselHero() {
  return (
    <Carousel className='hero-carousel'>

      {hero.map((hero) => (
        <Carousel.Item key={hero.title}>
          <img className={`hero_carousel__image ${hero.className || ''}`} src={hero.image} alt={hero.title} />

          <Carousel.Caption className={`hero_carousel__caption ${hero.className||''}`}>
            <h2>{hero.title}</h2>
            <p>{hero.description}</p>
            
            {hero.button && (
            <Link href={hero.button.url} className="hero_carousel__link">
              {hero.button.text}
            </Link>
          )}
          </Carousel.Caption>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}

export default CarouselHero;