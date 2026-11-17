const { Op } = require("sequelize");
const {
  Tutor,
  Animal,
  Match,
  Mensagem,
  BloqueioChat,
} = require("../../models");
const erroHttp = require("../utils/erroHttp");
const {
  criptografiaAtiva,
  cifrar,
  decifrar,
} = require("../utils/criptografiaChat");

const TAMANHO_MAXIMO_TEXTO = 1000;
const LIMITE_PADRAO = 30;
const LIMITE_MAXIMO = 50;
const MAX_CONVERSAS = 100;
const MAX_MENSAGENS_POR_MINUTO = 20;

// O conteúdo das conversas nunca vai para o log de SQL do servidor.
const SEM_LOG = { logging: false };

// Mesma resposta para "conversa não existe" e "conversa de outras pessoas":
// quem não participa não descobre quais conversas existem.
const conversaNaoEncontrada = () =>
  erroHttp("Conversa não encontrada.", 404, "CONVERSA_NAO_ENCONTRADA");

/** Aceita somente inteiros positivos (número ou texto só com dígitos). */
function idPositivo(valor) {
  const texto =
    typeof valor === "number" || typeof valor === "string" ? String(valor) : "";

  return /^[1-9]\d{0,9}$/.test(texto) ? Number(texto) : null;
}

function idOpcional(valor, nome) {
  if (valor === undefined || valor === null || valor === "") return null;

  const id = idPositivo(valor);

  if (id === null) {
    throw erroHttp(`Parâmetro "${nome}" inválido.`, 400, "PARAMETRO_INVALIDO");
  }

  return id;
}

/**
 * Carrega a conversa (match) e confirma que o tutor autenticado é dono de um dos dois pets.
 * É a ÚNICA porta de entrada para ler ou escrever em uma conversa.
 */
async function obterConversa(tutorIdBruto, matchIdBruto) {
  const tutorId = idPositivo(tutorIdBruto);
  const matchId = idPositivo(matchIdBruto);

  if (tutorId === null) {
    throw erroHttp("Autenticação necessária.", 401);
  }

  if (matchId === null) {
    throw conversaNaoEncontrada();
  }

  const match = await Match.findByPk(matchId, SEM_LOG);

  if (!match) {
    throw conversaNaoEncontrada();
  }

  const animais = await Animal.findAll({
    where: { id: { [Op.in]: [match.animal_1_id, match.animal_2_id] } },
    attributes: ["id", "nome", "tutorId"],
    ...SEM_LOG,
  });

  const animal1 = animais.find((a) => a.id === match.animal_1_id);
  const animal2 = animais.find((a) => a.id === match.animal_2_id);

  if (!animal1 || !animal2) {
    throw conversaNaoEncontrada();
  }

  const meuPet = [animal1, animal2].find((a) => Number(a.tutorId) === tutorId);
  const outroPet = [animal1, animal2].find((a) => Number(a.tutorId) !== tutorId);

  // Não participa, ou o match é entre dois pets do mesmo tutor (não há com quem conversar).
  if (!meuPet || !outroPet) {
    throw conversaNaoEncontrada();
  }

  return {
    matchId,
    tutorId,
    outroTutorId: Number(outroPet.tutorId),
    meuPet: { id: meuPet.id, nome: meuPet.nome },
    outroPet: { id: outroPet.id, nome: outroPet.nome },
    criadaEm: match.createdAt,
  };
}

/** Situação de bloqueio entre os dois tutores (vale para todas as conversas entre eles). */
async function obterBloqueio(tutorId, outroTutorId) {
  const bloqueios = await BloqueioChat.findAll({
    where: {
      [Op.or]: [
        { bloqueador_tutor_id: tutorId, bloqueado_tutor_id: outroTutorId },
        { bloqueador_tutor_id: outroTutorId, bloqueado_tutor_id: tutorId },
      ],
    },
    ...SEM_LOG,
  });

  return {
    bloqueada: bloqueios.length > 0,
    bloqueadaPorMim: bloqueios.some(
      (b) => Number(b.bloqueador_tutor_id) === tutorId
    ),
  };
}

