/**
 * Testes de segurança do chat entre matches.
 *
 *   node --test tests/chat.seguranca.node.js
 *
 * Exercitam o código real de src/ com o banco trocado por tabelas em memória
 * (veja tests/helpers/ambienteFalso.js). Não precisam de MySQL nem de internet.
 */
const { describe, it, beforeEach, after } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");

const {
  RAIZ,
  jwt,
  models,
  consultas,
  limparBanco,
  criarResposta,
  temExpress,
} = require("./helpers/ambienteFalso");

const src = (arquivo) => require(path.join(RAIZ, "src", arquivo));

const chat = src("services/chatService");
const chatController = src("controllers/chatController");
const authMiddleware = src("middlewares/authMiddlewares");
const errorMiddleware = src("middlewares/errorMiddleware");
const { cifrar, decifrar } = src("utils/criptografiaChat");

const { Tutor, Animal, Match, Mensagem, BloqueioChat } = models;

// Tutores: Ana (1) e Bruno (2) deram match. Carla (3) é a "intrusa": tem conta e
// um match próprio com Bruno, mas não participa da conversa 100.
const ANA = 1;
const BRUNO = 2;
const CARLA = 3;
const CONVERSA_ANA_BRUNO = 100;
const CONVERSA_BRUNO_CARLA = 101;
const MATCH_MESMO_TUTOR = 102;
const CHAVE = "a".repeat(64);
const OUTRA_CHAVE = "b".repeat(64);

function montarCenario() {
  limparBanco();
  delete process.env.CHAT_CHAVE_CRIPTOGRAFIA;

  Tutor._inserir({ id: ANA, nome: "Ana", email: "ana@privado.com", senhaHash: "$2b$hash-da-ana" });
  Tutor._inserir({ id: BRUNO, nome: "Bruno", email: "bruno@privado.com", senhaHash: "$2b$hash-do-bruno" });
  Tutor._inserir({ id: CARLA, nome: "Carla", email: "carla@privado.com", senhaHash: "$2b$hash-da-carla" });

  Animal._inserir({ id: 10, nome: "Bento", tutorId: ANA });
  Animal._inserir({ id: 11, nome: "Maya", tutorId: ANA });
  Animal._inserir({ id: 20, nome: "Nina", tutorId: BRUNO });
  Animal._inserir({ id: 30, nome: "Zeca", tutorId: CARLA });

  Match._inserir({ id: CONVERSA_ANA_BRUNO, animal_1_id: 10, animal_2_id: 20 });
  Match._inserir({ id: CONVERSA_BRUNO_CARLA, animal_1_id: 20, animal_2_id: 30 });
  Match._inserir({ id: MATCH_MESMO_TUTOR, animal_1_id: 10, animal_2_id: 11 });

  consultas.length = 0;
}

/** Espera uma falha com o status (e, se informado, o código) indicado e devolve o erro. */
async function falha(promessa, status, codigo) {
  let erro = null;

  try {
    await promessa;
  } catch (capturado) {
    erro = capturado;
  }

  assert.ok(erro, `deveria ter falhado com ${status}`);
  assert.equal(erro.statusCode, status, `status inesperado: ${erro.message}`);
  if (codigo) assert.equal(erro.codigoErro, codigo);

  return erro;
}

const enviar = (tutor, conversa, texto) => chat.enviarMensagem(tutor, conversa, { texto });
const ler = (tutor, conversa, opcoes) => chat.listarMensagens(tutor, conversa, opcoes);

beforeEach(montarCenario);
after(() => {
  delete process.env.CHAT_CHAVE_CRIPTOGRAFIA;
});

