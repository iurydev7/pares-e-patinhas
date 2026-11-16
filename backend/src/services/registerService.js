const bcrypt = require("bcrypt");
const { Tutor } = require("../../models");
const erroHttp = require("../utils/erroHttp");
const { senhaForte, MENSAGEM_SENHA_FORTE } = require("../utils/senha");
const { emitirCodigo, exigirIntervaloDeReenvio } = require("./verificacaoService");

/**
 * Cria o tutor como NÃO verificado e envia o código de 6 dígitos para o e-mail informado.
 * A sessão (token) só é entregue depois da confirmação em POST /api/auth/verify-email.
 *
 * Se o e-mail já existe mas nunca foi confirmado, o cadastro é refeito: quem digitou
 * o e-mail de outra pessoa não consegue "prender" o endereço.
 */
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

  if (!senhaForte(senha)) {
    throw erroHttp(MENSAGEM_SENHA_FORTE, 400, "SENHA_FRACA");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET não configurado.");
  }

  let tutor = await Tutor.findOne({
    where: { email: emailLimpo },
  });

  if (tutor && tutor.emailVerificado) {
    throw erroHttp("Este e-mail já está cadastrado.", 409, "EMAIL_DUPLICADO");
  }

  if (tutor) {
    exigirIntervaloDeReenvio(tutor);
  }

  const senhaHash = await bcrypt.hash(senha, 12);

  if (tutor) {
    await tutor.update({ nome: nomeLimpo, senhaHash });
  } else {
    try {
      tutor = await Tutor.create({
        nome: nomeLimpo,
        email: emailLimpo,
        senhaHash,
      });
    } catch (erro) {
      if (erro.name === "SequelizeUniqueConstraintError") {
        throw erroHttp("Este e-mail já está cadastrado.", 409, "EMAIL_DUPLICADO");
      }

      throw erro;
    }
  }

  await emitirCodigo(tutor);

  return {
    verificacaoPendente: true,
    tutor: {
      id: tutor.id,
      nome: tutor.nome,
      email: tutor.email,
    },
  };
}

module.exports = { cadastrarTutor };
