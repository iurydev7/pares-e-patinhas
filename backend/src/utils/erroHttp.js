/**
 * Erro com status HTTP, tratado pelo errorMiddleware.
 * `codigo` (opcional) é um identificador estável que o frontend usa para decidir o que mostrar.
 */
function erroHttp(mensagem, statusCode, codigo) {
  const erro = new Error(mensagem);
  erro.statusCode = statusCode;
  if (codigo) erro.codigoErro = codigo;
  return erro;
}

module.exports = erroHttp;