describe("1. Controle de acesso: só quem deu match participa da conversa", () => {
  it("participantes leem e escrevem; cada um vê as próprias mensagens como 'minha'", async () => {
    await enviar(ANA, CONVERSA_ANA_BRUNO, "Oi, Bruno!");
    await enviar(BRUNO, CONVERSA_ANA_BRUNO, "Oi, Ana!");

    const visaoAna = await ler(ANA, CONVERSA_ANA_BRUNO);
    assert.deepEqual(visaoAna.mensagens.map((m) => [m.texto, m.minha]), [["Oi, Bruno!", true], ["Oi, Ana!", false]]);
    assert.equal(visaoAna.conversa.outroTutor.nome, "Bruno");
    assert.deepEqual(visaoAna.conversa.outroPet, { id: 20, nome: "Nina" });

    const visaoBruno = await ler(BRUNO, CONVERSA_ANA_BRUNO);
    assert.deepEqual(visaoBruno.mensagens.map((m) => m.minha), [false, true]);
  });

  it("quem não participa recebe 404 em TODAS as operações (ler, enviar, bloquear, desbloquear)", async () => {
    await enviar(ANA, CONVERSA_ANA_BRUNO, "mensagem particular");

    await falha(ler(CARLA, CONVERSA_ANA_BRUNO), 404, "CONVERSA_NAO_ENCONTRADA");
    await falha(enviar(CARLA, CONVERSA_ANA_BRUNO, "invasão"), 404, "CONVERSA_NAO_ENCONTRADA");
    await falha(chat.bloquear(CARLA, CONVERSA_ANA_BRUNO), 404, "CONVERSA_NAO_ENCONTRADA");
    await falha(chat.desbloquear(CARLA, CONVERSA_ANA_BRUNO), 404, "CONVERSA_NAO_ENCONTRADA");

    assert.equal(Mensagem._linhas.length, 1, "nenhuma mensagem do intruso foi gravada");
    assert.equal(BloqueioChat._linhas.length, 0, "nenhum bloqueio do intruso foi gravado");
    assert.equal(Mensagem._linhas[0].lida_em, undefined, "a tentativa não marcou nada como lido");
  });

  it("conversa de terceiros e conversa inexistente dão a MESMA resposta (não revela quais conversas existem)", async () => {
    const deTerceiros = await falha(ler(CARLA, CONVERSA_ANA_BRUNO), 404);
    const inexistente = await falha(ler(CARLA, 999999), 404);

    assert.equal(deTerceiros.message, inexistente.message);
    assert.equal(deTerceiros.codigoErro, inexistente.codigoErro);
  });

  it("ids malformados ou maliciosos são recusados antes de chegar ao banco", async () => {
    const maliciosos = [
      "abc", "", " ", "0", "-1", "1.5", "1e3", "100 OR 1=1", "100; DROP TABLE mensagens", "100--",
      "0x64", "١٠٠", "99999999999999999999", null, undefined, true, {}, [], [100], { id: 100 }, NaN, Infinity, -100, 100.5,
    ];

    for (const id of maliciosos) {
      await falha(ler(ANA, id), 404, "CONVERSA_NAO_ENCONTRADA");
      await falha(enviar(ANA, id, "oi"), 404, "CONVERSA_NAO_ENCONTRADA");
    }

    assert.equal(consultas.length, 0, "nenhuma consulta foi feita com esses valores");
  });

  it("identidade inválida do tutor é recusada (401) sem consultar o banco", async () => {
    for (const tutor of [undefined, null, "", "abc", "1 OR 1=1", 0, -1, {}, [ANA]]) {
      await falha(ler(tutor, CONVERSA_ANA_BRUNO), 401);
      await falha(enviar(tutor, CONVERSA_ANA_BRUNO, "oi"), 401);
      await falha(chat.listarConversas(tutor), 401);
    }

    assert.equal(consultas.length, 0);
  });

  it("match entre dois pets do mesmo tutor não vira conversa", async () => {
    await falha(ler(ANA, MATCH_MESMO_TUTOR), 404);
    await falha(enviar(ANA, MATCH_MESMO_TUTOR, "falando sozinha"), 404);
  });

  it("a lista de conversas traz só os matches do próprio tutor", async () => {
    const daAna = await chat.listarConversas(ANA);
    const daCarla = await chat.listarConversas(CARLA);
    const doBruno = await chat.listarConversas(BRUNO);

    assert.deepEqual(daAna.map((c) => c.matchId), [CONVERSA_ANA_BRUNO]);
    assert.deepEqual(daCarla.map((c) => c.matchId), [CONVERSA_BRUNO_CARLA]);
    assert.deepEqual(doBruno.map((c) => c.matchId).sort(), [CONVERSA_ANA_BRUNO, CONVERSA_BRUNO_CARLA]);

    Tutor._inserir({ id: 4, nome: "Davi", email: "davi@privado.com", senhaHash: "x" });
    assert.deepEqual(await chat.listarConversas(4), [], "tutor sem pets não vê nada");
  });

  it("mantém o histórico acessível aos dois tutores e identifica mensagens recebidas", async () => {
    await enviar(ANA, CONVERSA_ANA_BRUNO, "Oi, Bruno!");

    const conversaAna = (await chat.listarConversas(ANA)).find(
      (conversa) => conversa.matchId === CONVERSA_ANA_BRUNO
    );
    const conversaBruno = (await chat.listarConversas(BRUNO)).find(
      (conversa) => conversa.matchId === CONVERSA_ANA_BRUNO
    );

    assert.equal(conversaAna.matchId, CONVERSA_ANA_BRUNO);
    assert.equal(conversaBruno.matchId, CONVERSA_ANA_BRUNO);
    assert.equal(conversaAna.ultimaMensagem.texto, "Oi, Bruno!");
    assert.equal(conversaAna.ultimaMensagem.minha, true);
    assert.equal(conversaBruno.ultimaMensagem.texto, "Oi, Bruno!");
    assert.equal(conversaBruno.ultimaMensagem.minha, false);
    assert.equal(conversaAna.naoLidas, 0);
    assert.equal(conversaBruno.naoLidas, 1);
  });

  it("não é possível se passar por outro remetente nem gravar em outra conversa pelo corpo da requisição", async () => {
    await chat.enviarMensagem(ANA, CONVERSA_ANA_BRUNO, {
      texto: "tentativa de falsificação",
      remetente_tutor_id: BRUNO,
      remetenteTutorId: BRUNO,
      tutorId: BRUNO,
      match_id: CONVERSA_BRUNO_CARLA,
      matchId: CONVERSA_BRUNO_CARLA,
      id: 1,
      cifrada: true,
      lida_em: new Date(),
    });

    assert.equal(Mensagem._linhas.length, 1);
    const gravada = Mensagem._linhas[0];
    assert.equal(gravada.remetente_tutor_id, ANA);
    assert.equal(gravada.match_id, CONVERSA_ANA_BRUNO);
    assert.equal(gravada.cifrada, false);
    assert.equal(gravada.lida_em, undefined);
  });

  it("mensagens de uma conversa nunca aparecem em outra", async () => {
    await enviar(BRUNO, CONVERSA_BRUNO_CARLA, "segredo entre Bruno e Carla");
    await enviar(ANA, CONVERSA_ANA_BRUNO, "oi");

    const visaoAna = await ler(ANA, CONVERSA_ANA_BRUNO);
    assert.deepEqual(visaoAna.mensagens.map((m) => m.texto), ["oi"]);

    const novas = await ler(ANA, CONVERSA_ANA_BRUNO, { depoisDe: 1 });
    assert.ok(novas.mensagens.every((m) => m.texto !== "segredo entre Bruno e Carla"));

    const antigas = await ler(ANA, CONVERSA_ANA_BRUNO, { antesDe: 999 });
    assert.ok(antigas.mensagens.every((m) => m.texto !== "segredo entre Bruno e Carla"));
  });
});

