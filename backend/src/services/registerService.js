
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Tutor } = require("../../models");

function erroHttp(mensagem, statusCode) {
  const erro = new Error(mensagem);
  erro.statusCode = statusCode;
  return erro;
}

async function cadastrarTutor({ nome, email, senha }) {
  if (
    typeof nome !== "string" ||
    typeof email !== "string" ||
    typeof senha !== "string"
  ) {
    throw erroHttp("Nome, e-mail e senha são obrigatórios.", 400);
  }

  const nomeLimpo = nome.trim();
  const emailLimpo = email.trim().toLowerCase();

  if (nomeLimpo.length < 2 || nomeLimpo.length > 120) {
    throw erroHttp("O nome deve ter entre 2 e 120 caracteres.", 400);
  }

  if (
    emailLimpo.length > 255 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)
  ) {
    throw erroHttp("Informe um e-mail válido.", 400);
  }

  if (senha.length < 8 || Buffer.byteLength(senha, "utf8") > 72) {
    throw erroHttp(
      "A senha deve ter pelo menos 8 caracteres e até 72 bytes.",
      400
    );
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET não configurado.");
  }

  const existente = await Tutor.findOne({
    where: { email: emailLimpo },
    attributes: ["id"],
  });

  if (existente) {
    throw erroHttp("Este e-mail já está cadastrado.", 409);
  }

  const senhaHash = await bcrypt.hash(senha, 12);

  let tutor;

  try {
    tutor = await Tutor.create({
      nome: nomeLimpo,
      email: emailLimpo,
      senhaHash,
    });
  } catch (erro) {
    if (erro.name === "SequelizeUniqueConstraintError") {
      throw erroHttp("Este e-mail já está cadastrado.", 409);
    }

    throw erro;
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
    },
  };
}

module.exports = { cadastrarTutor };
