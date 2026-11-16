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

  // `code` é um identificador estável para o frontend (ex.: EMAIL_NAO_VERIFICADO).
  const code =
    statusCode !== 500 && typeof erro.codigoErro === "string"
      ? erro.codigoErro
      : undefined;

  return res.status(statusCode).json({
    success: false,
    message,
    ...(code ? { code } : {}),
  });
}

module.exports = errorMiddleware;