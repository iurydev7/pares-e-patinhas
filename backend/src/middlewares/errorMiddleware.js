function errorMiddleware(erro, req, res, next) {
  // Registra o erro no terminal do servidor
  console.error(erro);

  const statusCode =
    Number.isInteger(erro.statusCode) &&
    erro.statusCode >= 400 &&
    erro.statusCode <= 599
      ? erro.statusCode
      : 500;

  const message =
    statusCode === 500
      ? "Não foi possível concluir sua solicitação."
      : erro.message || "Não foi possível concluir sua solicitação.";

  return res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = errorMiddleware;