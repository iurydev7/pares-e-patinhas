const { Tutor } = require("../../models");
const erroHttp = require("../utils/erroHttp");
const { gerarToken } = require("../utils/token");
const emailService = require("./emailService");
const {
  gerarCodigo,
  hashCodigo,
  codigoConfere,
  VALIDADE_MINUTOS,
  MAX_TENTATIVAS,
  INTERVALO_REENVIO_SEGUNDOS,
} = require("../utils/codigoVerificacao");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const codigoInvalido = () =>
  erroHttp("Código inválido ou expirado.", 400, "CODIGO_INVALIDO");

function normalizarEmail(email) {
  const emailLimpo = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (emailLimpo.length > 255 || !EMAIL_REGEX.test(emailLimpo)) {
    throw erroHttp("Informe um e-mail válido.", 400);
  }

  return emailLimpo;
}

/** Impede disparar vários e-mails seguidos para o mesmo endereço. */
function exigirIntervaloDeReenvio(tutor) {
  if (!tutor.codigoEnviadoEm) return;

  const restante =
    INTERVALO_REENVIO_SEGUNDOS * 1000 -
    (Date.now() - new Date(tutor.codigoEnviadoEm).getTime());

  if (restante > 0) {
    throw erroHttp(
      `Aguarde ${Math.ceil(restante / 1000)} segundos para pedir um novo código.`,
      429,
      "AGUARDE_REENVIO"
    );
  }
}

/** Gera um código novo (invalida o anterior), salva só o hash e envia por e-mail. */
async function emitirCodigo(tutor) {
  const codigo = gerarCodigo();

  await tutor.update({
    codigoVerificacaoHash: hashCodigo(tutor.id, codigo),
    codigoExpiraEm: new Date(Date.now() + VALIDADE_MINUTOS * 60 * 1000),
    codigoTentativas: 0,
    codigoEnviadoEm: new Date(),
  });

  try {
    await emailService.enviarCodigoVerificacao({
      para: tutor.email,
      nome: tutor.nome,
      codigo,
    });
  } catch (erro) {
    console.error("[email] Falha ao enviar o código de verificação:", erro.message);

    // Libera uma nova tentativa imediata, já que nada chegou ao usuário.
    await tutor.update({ codigoEnviadoEm: null });

    throw erroHttp(
      "Não foi possível enviar o e-mail de verificação. Tente novamente em instantes.",
      502,
      "EMAIL_NAO_ENVIADO"
    );
  }
}

/** Confere o código, marca o e-mail como verificado e já devolve a sessão (token). */
async function verificarEmail({ email, codigo }) {
  const emailLimpo = normalizarEmail(email);
  const codigoLimpo = typeof codigo === "string" ? codigo.trim() : "";

  if (!/^\d{6}$/.test(codigoLimpo)) {
    throw erroHttp("Informe o código de 6 dígitos enviado por e-mail.", 400);
  }

  const tutor = await Tutor.findOne({ where: { email: emailLimpo } });

  if (!tutor || tutor.emailVerificado || !tutor.codigoVerificacaoHash) {
    throw codigoInvalido();
  }

  if (new Date(tutor.codigoExpiraEm).getTime() <= Date.now()) {
    throw codigoInvalido();
  }

  if (tutor.codigoTentativas >= MAX_TENTATIVAS) {
    throw erroHttp(
      "Muitas tentativas. Peça um novo código.",
      429,
      "TENTATIVAS_EXCEDIDAS"
    );
  }

  if (!codigoConfere(tutor.id, codigoLimpo, tutor.codigoVerificacaoHash)) {
    await tutor.increment("codigoTentativas");
    throw codigoInvalido();
  }

  await tutor.update({
    emailVerificado: true,
    codigoVerificacaoHash: null,
    codigoExpiraEm: null,
    codigoTentativas: 0,
    codigoEnviadoEm: null,
  });

  return {
    token: gerarToken(tutor),
    tutor: {
      id: tutor.id,
      nome: tutor.nome,
      email: tutor.email,
      foto: tutor.foto || "",
    },
  };
}

/** Não faz nada (sem erro) quando não há cadastro pendente, para não revelar quais e-mails têm conta. */
async function reenviarCodigo({ email }) {
  const emailLimpo = normalizarEmail(email);
  const tutor = await Tutor.findOne({ where: { email: emailLimpo } });

  if (tutor && !tutor.emailVerificado) {
    exigirIntervaloDeReenvio(tutor);
    await emitirCodigo(tutor);
  }
}

module.exports = {
  emitirCodigo,
  exigirIntervaloDeReenvio,
  verificarEmail,
  reenviarCodigo,
};
