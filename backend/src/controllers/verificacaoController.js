const {
  verificarEmail,
  reenviarCodigo,
} = require("../services/verificacaoService");

async function verifyEmail(req, res, next) {
  try {
    const { email, codigo } = req.body ?? {};

    const resultado = await verificarEmail({ email, codigo });

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      success: true,
      message: "E-mail confirmado com sucesso.",
      ...resultado,
    });
  } catch (error) {
    return next(error);
  }
}

async function resendCode(req, res, next) {
  try {
    const { email } = req.body ?? {};

    await reenviarCodigo({ email });

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      success: true,
      message:
        "Se houver um cadastro pendente para este e-mail, um novo código foi enviado.",
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { verifyEmail, resendCode };
