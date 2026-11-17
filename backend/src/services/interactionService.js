const { Animal, Sequelize, sequelize } = require("../../models");

const { Op } = Sequelize;

const { validarInteracao } = require("../validators/interactionValidator");

const interactionRepository = require("../repositories/interactionRepository");
const matchRepository = require("../repositories/matchRepository");

function criarErro(statusCode, mensagem) {
  const erro = new Error(mensagem);
  erro.statusCode = statusCode;
  return erro;
}

async function registrarInteracao({
  tutorId,
  animalOrigemId,
  animalAlvoId,
  tipo,
}) {
  const idTutor = Number(tutorId);

  if (!Number.isSafeInteger(idTutor) || idTutor <= 0) {
    throw criarErro(401, "Tutor não autenticado.");
  }

  const dados = validarInteracao({
    animalOrigemId,
    animalAlvoId,
    tipo,
  });

  const origemId = dados.animalOrigemId;
  const alvoId = dados.animalAlvoId;

  try {
    return await sequelize.transaction(async (transaction) => {
      const animais = await Animal.findAll({
        where: {
          id: {
            [Op.in]: [origemId, alvoId],
          },
        },
        order: [["id", "ASC"]],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      const animalOrigem = animais.find((animal) => animal.id === origemId);

      const animalAlvo = animais.find((animal) => animal.id === alvoId);

      if (!animalOrigem) {
        throw criarErro(404, "Animal de origem não encontrado.");
      }

      if (Number(animalOrigem.tutorId) !== idTutor) {
        throw criarErro(403, "Este animal não pertence ao tutor autenticado.");
      }

      if (!animalAlvo) {
        throw criarErro(404, "Animal de destino não encontrado.");
      }

      if (Number(animalAlvo.tutorId) === idTutor) {
        throw criarErro(
          400,
          "Não é permitido interagir com animais do próprio tutor.",
        );
      }

      if (!animalOrigem.ativo || !animalOrigem.disponivel) {
        throw criarErro(409, "O animal de origem não está disponível.");
      }

      if (!animalAlvo.ativo || !animalAlvo.disponivel) {
        throw criarErro(409, "O animal de destino não está disponível.");
      }

      const interacaoExistente = await interactionRepository.buscarInteracao(
        origemId,
        alvoId,
        { transaction },
      );

      if (interacaoExistente) {
        throw criarErro(
          409,
          "Este animal já curtiu ou rejeitou o animal selecionado.",
        );
      }

      const interacao = await interactionRepository.criarInteracao(
        {
          tutorId: idTutor,
          animalOrigemId: origemId,
          animalAlvoId: alvoId,
          tipo: dados.tipo,
        },
        { transaction },
      );

      let match = null;

      if (dados.tipo === "like") {
        const curtidaReciproca =
          await interactionRepository.buscarCurtidaReciproca(origemId, alvoId, {
            transaction,
          });

        if (curtidaReciproca) {
          match = await matchRepository.buscarMatch(origemId, alvoId, {
            transaction,
          });

          if (!match) {
            match = await matchRepository.criarMatch(origemId, alvoId, {
              transaction,
            });
          }
        }
      }

      return {
        mensagem: match
          ? "Interação registrada. Deu match!"
          : "Interação registrada com sucesso.",
        interacao: {
          id: interacao.id,
          animalOrigemId: origemId,
          animalAlvoId: alvoId,
          tipo: interacao.tipo,
        },
        deuMatch: Boolean(match),
        match: match
          ? {
              id: match.id,
              animal1Id: match.animal_1_id,
              animal2Id: match.animal_2_id,
            }
          : null,
      };
    });
  } catch (erro) {
    if (erro instanceof Sequelize.UniqueConstraintError) {
      throw criarErro(409, "Esta interação ou match já foi registrado.");
    }

    throw erro;
  }
}

module.exports = {
  registrarInteracao,
};
