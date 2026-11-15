function notFoundMiddleware(req, res) {
  return res.status(404).json({
    success: false,
    message: "Não encontramos o recurso solicitado.",
  });
}

module.exports = notFoundMiddleware;