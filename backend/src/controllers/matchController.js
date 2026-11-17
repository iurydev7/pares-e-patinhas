const matchService = require("../services/matchService");

async function listar(req, res, next) {
  try {
    const { animalId } = req.query;

    const tutorId = req.auth.tutorId;

    const resultado = await matchService.listarMatches({
      tutorId,
      animalId,
    });

    return res.status(200).json(resultado);
  } catch (erro) {
    return next(erro);
  }
}

module.exports = {
  listar,
};
