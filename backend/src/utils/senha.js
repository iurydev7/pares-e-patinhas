const SENHA_MIN = 8;
const SENHA_MAX_BYTES = 72; // limite do bcrypt

const MENSAGEM_SENHA_FORTE =
  "A senha deve ter pelo menos 8 caracteres, com letra maiúscula, letra minúscula, número e caractere especial (ex.: ! @ # $ %).";

/** Senha forte: 8+ caracteres (até 72 bytes) com maiúscula, minúscula, número e caractere especial. */
function senhaForte(senha) {
  return (
    typeof senha === "string" &&
    senha.length >= SENHA_MIN &&
    Buffer.byteLength(senha, "utf8") <= SENHA_MAX_BYTES &&
    /\p{Lu}/u.test(senha) &&
    /\p{Ll}/u.test(senha) &&
    /\p{N}/u.test(senha) &&
    /[^\p{L}\p{N}\s]/u.test(senha)
  );
}

module.exports = { senhaForte, MENSAGEM_SENHA_FORTE };
