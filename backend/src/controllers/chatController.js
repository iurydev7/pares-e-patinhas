const chatService = require("../services/chatService");

// Respostas do chat nunca ficam em cache do navegador ou de intermediários.
function semCache(res) {
  res.set("Cache-Control", "no-store");
}

async function listarConversas(req, res, next) {
  try {
    const conversas = await chatService.listarConversas(req.auth.tutorId);

    semCache(res);

    return res.status(200).json({ success: true, conversas });
  } catch (error) {
    return next(error);
  }
}

async function listarMensagens(req, res, next) {
  try {
    const { depoisDe, antesDe, limite } = req.query ?? {};

    const resultado = await chatService.listarMensagens(
      req.auth.tutorId,
      req.params.matchId,
      { depoisDe, antesDe, limite }
    );

    semCache(res);

    return res.status(200).json({ success: true, ...resultado });
  } catch (error) {
    return next(error);
  }
}

async function enviarMensagem(req, res, next) {
  try {
    // Só o campo `texto` é lido do corpo: remetente e conversa vêm do token e da URL.
    const { texto } = req.body ?? {};

    const mensagem = await chatService.enviarMensagem(
      req.auth.tutorId,
      req.params.matchId,
      { texto }
    );

    semCache(res);

    return res.status(201).json({ success: true, mensagem });
  } catch (error) {
    return next(error);
  }
}

async function bloquear(req, res, next) {
  try {
    const bloqueio = await chatService.bloquear(
      req.auth.tutorId,
      req.params.matchId
    );

    semCache(res);

    return res.status(200).json({ success: true, ...bloqueio });
  } catch (error) {
    return next(error);
  }
}

async function desbloquear(req, res, next) {
  try {
    const bloqueio = await chatService.desbloquear(
      req.auth.tutorId,
      req.params.matchId
    );

    semCache(res);

    return res.status(200).json({ success: true, ...bloqueio });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listarConversas,
  listarMensagens,
  enviarMensagem,
  bloquear,
  desbloquear,
};