describe("2. Exposição de dados: a API devolve só o necessário", () => {
  it("nenhuma resposta do chat contém e-mail, hash de senha ou ids de tutores", async () => {
    await enviar(ANA, CONVERSA_ANA_BRUNO, "oi");
    await enviar(BRUNO, CONVERSA_ANA_BRUNO, "olá");

    const respostas = JSON.stringify([
      await chat.listarConversas(ANA),
      await ler(ANA, CONVERSA_ANA_BRUNO),
      await enviar(ANA, CONVERSA_ANA_BRUNO, "tudo bem?"),
      await chat.bloquear(ANA, CONVERSA_ANA_BRUNO),
      await chat.desbloquear(ANA, CONVERSA_ANA_BRUNO),
    ]);

    assert.doesNotMatch(respostas, /@privado\.com/);
    assert.doesNotMatch(respostas, /hash/i);
    assert.doesNotMatch(respostas, /senha/i);
    assert.doesNotMatch(respostas, /remetente|tutor_id|tutorId|bloqueador|bloqueado_/);
  });

  it("toda consulta à tabela de tutores pede apenas id e nome", async () => {
    await enviar(ANA, CONVERSA_ANA_BRUNO, "oi");
    await chat.listarConversas(ANA);
    await ler(BRUNO, CONVERSA_ANA_BRUNO);

    const deTutores = consultas.filter((c) => c.modelo === "Tutor");
    assert.ok(deTutores.length > 0);
    for (const consulta of deTutores) {
      assert.deepEqual(consulta.opcoes.attributes, ["id", "nome"]);
    }
  });

  it("a mensagem devolvida tem exatamente os campos previstos", async () => {
    const mensagem = await enviar(ANA, CONVERSA_ANA_BRUNO, "oi");
    assert.deepEqual(Object.keys(mensagem).sort(), ["enviadaEm", "id", "indisponivel", "lida", "minha", "texto"]);

    const [conversa] = await chat.listarConversas(ANA);
    assert.deepEqual(Object.keys(conversa).sort(), [
      "bloqueada", "bloqueadaPorMim", "matchId", "meuPet", "naoLidas", "outroPet", "outroTutor", "ultimaMensagem",
    ]);
    assert.deepEqual(Object.keys(conversa.outroTutor), ["nome"]);
  });

  it("se o banco falhar ao gravar, o texto da mensagem não vai para o log de erros", async () => {
    const original = Mensagem.create;
    Mensagem.create = async (dados) => {
      throw Object.assign(new Error("Data too long"), {
        name: "SequelizeDatabaseError",
        sql: "INSERT INTO mensagens ...",
        parameters: [dados.texto],
      });
    };

    const registrado = [];
    const silenciar = console.error;
    console.error = (...args) => registrado.push(require("node:util").inspect(args, { depth: 6 }));

    try {
      const req = { auth: { tutorId: String(ANA) }, params: { matchId: String(CONVERSA_ANA_BRUNO) }, body: { texto: "meu telefone é 85 99999-0000" } };
      const res = criarResposta();
      await chatController.enviarMensagem(req, res, (erro) => errorMiddleware(erro, req, res, () => {}));

      assert.equal(res.statusCode, 500);
      assert.doesNotMatch(JSON.stringify(res.corpo), /99999|INSERT/);
      assert.ok(registrado.length > 0, "o erro foi registrado");
      assert.doesNotMatch(registrado.join("\n"), /99999-0000|telefone/);
    } finally {
      Mensagem.create = original;
      console.error = silenciar;
    }
  });

  it("nenhuma consulta do chat é escrita no log de SQL (logging: false em todas)", async () => {
    await enviar(ANA, CONVERSA_ANA_BRUNO, "conteúdo que não pode ir para o log");
    await ler(BRUNO, CONVERSA_ANA_BRUNO);
    await chat.listarConversas(ANA);
    await chat.bloquear(ANA, CONVERSA_ANA_BRUNO);
    await chat.desbloquear(ANA, CONVERSA_ANA_BRUNO);

    assert.ok(consultas.length > 10);
    for (const consulta of consultas) {
      assert.equal(consulta.opcoes.logging, false, `${consulta.modelo}.${consulta.metodo} sem logging: false`);
    }
  });
});

