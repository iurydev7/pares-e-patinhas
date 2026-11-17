const { Tutor } = require("../../models");
const erroHttp = require("../utils/erroHttp");
const { validarDataUrlImagem } = require("../utils/validarImagem");

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
        "foto",
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

async function atualizarFoto(req, res, next) {
  try {
    const fotoEnviada = req.body?.foto;

    if (fotoEnviada === undefined) {
      throw erroHttp("Envie a foto do tutor ou uma string vazia para removê-la.", 400);
    }

    const foto =
      fotoEnviada === "" || fotoEnviada === null
        ? null
        : validarDataUrlImagem(fotoEnviada);
    const tutor = await Tutor.findByPk(req.auth.tutorId);

    if (!tutor) {
      return res.status(401).json({
        success: false,
        message: "Sessão inválida. Faça login novamente.",
      });
    }

    await tutor.update({ foto });

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      success: true,
      tutor: {
        id: tutor.id,
        nome: tutor.nome,
        email: tutor.email,
        cidade: tutor.cidade,
        estado: tutor.estado,
        foto: tutor.foto || "",
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { me, atualizarFoto };