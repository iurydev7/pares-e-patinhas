const farejarService = require("../services/farejarService");

async function listar(req, res, next) {
  try {
    const { animalId, especie, sexo, cidade, estado, page, limit } = req.query;

    const tutorId = req.auth.tutorId;

    const resultado = await farejarService.listarAnimais({
      tutorId,
      animalId,
      especie,
      sexo,
      cidade,
      estado,
      page,
      limit,
    });

    return res.status(200).json(resultado);
  } catch (error) {
    return next(error);
  }
}

module.exports = { listar };