describe("3. Validação de entrada", () => {
  it("recusa mensagem que não é texto, vazia ou só com espaços", async () => {
    for (const texto of [undefined, null, 123, true, {}, [], ["oi"], { texto: "oi" }, "", "   ", "\n\t ", "\u0000\u0007"]) {
      await falha(enviar(ANA, CONVERSA_ANA_BRUNO, texto), 400, "MENSAGEM_INVALIDA");
    }
    await falha(chat.enviarMensagem(ANA, CONVERSA_ANA_BRUNO, undefined), 400, "MENSAGEM_INVALIDA");
    await falha(chat.enviarMensagem(ANA, CONVERSA_ANA_BRUNO, null), 400, "MENSAGEM_INVALIDA");

    assert.equal(Mensagem._linhas.length, 0);
  });

  it("limite de 1000 caracteres: 1000 passa, 1001 não", async () => {
    await enviar(ANA, CONVERSA_ANA_BRUNO, "a".repeat(1000));
    await falha(enviar(ANA, CONVERSA_ANA_BRUNO, "a".repeat(1001)), 400, "MENSAGEM_INVALIDA");
    await falha(enviar(ANA, CONVERSA_ANA_BRUNO, "a".repeat(100000)), 400, "MENSAGEM_INVALIDA");

    assert.equal(Mensagem._linhas.length, 1);
  });

  it("remove caracteres de controle e espaços nas pontas, preservando quebras de linha e acentos", async () => {
    const mensagem = await enviar(ANA, CONVERSA_ANA_BRUNO, "  Olá\u0000,\u0008 tudo\nbem? 🐾 ção \u007F ");
    assert.equal(mensagem.texto, "Olá, tudo\nbem? 🐾 ção");
  });

  it("HTML, scripts e SQL são guardados e devolvidos como texto comum, sem interpretação", async () => {
    const ataques = [
      "<script>alert('xss')</script>",
      "<img src=x onerror=alert(1)>",
      "'; DROP TABLE mensagens; --",
      "\" OR \"1\"=\"1",
      "${process.env.JWT_SECRET}",
      "{{constructor.constructor('return process')()}}",
    ];

    for (const ataque of ataques) await enviar(ANA, CONVERSA_ANA_BRUNO, ataque);

    const { mensagens } = await ler(BRUNO, CONVERSA_ANA_BRUNO);
    assert.deepEqual(mensagens.map((m) => m.texto), ataques);
    assert.doesNotMatch(JSON.stringify(mensagens), /segredo-apenas-para-testes/);
  });

  it("paginação: limite máximo de 50 por página e parâmetros inválidos recusados", async () => {
    for (let i = 0; i < 60; i += 1) {
      Mensagem._inserir({ match_id: CONVERSA_ANA_BRUNO, remetente_tutor_id: BRUNO, texto: `m${i}`, cifrada: false, lida_em: null });
    }

    assert.equal((await ler(ANA, CONVERSA_ANA_BRUNO)).mensagens.length, 30);
    assert.equal((await ler(ANA, CONVERSA_ANA_BRUNO, { limite: "50" })).mensagens.length, 50);
    assert.equal((await ler(ANA, CONVERSA_ANA_BRUNO, { limite: "100000" })).mensagens.length, 50);

    for (const limite of ["abc", "-1", "0", "5;", "1.5", {}, ["5"]]) {
      await falha(ler(ANA, CONVERSA_ANA_BRUNO, { limite }), 400, "PARAMETRO_INVALIDO");
    }
    for (const cursor of ["abc", "-1", "0", "1 OR 1=1", {}, ["1"]]) {
      await falha(ler(ANA, CONVERSA_ANA_BRUNO, { depoisDe: cursor }), 400, "PARAMETRO_INVALIDO");
      await falha(ler(ANA, CONVERSA_ANA_BRUNO, { antesDe: cursor }), 400, "PARAMETRO_INVALIDO");
    }
  });

  it("paginação: 'depoisDe' traz só as mais novas e 'antesDe' só as mais antigas, em ordem", async () => {
    for (let i = 1; i <= 10; i += 1) {
      Mensagem._inserir({ id: i, match_id: CONVERSA_ANA_BRUNO, remetente_tutor_id: BRUNO, texto: `m${i}`, cifrada: false, lida_em: null });
    }

    assert.deepEqual((await ler(ANA, CONVERSA_ANA_BRUNO, { depoisDe: "7" })).mensagens.map((m) => m.id), [8, 9, 10]);
    assert.deepEqual((await ler(ANA, CONVERSA_ANA_BRUNO, { antesDe: "4" })).mensagens.map((m) => m.id), [1, 2, 3]);
    assert.deepEqual((await ler(ANA, CONVERSA_ANA_BRUNO, { limite: "3" })).mensagens.map((m) => m.id), [8, 9, 10]);
    assert.deepEqual((await ler(ANA, CONVERSA_ANA_BRUNO, { depoisDe: "2", antesDe: "5" })).mensagens.map((m) => m.id), [3, 4]);
    assert.equal((await ler(ANA, CONVERSA_ANA_BRUNO, { limite: "3" })).temMais, true);
    assert.equal((await ler(ANA, CONVERSA_ANA_BRUNO, { depoisDe: "9" })).temMais, false);
  });
});

