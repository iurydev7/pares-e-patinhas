# Pares & Patinhas

front-end do Pares&Patinhas: matches para o seu pet.
Stack: React + Vite (JavaScript), Bootstrap, React Router.

## bash

git clone <URL-DO-REPOSITORIO>
cd pares-e-patinhas
npm install
npm run dev

## Branches

- main: versão estável (apresentação). Ninguém mexe direto.
- develop: base de integração. Ninguém dá push direto.
- feat/...: uma branch por pessoa, criada a partir da develop.

## Responsáveis

| NOME | Identidade visual (cores, fontes, botões, tags) | `feat/identidade` | `index.css`, `App.css` |
| NOME | Header, Footer e Layout | `feat/layout` | `components/layout/` |
| Iury | Login e rota protegida | `feat/login` | `pages/Login.jsx`, `components/ProtectedRoute.jsx` |
| NOME | Dados mockados e card do pet | `feat/dados-mock` | `data/`, `components/PetCard.jsx` |
| Thito | Home e carrossel | `feat/home-carrossel` | `pages/Home.jsx`, `components/Carousel.jsx` |
| NOME | Farejar (match) | `feat/farejar` | `pages/Farejar.jsx` |
| NOME | Meu pet (perfil) | `feat/meu-pet` | `pages/MeuPet.jsx` |

## Cada um mexe só nos arquivos da sua parte.
