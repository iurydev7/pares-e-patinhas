const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Tutor } = require("../../models");

async function autenticarTutor({ email, senha }) {
  if (
    typeof email !== "string" ||
    typeof senha !== "string" ||
    !email.trim() ||
    !senha
  ) {
    const error = new Error("E-mail e senha são obrigatórios.");
    error.statusCode = 400;
    throw error;
  }

  const tutor = await Tutor.findOne({
    where: {
      email: email.trim().toLowerCase(),
    },
  });

  if (!tutor) {
    const error = new Error("E-mail ou senha inválidos.");
    error.statusCode = 401;
    throw error;
  }

  const senhaValida = await bcrypt.compare(
    senha,
    tutor.senhaHash
  );

  if (!senhaValida) {
    const error = new Error("E-mail ou senha inválidos.");
    error.statusCode = 401;
    throw error;
  }

  // Só depois de a senha conferir: não revela a ninguém mais que a conta existe.
  if (!tutor.emailVerificado) {
    const error = new Error("Confirme seu e-mail para entrar.");
    error.statusCode = 403;
    error.codigoErro = "EMAIL_NAO_VERIFICADO";
    throw error;
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET não configurado.");
  }

  const token = jwt.sign(
    { sub: String(tutor.id) },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "2h",
      algorithm: "HS256",
    }
  );

  return {
    token,
    tutor: {
      id: tutor.id,
      nome: tutor.nome,
      email: tutor.email,
      foto: tutor.foto || "",
    },
  };
}

module.exports = { autenticarTutor };