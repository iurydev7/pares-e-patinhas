import imgHero from '../assets/img_hero.png'
import img2Hero from '../assets/img02_hero.png'
import img3Hero from '../assets/img03_hero.png'

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

export default hero;