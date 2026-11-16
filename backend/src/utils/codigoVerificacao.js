const crypto = require("crypto");

const VALIDADE_MINUTOS = 15;
const MAX_TENTATIVAS = 5;
const INTERVALO_REENVIO_SEGUNDOS = 60;

/** Código numérico de 6 dígitos gerado com fonte criptográfica. */
function gerarCodigo() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

/** HMAC do código amarrado ao tutor: um vazamento do banco não revela os códigos. */
function hashCodigo(tutorId, codigo) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET não configurado.");
  }

  return crypto
    .createHmac("sha256", process.env.JWT_SECRET)
    .update(`${tutorId}:${codigo}`)
    .digest("hex");
}

/** Comparação em tempo constante. */
function codigoConfere(tutorId, codigo, hashSalvo) {
  const calculado = Buffer.from(hashCodigo(tutorId, codigo));
  const salvo = Buffer.from(String(hashSalvo));

  return (
    calculado.length === salvo.length &&
    crypto.timingSafeEqual(calculado, salvo)
  );
}

module.exports = {
  gerarCodigo,
  hashCodigo,
  codigoConfere,
  VALIDADE_MINUTOS,
  MAX_TENTATIVAS,
  INTERVALO_REENVIO_SEGUNDOS,
};