describe("4. Abuso: limite de envio, bloqueio e confirmação de leitura", () => {
  it("limite de 20 mensagens por minuto por tutor (a 21ª recebe 429)", async () => {
    for (let i = 0; i < 20; i += 1) await enviar(ANA, CONVERSA_ANA_BRUNO, `mensagem ${i}`);

    await falha(enviar(ANA, CONVERSA_ANA_BRUNO, "a 21ª"), 429, "MUITAS_MENSAGENS");
    assert.equal(Mensagem._linhas.length, 20);

    // o limite é por tutor: Bruno continua podendo responder
    await enviar(BRUNO, CONVERSA_ANA_BRUNO, "resposta do Bruno");

    // passado um minuto, Ana volta a poder enviar
    for (const linha of Mensagem._linhas) linha.createdAt = new Date(Date.now() - 61 * 1000);
    await enviar(ANA, CONVERSA_ANA_BRUNO, "depois do intervalo");
  });

  it("bloqueio impede o envio dos DOIS lados e só quem bloqueou pode desfazer", async () => {
    await enviar(BRUNO, CONVERSA_ANA_BRUNO, "antes do bloqueio");

    assert.deepEqual(await chat.bloquear(ANA, CONVERSA_ANA_BRUNO), { bloqueada: true, bloqueadaPorMim: true });

    await falha(enviar(BRUNO, CONVERSA_ANA_BRUNO, "insistindo"), 403, "CONVERSA_BLOQUEADA");
    await falha(enviar(ANA, CONVERSA_ANA_BRUNO, "também não"), 403, "CONVERSA_BLOQUEADA");
    assert.equal(Mensagem._linhas.length, 1);

    // o bloqueado vê que está bloqueado, mas não foi ele quem bloqueou
    assert.deepEqual((await ler(BRUNO, CONVERSA_ANA_BRUNO)).conversa.bloqueadaPorMim, false);
    assert.deepEqual((await ler(BRUNO, CONVERSA_ANA_BRUNO)).conversa.bloqueada, true);

    // o bloqueado tenta "desbloquear": nada muda
    assert.deepEqual(await chat.desbloquear(BRUNO, CONVERSA_ANA_BRUNO), { bloqueada: true, bloqueadaPorMim: false });
    await falha(enviar(BRUNO, CONVERSA_ANA_BRUNO, "ainda bloqueado"), 403, "CONVERSA_BLOQUEADA");

    assert.deepEqual(await chat.desbloquear(ANA, CONVERSA_ANA_BRUNO), { bloqueada: false, bloqueadaPorMim: false });
    await enviar(BRUNO, CONVERSA_ANA_BRUNO, "liberado");
  });

  it("bloquear duas vezes não duplica registro e o bloqueio não afeta outras pessoas", async () => {
    await chat.bloquear(ANA, CONVERSA_ANA_BRUNO);
    await chat.bloquear(ANA, CONVERSA_ANA_BRUNO);
    assert.equal(BloqueioChat._linhas.length, 1);

    // bloqueio mútuo: os dois registros existem e desfazer um não libera a conversa
    await chat.bloquear(BRUNO, CONVERSA_ANA_BRUNO);
    assert.equal(BloqueioChat._linhas.length, 2);
    await chat.desbloquear(ANA, CONVERSA_ANA_BRUNO);
    await falha(enviar(ANA, CONVERSA_ANA_BRUNO, "oi"), 403, "CONVERSA_BLOQUEADA");

    // a conversa de Bruno com Carla segue normal
    await enviar(CARLA, CONVERSA_BRUNO_CARLA, "oi, Bruno");
    await enviar(BRUNO, CONVERSA_BRUNO_CARLA, "oi, Carla");
  });

  it("corrida ao bloquear (índice único do banco) não vira erro para o usuário", async () => {
    const original = BloqueioChat.findOne;
    BloqueioChat.findOne = async () => null; // simula duas requisições simultâneas
    try {
      await chat.bloquear(ANA, CONVERSA_ANA_BRUNO);
      await chat.bloquear(ANA, CONVERSA_ANA_BRUNO);
    } finally {
      BloqueioChat.findOne = original;
    }
    assert.equal(BloqueioChat._linhas.length, 1);
  });

  it("ler marca como lidas só as mensagens RECEBIDAS, e só nesta conversa", async () => {
    await enviar(ANA, CONVERSA_ANA_BRUNO, "da Ana");
    await enviar(BRUNO, CONVERSA_ANA_BRUNO, "do Bruno");
    await enviar(BRUNO, CONVERSA_BRUNO_CARLA, "para a Carla");

    assert.equal((await chat.listarConversas(ANA))[0].naoLidas, 1);

    // quem enviou lê a própria conversa: a mensagem dele continua "não lida" para o outro
    await ler(BRUNO, CONVERSA_ANA_BRUNO);
    const [daAna, doBruno, paraCarla] = Mensagem._linhas;
    assert.ok(daAna.lida_em instanceof Date, "Bruno leu a mensagem da Ana");
    assert.equal(doBruno.lida_em, undefined, "a mensagem do Bruno ainda não foi lida pela Ana");
    assert.equal(paraCarla.lida_em, undefined, "outra conversa não foi tocada");

    await ler(ANA, CONVERSA_ANA_BRUNO);
    assert.ok(Mensagem._linhas[1].lida_em instanceof Date);
    assert.equal((await chat.listarConversas(ANA))[0].naoLidas, 0);
    assert.equal(Mensagem._linhas[2].lida_em, undefined);
  });
});

