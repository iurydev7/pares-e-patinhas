import'./Carousel.css'
import { Link } from "react-router-dom";
import { Carousel } from "react-bootstrap";
import hero from '../data/heroSlide';


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
            <Link to={hero.button.url} className="hero_carousel__link">
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