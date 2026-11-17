const { Animal, FotoAnimal, Interacao, Sequelize } = require("../../models");

const { Op } = Sequelize;

function criarErro(status, mensagem) {
  const erro = new Error(mensagem);
  erro.statusCode = status;
  return erro;
}

function serializarAnimal(animal) {
  const dados = animal.toJSON();
  const fotos = (dados.fotos || [])
    .slice()
    .sort((a, b) => a.ordem - b.ordem)
    .map((foto) => foto.url);

  return {
    ...dados,
    fotos,
    foto: fotos[0] || "",
  };
}

function normalizarValor(valor) {
  return String(valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

async function listarAnimais({
  tutorId,
  animalId,
  especie,
  sexo,
  cidade,
  estado,
  page = 1,
  limit = 10,
}) {
  const idTutor = Number(tutorId);
  const idAnimal = Number(animalId);
  const pagina = Number(page);
  const limite = Number(limit);

  if (!Number.isSafeInteger(idTutor) || idTutor <= 0) {
    throw criarErro(401, "Tutor não autenticado.");
  }

  if (!Number.isSafeInteger(idAnimal) || idAnimal <= 0) {
    throw criarErro(400, "Informe um ID de animal válido.");
  }

  if (!Number.isSafeInteger(pagina) || pagina < 1) {
    throw criarErro(400, "Página inválida.");
  }

  if (!Number.isSafeInteger(limite) || limite < 1 || limite > 100) {
    throw criarErro(400, "O limite deve estar entre 1 e 100.");
  }

  const animalOrigem = await Animal.findByPk(idAnimal);

  if (!animalOrigem) {
    throw criarErro(404, "Animal selecionado não encontrado.");
  }

  if (Number(animalOrigem.tutorId) !== idTutor) {
    throw criarErro(403, "Este animal não pertence ao tutor.");
  }

  if (!animalOrigem.ativo || !animalOrigem.disponivel) {
    throw criarErro(409, "Este animal não está disponível para farejar.");
  }

  const especieOrigem = normalizarValor(animalOrigem.especie);
  const especiesPermitidas = ["cachorro", "gato", "outro"];

  if (!especiesPermitidas.includes(especieOrigem)) {
    throw criarErro(409, "A espécie do animal selecionado é inválida.");
  }

  const sexoOrigem = normalizarValor(animalOrigem.sexo);
  const sexosPermitidos = ["macho", "femea"];

  if (!sexosPermitidos.includes(sexoOrigem)) {
    throw criarErro(409, "O sexo do animal selecionado é inválido.");
  }

  const sexoAlvo = sexoOrigem === "macho" ? "femea" : "macho";

  if (
    especie !== undefined &&
    especie !== "" &&
    normalizarValor(especie) !== especieOrigem
  ) {
    throw criarErro(
      400,
      "A espécie informada deve ser a mesma do animal selecionado.",
    );
  }

  if (sexo !== undefined && sexo !== "" && normalizarValor(sexo) !== sexoAlvo) {
    throw criarErro(
      400,
      "O sexo informado deve ser o oposto ao do animal selecionado.",
    );
  }

  const interacoesAnteriores = await Interacao.findAll({
    attributes: ["animal_alvo_id"],
    where: {
      animal_origem_id: idAnimal,
    },
    raw: true,
  });

  const idsExcluidos = [
    idAnimal,
    ...interacoesAnteriores.map((interacao) =>
      Number(interacao.animal_alvo_id),
    ),
  ];

  const filtros = {
    [Op.and]: [
      Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("especie")),
        especieOrigem,
      ),
      Sequelize.where(
        Sequelize.fn(
          "REPLACE",
          Sequelize.fn("LOWER", Sequelize.col("sexo")),
          "ê",
          "e",
        ),
        sexoAlvo,
      ),
    ],
    id: {
      [Op.notIn]: idsExcluidos,
    },
    tutorId: {
      [Op.ne]: idTutor,
    },
    ativo: true,
    disponivel: true,
  };

  if (cidade !== undefined && cidade !== "") {
    const cidadeNormalizada = String(cidade).trim();

    if (!cidadeNormalizada || cidadeNormalizada.length > 100) {
      throw criarErro(400, "Cidade inválida.");
    }

    filtros.cidade = cidadeNormalizada;
  }

  if (estado !== undefined && estado !== "") {
    const estadoNormalizado = String(estado).trim().toUpperCase();

    if (!/^[A-Z]{2}$/.test(estadoNormalizado)) {
      throw criarErro(400, "Estado inválido.");
    }

    filtros.estado = estadoNormalizado;
  }

  const resultado = await Animal.findAndCountAll({
    attributes: [
      "id",
      "nome",
      "especie",
      "sexo",
      "raca",
      "idadeAnos",
      "idadeMeses",
      "porte",
      "descricao",
      "cidade",
      "estado",
    ],
    include: [
      {
        model: FotoAnimal,
        as: "fotos",
        attributes: ["url", "ordem"],
        required: false,
      },
    ],
    where: filtros,
    limit: limite,
    offset: (pagina - 1) * limite,
    order: [["id", "DESC"]],
    distinct: true,
  });

  return {
    total: resultado.count,
    pagina,
    limite,
    totalPaginas: Math.ceil(resultado.count / limite),
    animais: resultado.rows.map(serializarAnimal),
  };
}

module.exports = {
  listarAnimais,
};
