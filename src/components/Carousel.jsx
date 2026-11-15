import "./Carousel.css";
import { Link } from "react-router-dom";
import { Carousel } from "react-bootstrap";
import { useAuth } from "../context/useAuth";
import hero from "../data/heroSlide";

function CarouselHero() {
  const { user } = useAuth();

  return (
    <Carousel className="hero-carousel">
      {hero.map((slide) => {
        const destino =
          slide.button?.text?.trim().toLowerCase() === "criar perfil do pet"
            ? user
              ? "/minha-conta"
              : "/login"
            : slide.button?.url;

        return (
          <Carousel.Item key={slide.title}>
            <img
              className={`hero_carousel__image ${slide.className || ""}`}
              src={slide.image}
              alt={slide.title}
            />

            <Carousel.Caption
              className={`hero_carousel__caption ${slide.className || ""}`}
            >
              <h2>{slide.title}</h2>
              <p>{slide.description}</p>

              {slide.button && (
                <Link to={destino} className="hero_carousel__link">
                  {slide.button.text}
                </Link>
              )}
            </Carousel.Caption>
          </Carousel.Item>
        );
      })}
    </Carousel>
  );
}

export default CarouselHero;
