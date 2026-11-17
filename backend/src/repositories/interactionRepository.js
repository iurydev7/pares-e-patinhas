const { Interacao } = require("../../models");

async function buscarInteracao(animalOrigemId, animalAlvoId, options = {}) {
  return Interacao.findOne({
    where: {
      animal_origem_id: animalOrigemId,
      animal_alvo_id: animalAlvoId,
    },
    ...options,
  });
}

async function buscarCurtidaReciproca(
  animalOrigemId,
  animalAlvoId,
  options = {},
) {
  return Interacao.findOne({
    where: {
      animal_origem_id: animalAlvoId,
      animal_alvo_id: animalOrigemId,
      tipo: "like",
    },
    ...options,
  });
}

async function criarInteracao(
  { tutorId, animalOrigemId, animalAlvoId, tipo },
  options = {},
) {
  return Interacao.create(
    {
      tutor_id: tutorId,
      animal_origem_id: animalOrigemId,
      animal_alvo_id: animalAlvoId,
      tipo,
    },
    options,
  );
}

module.exports = {
  buscarInteracao,
  buscarCurtidaReciproca,
  criarInteracao,
};
