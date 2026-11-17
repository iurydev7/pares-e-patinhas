const { Animal, Sequelize } = require("../../models");

const { Op } = Sequelize;

const matchRepository = require("../repositories/matchRepository");

function criarErro(statusCode, mensagem) {
  const erro = new Error(mensagem);
  erro.statusCode = statusCode;
  return erro;
}

async function listarMatches({ tutorId, animalId }) {
  const idTutor = Number(tutorId);
  const idAnimal = Number(animalId);

  if (!Number.isSafeInteger(idTutor) || idTutor <= 0) {
    throw criarErro(401, "Tutor não autenticado.");
  }

  if (!Number.isSafeInteger(idAnimal) || idAnimal <= 0) {
    throw criarErro(400, "Informe um ID de animal válido.");
  }

  const animalOrigem = await Animal.findByPk(idAnimal);

  if (!animalOrigem) {
    throw criarErro(404, "Animal não encontrado.");
  }

  if (Number(animalOrigem.tutorId) !== idTutor) {
    throw criarErro(403, "Este animal não pertence ao tutor autenticado.");
  }

  if (!animalOrigem.ativo) {
    throw criarErro(
      409,
      "O animal está desativado e não pode consultar matches.",
    );
  }

  const registros = await matchRepository.listarMatchesPorAnimal(idAnimal);

  if (registros.length === 0) {
    return {
      total: 0,
      matches: [],
    };
  }

  const idsCorrespondentes = registros.map((match) => {
    return Number(match.animal_1_id) === idAnimal
      ? Number(match.animal_2_id)
      : Number(match.animal_1_id);
  });

  const animaisCorrespondentes = await Animal.findAll({
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
    where: {
      id: {
        [Op.in]: idsCorrespondentes,
      },
      ativo: true,
    },
    raw: true,
  });

  const animaisPorId = new Map(
    animaisCorrespondentes.map((animal) => [Number(animal.id), animal]),
  );

  const matches = registros.flatMap((match) => {
    const idCorrespondente =
      Number(match.animal_1_id) === idAnimal
        ? Number(match.animal_2_id)
        : Number(match.animal_1_id);

    const animalCorrespondente = animaisPorId.get(idCorrespondente);

    if (!animalCorrespondente) {
      return [];
    }

    return [
      {
        id: match.id,
        animal: animalCorrespondente,
        criadoEm: match.createdAt,
      },
    ];
  });

  return {
    total: matches.length,
    matches,
  };
}

module.exports = {
  listarMatches,
};
