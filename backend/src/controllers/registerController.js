const { cadastrarTutor } = require("../services/registerService");

async function register(req, res, next) {
  try {
    const { nome, email, senha } = req.body ?? {};

    const resultado = await cadastrarTutor({
      nome,
      email,
      senha,
    });

    res.set("Cache-Control", "no-store");

    return res.status(201).json({
      success: true,
      message: "Tutor cadastrado com sucesso.",
      ...resultado,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { register };