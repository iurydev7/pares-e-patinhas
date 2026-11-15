const { autenticarTutor } = require("../services/loginService");

async function login(req, res, next) {
  try {

    const { email, senha } = req.body ?? {};

    const resultado = await autenticarTutor({
      email,
      senha,
    });

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      success: true,
      message: "Login realizado com sucesso.",
      ...resultado,
    });

  } catch (error) {

    return next(error);
  }
}

module.exports = { login };