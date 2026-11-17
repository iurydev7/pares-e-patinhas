function criarErroValidacao(mensagem) {
  const erro = new Error(mensagem);
  erro.statusCode = 400;
  return erro;
}

function validarInteracao(dados) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    throw criarErroValidacao("Dados da interação inválidos.");
  }

  const { animalOrigemId, animalAlvoId, tipo } = dados;

  const origemId = Number(animalOrigemId);
  const alvoId = Number(animalAlvoId);

  if (!Number.isSafeInteger(origemId) || origemId <= 0) {
    throw criarErroValidacao("ID do animal de origem inválido.");
  }

  if (!Number.isSafeInteger(alvoId) || alvoId <= 0) {
    throw criarErroValidacao("ID do animal de destino inválido.");
  }

  if (origemId === alvoId) {
    throw criarErroValidacao("Um animal não pode interagir consigo mesmo.");
  }

  if (tipo !== "like" && tipo !== "dislike") {
    throw criarErroValidacao("O tipo da interação deve ser like ou dislike.");
  }

  return {
    animalOrigemId: origemId,
    animalAlvoId: alvoId,
    tipo,
  };
}

module.exports = {
  validarInteracao,
};