/** Formato enviado ao frontend: nunca expõe o id do remetente nem o conteúdo cifrado. */
function formatarMensagem(mensagem, tutorId) {
  const texto = mensagem.cifrada
    ? decifrar(mensagem.texto, mensagem.match_id)
    : mensagem.texto;

  return {
    id: mensagem.id,
    texto: texto === null ? "" : texto,
    // true quando a mensagem está cifrada e não pôde ser lida (chave ausente ou trocada)
    indisponivel: texto === null,
    minha: Number(mensagem.remetente_tutor_id) === tutorId,
    lida: mensagem.lida_em !== null && mensagem.lida_em !== undefined,
    enviadaEm: mensagem.createdAt,
  };
}

function validarTexto(texto) {
  if (typeof texto !== "string") {
    throw erroHttp("Escreva uma mensagem.", 400, "MENSAGEM_INVALIDA");
  }

  // Remove caracteres de controle (exceto quebra de linha e tabulação) e espaços nas pontas.
  // eslint-disable-next-line no-control-regex
  const limpo = texto.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();

  if (!limpo) {
    throw erroHttp("Escreva uma mensagem.", 400, "MENSAGEM_INVALIDA");
  }

  if (limpo.length > TAMANHO_MAXIMO_TEXTO) {
    throw erroHttp(
      `A mensagem pode ter no máximo ${TAMANHO_MAXIMO_TEXTO} caracteres.`,
      400,
      "MENSAGEM_INVALIDA"
    );
  }

  return limpo;
}

/** Lista as conversas (matches) do tutor, com a última mensagem e a contagem de não lidas. */
async function listarConversas(tutorIdBruto) {
  const tutorId = idPositivo(tutorIdBruto);

  if (tutorId === null) {
    throw erroHttp("Autenticação necessária.", 401);
  }

  const meusAnimais = await Animal.findAll({
    where: { tutorId },
    attributes: ["id", "nome", "tutorId"],
    ...SEM_LOG,
  });

  if (meusAnimais.length === 0) return [];

  const meusIds = meusAnimais.map((a) => a.id);

  const matches = await Match.findAll({
    where: {
      [Op.or]: [
        { animal_1_id: { [Op.in]: meusIds } },
        { animal_2_id: { [Op.in]: meusIds } },
      ],
    },
    order: [["id", "DESC"]],
    limit: MAX_CONVERSAS,
    ...SEM_LOG,
  });

  if (matches.length === 0) return [];

  const idsOutros = [
    ...new Set(
      matches
        .flatMap((m) => [m.animal_1_id, m.animal_2_id])
        .filter((id) => !meusIds.includes(id))
    ),
  ];

  const outrosAnimais = idsOutros.length
    ? await Animal.findAll({
        where: { id: { [Op.in]: idsOutros } },
        attributes: ["id", "nome", "tutorId"],
        ...SEM_LOG,
      })
    : [];

  const idsTutores = [...new Set(outrosAnimais.map((a) => Number(a.tutorId)))];

  // Só o nome do outro tutor: e-mail e demais dados nunca saem daqui.
  const tutores = idsTutores.length
    ? await Tutor.findAll({
        where: { id: { [Op.in]: idsTutores } },
        attributes: ["id", "nome"],
        ...SEM_LOG,
      })
    : [];

  const conversas = [];

  for (const match of matches) {
    const ids = [match.animal_1_id, match.animal_2_id];
    const meuPet = meusAnimais.find((a) => ids.includes(a.id));
    const outroPet = outrosAnimais.find(
      (a) => ids.includes(a.id) && Number(a.tutorId) !== tutorId
    );

    // Ignora match entre dois pets do mesmo tutor ou com pet removido.
    if (!meuPet || !outroPet) continue;

    const outroTutorId = Number(outroPet.tutorId);
    const outroTutor = tutores.find((t) => Number(t.id) === outroTutorId);

    const ultima = await Mensagem.findOne({
      where: { match_id: match.id },
      order: [["id", "DESC"]],
      ...SEM_LOG,
    });

    const naoLidas = await Mensagem.count({
      where: {
        match_id: match.id,
        remetente_tutor_id: outroTutorId,
        lida_em: null,
      },
      ...SEM_LOG,
    });

    const bloqueio = await obterBloqueio(tutorId, outroTutorId);

    conversas.push({
      matchId: match.id,
      meuPet: { id: meuPet.id, nome: meuPet.nome },
      outroPet: { id: outroPet.id, nome: outroPet.nome },
      outroTutor: { nome: outroTutor ? outroTutor.nome : "Tutor" },
      ultimaMensagem: ultima ? formatarMensagem(ultima, tutorId) : null,
      naoLidas,
      ...bloqueio,
    });
  }

  return conversas;
}

