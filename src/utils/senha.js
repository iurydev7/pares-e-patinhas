// Mesmas regras validadas no backend (backend/src/utils/senha.js).
// O backend é quem decide; aqui é só para orientar o usuário enquanto digita.
export const REGRAS_SENHA = [
  { id: 'tamanho', rotulo: 'Pelo menos 8 caracteres', teste: (senha) => senha.length >= 8 && new TextEncoder().encode(senha).length <= 72 },
  { id: 'maiuscula', rotulo: 'Uma letra maiúscula', teste: (senha) => /\p{Lu}/u.test(senha) },
  { id: 'minuscula', rotulo: 'Uma letra minúscula', teste: (senha) => /\p{Ll}/u.test(senha) },
  { id: 'numero', rotulo: 'Um número', teste: (senha) => /\p{N}/u.test(senha) },
  { id: 'especial', rotulo: 'Um caractere especial (ex.: ! @ # $ %)', teste: (senha) => /[^\p{L}\p{N}\s]/u.test(senha) },
]

export const senhaForte = (senha) => REGRAS_SENHA.every((regra) => regra.teste(senha))