describe("5. Criptografia das mensagens no banco (AES-256-GCM)", () => {
  it("com a chave configurada, o banco guarda só o conteúdo cifrado e a leitura devolve o texto", async () => {
    process.env.CHAT_CHAVE_CRIPTOGRAFIA = CHAVE;

    const enviada = await enviar(ANA, CONVERSA_ANA_BRUNO, "Meu endereço é Rua das Flores, 123");
    assert.equal(enviada.texto, "Meu endereço é Rua das Flores, 123");

    const gravada = Mensagem._linhas[0];
    assert.equal(gravada.cifrada, true);
    assert.doesNotMatch(gravada.texto, /Flores|endereço|123/);
    assert.match(gravada.texto, /^[A-Za-z0-9+/=]+$/);

    const { mensagens } = await ler(BRUNO, CONVERSA_ANA_BRUNO);
    assert.equal(mensagens[0].texto, "Meu endereço é Rua das Flores, 123");
    assert.equal(mensagens[0].indisponivel, false);
  });

  it("o mesmo texto cifrado duas vezes gera resultados diferentes (IV aleatório)", () => {
    process.env.CHAT_CHAVE_CRIPTOGRAFIA = CHAVE;
    const a = cifrar("oi", 100);
    const b = cifrar("oi", 100);
    assert.notEqual(a, b);
    assert.equal(decifrar(a, 100), "oi");
    assert.equal(decifrar(b, 100), "oi");
  });

  it("conteúdo adulterado no banco é detectado e não é exibido", async () => {
    process.env.CHAT_CHAVE_CRIPTOGRAFIA = CHAVE;
    await enviar(ANA, CONVERSA_ANA_BRUNO, "texto original");

    const linha = Mensagem._linhas[0];
    const bytes = Buffer.from(linha.texto, "base64");
    bytes[bytes.length - 1] ^= 0xff;
    linha.texto = bytes.toString("base64");

    const { mensagens } = await ler(BRUNO, CONVERSA_ANA_BRUNO);
    assert.equal(mensagens[0].indisponivel, true);
    assert.equal(mensagens[0].texto, "");
  });

  it("texto cifrado copiado para outra conversa não é aceito", () => {
    process.env.CHAT_CHAVE_CRIPTOGRAFIA = CHAVE;
    const cifrado = cifrar("só para a conversa 100", 100);
    assert.equal(decifrar(cifrado, 100), "só para a conversa 100");
    assert.equal(decifrar(cifrado, 101), null);
  });

  it("chave errada, ausente ou dado truncado: a API não quebra nem vaza o conteúdo cifrado", async () => {
    process.env.CHAT_CHAVE_CRIPTOGRAFIA = CHAVE;
    await enviar(ANA, CONVERSA_ANA_BRUNO, "segredo");
    const cifrado = Mensagem._linhas[0].texto;

    process.env.CHAT_CHAVE_CRIPTOGRAFIA = OUTRA_CHAVE;
    let { mensagens } = await ler(BRUNO, CONVERSA_ANA_BRUNO);
    assert.deepEqual([mensagens[0].texto, mensagens[0].indisponivel], ["", true]);

    delete process.env.CHAT_CHAVE_CRIPTOGRAFIA;
    ({ mensagens } = await ler(BRUNO, CONVERSA_ANA_BRUNO));
    assert.deepEqual([mensagens[0].texto, mensagens[0].indisponivel], ["", true]);
    assert.doesNotMatch(JSON.stringify(mensagens), new RegExp(cifrado.replace(/[+/=]/g, "\\$&")));

    process.env.CHAT_CHAVE_CRIPTOGRAFIA = CHAVE;
    assert.equal(decifrar("", 100), null);
    assert.equal(decifrar("YWJj", 100), null);
    assert.equal(decifrar(null, 100), null);
  });

  it("chave em formato inválido impede o envio em vez de gravar texto desprotegido", async () => {
    for (const chave of ["curta", "z".repeat(64), "a".repeat(63), "a".repeat(65)]) {
      process.env.CHAT_CHAVE_CRIPTOGRAFIA = chave;
      await assert.rejects(enviar(ANA, CONVERSA_ANA_BRUNO, "oi"), /CHAT_CHAVE_CRIPTOGRAFIA inválida/);
    }
    assert.equal(Mensagem._linhas.length, 0);
  });

  it("mensagens antigas em texto puro continuam legíveis depois de ativar a chave", async () => {
    await enviar(ANA, CONVERSA_ANA_BRUNO, "antes da chave");
    process.env.CHAT_CHAVE_CRIPTOGRAFIA = CHAVE;
    await enviar(ANA, CONVERSA_ANA_BRUNO, "depois da chave");

    const { mensagens } = await ler(BRUNO, CONVERSA_ANA_BRUNO);
    assert.deepEqual(mensagens.map((m) => m.texto), ["antes da chave", "depois da chave"]);
    assert.deepEqual(Mensagem._linhas.map((l) => l.cifrada), [false, true]);
  });
});