/**
 * Mensagens de uma conversa, em ordem cronológica.
 * - depoisDe: só mensagens com id maior (usado na atualização periódica do chat aberto)
 * - antesDe:  só mensagens com id menor (carregar histórico mais antigo)
 * Marca como lidas as mensagens recebidas que foram devolvidas.
 */
async function listarMensagens(tutorIdBruto, matchIdBruto, opcoes = {}) {
  const conversa = await obterConversa(tutorIdBruto, matchIdBruto);

  const depoisDe = idOpcional(opcoes.depoisDe, "depoisDe");
  const antesDe = idOpcional(opcoes.antesDe, "antesDe");

  let limite = LIMITE_PADRAO;

  if (opcoes.limite !== undefined && opcoes.limite !== null && opcoes.limite !== "") {
    const pedido = idPositivo(opcoes.limite);

    if (pedido === null) {
      throw erroHttp('Parâmetro "limite" inválido.', 400, "PARAMETRO_INVALIDO");
    }

    limite = Math.min(pedido, LIMITE_MAXIMO);
  }

  const where = { match_id: conversa.matchId };

  if (depoisDe !== null && antesDe !== null) {
    where.id = { [Op.gt]: depoisDe, [Op.lt]: antesDe };
  } else if (depoisDe !== null) {
    where.id = { [Op.gt]: depoisDe };
  } else if (antesDe !== null) {
    where.id = { [Op.lt]: antesDe };
  }

  // Com "depoisDe" a página começa nas mais antigas; sem ele, traz as mais recentes.
  const crescente = depoisDe !== null;

  const encontradas = await Mensagem.findAll({
    where,
    order: [["id", crescente ? "ASC" : "DESC"]],
    limit: limite,
    ...SEM_LOG,
  });

  const mensagens = crescente ? encontradas : encontradas.slice().reverse();

  const idsRecebidasNaoLidas = mensagens
    .filter(
      (m) =>
        Number(m.remetente_tutor_id) === conversa.outroTutorId &&
        (m.lida_em === null || m.lida_em === undefined)
    )
    .map((m) => m.id);

  if (idsRecebidasNaoLidas.length > 0) {
    await Mensagem.update(
      { lida_em: new Date() },
      {
        where: {
          id: { [Op.in]: idsRecebidasNaoLidas },
          match_id: conversa.matchId,
          remetente_tutor_id: conversa.outroTutorId,
        },
        ...SEM_LOG,
      }
    );
  }

  const outroTutor = await Tutor.findByPk(conversa.outroTutorId, {
    attributes: ["id", "nome"],
    ...SEM_LOG,
  });

  const bloqueio = await obterBloqueio(conversa.tutorId, conversa.outroTutorId);

  return {
    conversa: {
      matchId: conversa.matchId,
      meuPet: conversa.meuPet,
      outroPet: conversa.outroPet,
      outroTutor: { nome: outroTutor ? outroTutor.nome : "Tutor" },
      ...bloqueio,
    },
    mensagens: mensagens.map((m) => formatarMensagem(m, conversa.tutorId)),
    // true quando a página veio cheia: pode haver mais mensagens na mesma direção
    temMais: encontradas.length === limite,
  };
}

