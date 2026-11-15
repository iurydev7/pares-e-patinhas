import CarouselHero from "../components/Carousel"
import PetCarousel from "../components/PetCarousel"


function Home() {
  return (
    <main className="home-page">
      <CarouselHero/>
      <PetCarousel/>
    </main>
    
  )
}

export default Home