describe("6. Autenticação e camada HTTP (middleware + controller)", () => {
  const token = (sub, segredo = process.env.JWT_SECRET, opcoes = { expiresIn: 3600, algorithm: "HS256" }) =>
    jwt.sign({ sub }, segredo, opcoes);

  function autenticar(authorization) {
    const req = { headers: authorization === undefined ? {} : { authorization } };
    const res = criarResposta();
    let passou = false;
    authMiddleware(req, res, () => {
      passou = true;
    });
    return { req, res, passou };
  }

  it("sem token, com esquema errado ou token malformado: 401 e a requisição para ali", () => {
    for (const cabecalho of [undefined, "", "Bearer", "Bearer ", "Basic abc", "Token abc", "Bearer lixo", "Bearer a.b.c", "bearer"]) {
      const { res, passou } = autenticar(cabecalho);
      assert.equal(passou, false, `passou com: ${cabecalho}`);
      assert.equal(res.statusCode, 401);
      assert.equal(res.corpo.success, false);
    }
  });

  it("token assinado com outro segredo, expirado, sem assinatura ('alg: none') ou com 'sub' malicioso: 401", () => {
    const b64 = (objeto) => Buffer.from(JSON.stringify(objeto)).toString("base64url");
    const semAssinatura = `${b64({ alg: "none", typ: "JWT" })}.${b64({ sub: "1", exp: Math.floor(Date.now() / 1000) + 3600 })}.`;

    const invalidos = [
      token("1", "segredo-de-um-atacante"),
      token("1", process.env.JWT_SECRET, { expiresIn: -10, algorithm: "HS256" }),
      semAssinatura,
      token("1 OR 1=1"),
      token("0"),
      token("-1"),
      token("abc"),
      token("1.5"),
      `${token("1")}x`,
    ];

    for (const invalido of invalidos) {
      const { res, passou } = autenticar(`Bearer ${invalido}`);
      assert.equal(passou, false);
      assert.equal(res.statusCode, 401);
    }
  });

  it("token válido libera a rota e identifica o tutor pelo token", () => {
    const { req, passou } = autenticar(`Bearer ${token(String(ANA))}`);
    assert.equal(passou, true);
    assert.deepEqual(req.auth, { tutorId: String(ANA) });
  });

  it("fluxo completo: o tutor do TOKEN decide o acesso, não a URL nem o corpo", async () => {
    await enviar(ANA, CONVERSA_ANA_BRUNO, "particular");

    async function chamar(controller, tutor, { params = {}, query = {}, body } = {}) {
      const { req, passou } = autenticar(`Bearer ${token(String(tutor))}`);
      assert.equal(passou, true);
      Object.assign(req, { params, query, body });
      const res = criarResposta();
      await controller(req, res, (erro) => errorMiddleware(erro, req, res, () => {}));
      return res;
    }

    const silenciar = console.error;
    console.error = () => {};
    try {
      // Carla, autenticada, tenta ler e escrever na conversa de Ana e Bruno
      const leitura = await chamar(chatController.listarMensagens, CARLA, { params: { matchId: String(CONVERSA_ANA_BRUNO) } });
      assert.equal(leitura.statusCode, 404);
      assert.deepEqual(leitura.corpo, { success: false, message: "Conversa não encontrada.", code: "CONVERSA_NAO_ENCONTRADA" });

      const escrita = await chamar(chatController.enviarMensagem, CARLA, {
        params: { matchId: String(CONVERSA_ANA_BRUNO) },
        body: { texto: "invasão", remetente_tutor_id: ANA, tutorId: ANA },
      });
      assert.equal(escrita.statusCode, 404);
      assert.equal(Mensagem._linhas.length, 1);

      // Bruno, participante, lê e responde normalmente
      const doBruno = await chamar(chatController.listarMensagens, BRUNO, { params: { matchId: String(CONVERSA_ANA_BRUNO) }, query: { limite: "10" } });
      assert.equal(doBruno.statusCode, 200);
      assert.equal(doBruno.cabecalhos["cache-control"], "no-store");
      assert.equal(doBruno.corpo.mensagens[0].texto, "particular");

      const resposta = await chamar(chatController.enviarMensagem, BRUNO, {
        params: { matchId: String(CONVERSA_ANA_BRUNO) },
        body: { texto: "resposta", remetente_tutor_id: ANA },
      });
      assert.equal(resposta.statusCode, 201);
      assert.equal(resposta.cabecalhos["cache-control"], "no-store");
      assert.equal(Mensagem._linhas[1].remetente_tutor_id, BRUNO);

      // corpo ausente não derruba o servidor
      const semCorpo = await chamar(chatController.enviarMensagem, BRUNO, { params: { matchId: String(CONVERSA_ANA_BRUNO) } });
      assert.equal(semCorpo.statusCode, 400);

      const lista = await chamar(chatController.listarConversas, CARLA);
      assert.deepEqual(lista.corpo.conversas.map((c) => c.matchId), [CONVERSA_BRUNO_CARLA]);
    } finally {
      console.error = silenciar;
    }
  });

  it("erro interno responde 500 genérico, sem mensagem técnica, SQL ou pilha de execução", async () => {
    const original = Match.findByPk;
    Match.findByPk = async () => {
      throw Object.assign(new Error("ER_ACCESS_DENIED: senha do banco 'abc123' em SELECT * FROM mensagens"), {
        code: "ER_ACCESS_DENIED",
        sql: "SELECT * FROM mensagens",
      });
    };

    const silenciar = console.error;
    console.error = () => {};
    try {
      const req = { auth: { tutorId: String(ANA) }, params: { matchId: "100" }, query: {} };
      const res = criarResposta();
      await chatController.listarMensagens(req, res, (erro) => errorMiddleware(erro, req, res, () => {}));

      assert.equal(res.statusCode, 500);
      assert.deepEqual(res.corpo, { success: false, message: "Não foi possível concluir sua solicitação." });
      assert.doesNotMatch(JSON.stringify(res.corpo), /abc123|SELECT|ER_ACCESS|at /);
    } finally {
      Match.findByPk = original;
      console.error = silenciar;
    }
  });

  it("todas as rotas do chat passam pelo middleware de autenticação (requer express instalado)", { skip: !temExpress && "express não instalado neste ambiente" }, () => {
    const router = src("routes/chatRoutes");
    const camadas = router.stack;

    assert.equal(camadas[0].handle, authMiddleware, "a primeira camada do roteador é a autenticação");

    const rotas = camadas.filter((camada) => camada.route).map((camada) => `${Object.keys(camada.route.methods)[0].toUpperCase()} ${camada.route.path}`);
    assert.deepEqual(rotas.sort(), [
      "DELETE /conversas/:matchId/bloqueio",
      "GET /conversas",
      "GET /conversas/:matchId/mensagens",
      "POST /conversas/:matchId/bloqueio",
      "POST /conversas/:matchId/mensagens",
    ]);
  });

  it("servidor HTTP real: sem token → 401; intruso → 404; corpo gigante → recusado (requer express instalado)", { skip: !temExpress && "express não instalado neste ambiente" }, async () => {
    const express = require("express");
    const app = express();
    app.use(express.json());
    app.use("/api/chat", src("routes/chatRoutes"));
    app.use(errorMiddleware);

    const silenciar = console.error;
    console.error = () => {};
    const servidor = app.listen(0);
    const base = `http://127.0.0.1:${servidor.address().port}/api/chat`;
    const cabecalhos = (tutor) => ({ Authorization: `Bearer ${token(String(tutor))}`, "Content-Type": "application/json" });

    try {
      await enviar(ANA, CONVERSA_ANA_BRUNO, "particular");

      for (const [metodo, caminho] of [
        ["GET", "/conversas"],
        ["GET", "/conversas/100/mensagens"],
        ["POST", "/conversas/100/mensagens"],
        ["POST", "/conversas/100/bloqueio"],
        ["DELETE", "/conversas/100/bloqueio"],
      ]) {
        const semToken = await fetch(base + caminho, { method: metodo });
        assert.equal(semToken.status, 401, `${metodo} ${caminho} sem token`);
      }

      const intruso = await fetch(`${base}/conversas/100/mensagens`, { headers: cabecalhos(CARLA) });
      assert.equal(intruso.status, 404);

      const participante = await fetch(`${base}/conversas/100/mensagens`, { headers: cabecalhos(BRUNO) });
      assert.equal(participante.status, 200);
      assert.equal(participante.headers.get("cache-control"), "no-store");
      assert.equal((await participante.json()).mensagens[0].texto, "particular");

      const envio = await fetch(`${base}/conversas/100/mensagens`, {
        method: "POST",
        headers: cabecalhos(BRUNO),
        body: JSON.stringify({ texto: "oi", remetente_tutor_id: ANA }),
      });
      assert.equal(envio.status, 201);
      assert.equal(Mensagem._linhas[1].remetente_tutor_id, BRUNO);

      const gigante = await fetch(`${base}/conversas/100/mensagens`, {
        method: "POST",
        headers: cabecalhos(BRUNO),
        body: JSON.stringify({ texto: "a".repeat(300 * 1024) }),
      });
      assert.equal(gigante.status, 413);

      const jsonQuebrado = await fetch(`${base}/conversas/100/mensagens`, { method: "POST", headers: cabecalhos(BRUNO), body: "{texto:" });
      assert.equal(jsonQuebrado.status, 400);
      assert.equal(Mensagem._linhas.length, 2);
    } finally {
      servidor.close();
      console.error = silenciar;
    }
  });
});