/** Envia uma mensagem. O remetente é SEMPRE o tutor do token, nunca um valor vindo do corpo. */
async function enviarMensagem(tutorIdBruto, matchIdBruto, corpo) {
  const conversa = await obterConversa(tutorIdBruto, matchIdBruto);
  const texto = validarTexto(corpo ? corpo.texto : undefined);

  const bloqueio = await obterBloqueio(conversa.tutorId, conversa.outroTutorId);

  if (bloqueio.bloqueada) {
    throw erroHttp(
      "Não é possível enviar mensagens nesta conversa.",
      403,
      "CONVERSA_BLOQUEADA"
    );
  }

  const recentes = await Mensagem.count({
    where: {
      remetente_tutor_id: conversa.tutorId,
      createdAt: { [Op.gte]: new Date(Date.now() - 60 * 1000) },
    },
    ...SEM_LOG,
  });

  if (recentes >= MAX_MENSAGENS_POR_MINUTO) {
    throw erroHttp(
      "Você enviou muitas mensagens em pouco tempo. Aguarde um instante.",
      429,
      "MUITAS_MENSAGENS"
    );
  }

  const cifrada = criptografiaAtiva();

  let mensagem;

  try {
    mensagem = await Mensagem.create(
      {
        match_id: conversa.matchId,
        remetente_tutor_id: conversa.tutorId,
        texto: cifrada ? cifrar(texto, conversa.matchId) : texto,
        cifrada,
      },
      SEM_LOG
    );
  } catch (erro) {
    // O erro original do banco carrega o SQL e os valores (o texto da mensagem) e seria
    // impresso no log pelo errorMiddleware. Sobe um erro novo, só com o tipo da falha.
    // eslint-disable-next-line preserve-caught-error
    throw new Error(`Falha ao gravar a mensagem (${erro.name || "erro de banco"}).`);
  }

  return formatarMensagem(mensagem, conversa.tutorId);
}

/** Bloqueia o outro tutor da conversa: ninguém envia mensagens enquanto houver bloqueio. */
async function bloquear(tutorIdBruto, matchIdBruto) {
  const conversa = await obterConversa(tutorIdBruto, matchIdBruto);

  const dados = {
    bloqueador_tutor_id: conversa.tutorId,
    bloqueado_tutor_id: conversa.outroTutorId,
  };

  const existente = await BloqueioChat.findOne({ where: dados, ...SEM_LOG });

  if (!existente) {
    try {
      await BloqueioChat.create(dados, SEM_LOG);
    } catch (erro) {
      // Duas requisições ao mesmo tempo: o índice único do banco garante um só registro.
      if (erro.name !== "SequelizeUniqueConstraintError") throw erro;
    }
  }

  return obterBloqueio(conversa.tutorId, conversa.outroTutorId);
}

/** Remove apenas o bloqueio feito pelo próprio tutor (não desfaz o bloqueio do outro). */
async function desbloquear(tutorIdBruto, matchIdBruto) {
  const conversa = await obterConversa(tutorIdBruto, matchIdBruto);

  await BloqueioChat.destroy({
    where: {
      bloqueador_tutor_id: conversa.tutorId,
      bloqueado_tutor_id: conversa.outroTutorId,
    },
    ...SEM_LOG,
  });

  return obterBloqueio(conversa.tutorId, conversa.outroTutorId);
}

module.exports = {
  listarConversas,
  listarMensagens,
  enviarMensagem,
  bloquear,
  desbloquear,
  TAMANHO_MAXIMO_TEXTO,
  LIMITE_MAXIMO,
  MAX_MENSAGENS_POR_MINUTO,
};
