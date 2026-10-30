# 🐾 Pares & Patinhas

## Sobre o projeto

O Pares & Patinhas é uma aplicação web desenvolvida em equipe durante o programa Geração Tech 4.0, com foco em conectar tutores e pets por meio de uma interface interativa.

## Tecnologias utilizadas

- React e JavaScript (JSX)
- HTML5 e CSS3
- Bootstrap e React Bootstrap
- React Router DOM
- Context API e React Hooks
- Axios
- JSON Server
- Vite
- Git e GitHub

## Funcionalidades

- Página inicial e navegação entre páginas
- Cadastro de usuários
- Login e logout
- Validação de formulários
- Persistência temporária da sessão
- Proteção de rotas autenticadas
- Páginas de exploração e perfil de pets
- Layout responsivo

## Arquitetura

O projeto utiliza componentes React reutilizáveis.

- `src/pages/`: páginas da aplicação
- `src/components/`: componentes reutilizáveis e layout
- `src/context/`: gerenciamento da autenticação
- `src/services/`: configuração de comunicação com a API
- `src/data/`: dados auxiliares
- `src/assets/`: imagens e recursos visuais

## Autenticação

A autenticação utiliza a Context API do React.

O `AuthProvider` centraliza as funções de login, cadastro e logout. O hook personalizado `useAuth` permite acessar essas funcionalidades nos componentes.

O `ProtectedRoute` verifica a existência de um usuário autenticado antes de permitir o acesso às rotas protegidas.

A aplicação utiliza localStorage para persistir temporariamente a sessão.

**Observação:** o sistema utiliza autenticação simulada para fins didáticos, sem a segurança exigida para produção.

## Rotas

| Rota | Descrição | Acesso |
|---|---|---|
| `/` | Página inicial | Público |
| `/login` | Login e cadastro | Visitantes não autenticados |
| `/farejar` | Exploração de pets | Protegido |
| `/meu-pet` | Perfil do pet | Protegido |

A rota definitiva de cadastro de pets deve ser confirmada pela equipe.

## Como executar localmente

**Pré-requisito:** Node.js compatível com a versão do Vite utilizada no projeto.

Instale as dependências:

```bash
npm install
```

Inicie a API simulada:

```bash
npm run start
```

Em outro terminal, inicie a aplicação:

```bash
npm run dev
```

A API local utiliza `http://localhost:3000`.

## Organização da equipe

O desenvolvimento é realizado com Git e GitHub, utilizando branches específicas para funcionalidades, integração pela branch `develop` e Pull Requests para revisão e união do código.

## Melhorias futuras

- Autenticação segura no backend
- Banco de dados persistente
- Testes automatizados
- Configuração de API para produção
- Deploy completo da aplicação
- Ampliação das funcionalidades de interação entre pets
