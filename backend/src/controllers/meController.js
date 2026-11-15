const { Tutor } = require("../../models");

async function me(req, res, next) {
  try {
  
    const tutorId = req.auth.tutorId;

    const tutor = await Tutor.findByPk(tutorId, {
      attributes: [
        "id",
        "nome",
        "email",
        "cidade",
        "estado",
      ],
    });

    if (!tutor) {
      return res.status(401).json({
        success: false,
        message: "Sessão inválida. Faça login novamente.",
      });
    }

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      success: true,
      tutor,
    });

  } catch (error) {
    return next(error);
  }
}

module.exports = { me };