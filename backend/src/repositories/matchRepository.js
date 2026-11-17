const { Match, Sequelize } = require("../../models");

const { Op } = Sequelize;

function organizarAnimais(animalOrigemId, animalAlvoId) {
  const animal1Id = Math.min(animalOrigemId, animalAlvoId);
  const animal2Id = Math.max(animalOrigemId, animalAlvoId);

  return {
    animal_1_id: animal1Id,
    animal_2_id: animal2Id,
  };
}

async function buscarMatch(animalOrigemId, animalAlvoId, options = {}) {
  const animais = organizarAnimais(animalOrigemId, animalAlvoId);

  return Match.findOne({
    ...options,
    where: animais,
  });
}

async function criarMatch(animalOrigemId, animalAlvoId, options = {}) {
  const animais = organizarAnimais(animalOrigemId, animalAlvoId);

  return Match.create(animais, options);
}

async function listarMatchesPorAnimal(animalId, options = {}) {
  return Match.findAll({
    ...options,
    where: {
      [Op.or]: [{ animal_1_id: animalId }, { animal_2_id: animalId }],
    },
    order: [["created_at", "DESC"]],
  });
}

module.exports = {
  buscarMatch,
  criarMatch,
  listarMatchesPorAnimal,
};
