const interactionService = require("../services/interactionService");

async function registrar(req, res, next) {
  try {
    const { animalOrigemId, animalAlvoId, tipo } = req.body;

    const tutorId = req.auth.tutorId;

    const resultado = await interactionService.registrarInteracao({
      tutorId,
      animalOrigemId,
      animalAlvoId,
      tipo,
    });

    return res.status(201).json(resultado);
  } catch (erro) {
    return next(erro);
  }
}

module.exports = {
  registrar,
};
