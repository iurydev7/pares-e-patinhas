const jwt = require("jsonwebtoken");

/** Gera o JWT de sessão do tutor (mesmo formato usado no login). */
function gerarToken(tutor) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET não configurado.");
  }

  return jwt.sign({ sub: String(tutor.id) }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "2h",
    algorithm: "HS256",
  });
}

module.exports = { gerarToken };
