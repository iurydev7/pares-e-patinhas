const request = require("supertest");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("node:crypto");
const { Op } = require("sequelize");

const app = require("../src/app");

const { sequelize, Tutor, Animal, Interacao, Match } = require("../models");

describe("Integração do Farejar, Interações e Matches", () => {
  let tutor1;
  let tutor2;
  let rex;
  let maya;
  let outroPet;
  let token1;
  let token2;

  beforeAll(async () => {
    if (
      process.env.NODE_ENV !== "test" ||
      sequelize.config.database !== "pares_e_patinhas_test"
    ) {
      throw new Error(
        "Os testes só podem utilizar o banco pares_e_patinhas_test.",
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET não configurado.");
    }

    await sequelize.authenticate();
  });

  beforeEach(async () => {
    const identificador = randomUUID();

    tutor1 = await Tutor.create({
      nome: "Tutor Automatizado 1",
      email: `tutor1-${identificador}@example.invalid`,
      senhaHash: "hash-ficticio-exclusivo-para-testes",
      cidade: "Fortaleza",
      estado: "CE",
    });

    tutor2 = await Tutor.create({
      nome: "Tutor Automatizado 2",
      email: `tutor2-${identificador}@example.invalid`,
      senhaHash: "hash-ficticio-exclusivo-para-testes",
      cidade: "Fortaleza",
      estado: "CE",
    });

    rex = await Animal.create({
      nome: "Rex Teste",
      especie: "Cachorro",
      sexo: "Macho",
      raca: "Golden Retriever",
      idadeAnos: 2,
      idadeMeses: 0,
      porte: "Grande",
      cidade: "Fortaleza",
      estado: "CE",
      tutorId: tutor1.id,
    });

    maya = await Animal.create({
      nome: "Maya Teste",
      especie: "Cachorro",
      sexo: "Fêmea",
      raca: "Golden Retriever",
      idadeAnos: 2,
      idadeMeses: 0,
      porte: "Grande",
      cidade: "Fortaleza",
      estado: "CE",
      tutorId: tutor2.id,
    });

    outroPet = await Animal.create({
      nome: "Bolt Teste",
      especie: "Cachorro",
      sexo: "Macho",
      raca: "Border Collie",
      idadeAnos: 3,
      idadeMeses: 0,
      porte: "Médio",
      cidade: "Fortaleza",
      estado: "CE",
      tutorId: tutor1.id,
    });

    token1 = jwt.sign({ sub: String(tutor1.id) }, process.env.JWT_SECRET, {
      algorithm: "HS256",
    });

    token2 = jwt.sign({ sub: String(tutor2.id) }, process.env.JWT_SECRET, {
      algorithm: "HS256",
    });
  });

  afterEach(async () => {
    if (
      process.env.NODE_ENV !== "test" ||
      sequelize.config.database !== "pares_e_patinhas_test"
    ) {
      return;
    }

    const idsAnimais = [rex?.id, maya?.id, outroPet?.id].filter(Boolean);

    const idsTutores = [tutor1?.id, tutor2?.id].filter(Boolean);

    if (idsAnimais.length > 0) {
      await Match.destroy({
        where: {
          [Op.or]: [
            { animal_1_id: { [Op.in]: idsAnimais } },
            { animal_2_id: { [Op.in]: idsAnimais } },
          ],
        },
      });

      await Interacao.destroy({
        where: {
          [Op.or]: [
            { animal_origem_id: { [Op.in]: idsAnimais } },
            { animal_alvo_id: { [Op.in]: idsAnimais } },
          ],
        },
      });

      await Animal.destroy({
        where: {
          id: { [Op.in]: idsAnimais },
        },
      });
    }

    if (idsTutores.length > 0) {
      await Tutor.destroy({
        where: {
          id: { [Op.in]: idsTutores },
        },
      });
    }

    tutor1 = null;
    tutor2 = null;
    rex = null;
    maya = null;
    outroPet = null;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test("Farejar deve aplicar os quatro filtros", async () => {
    const resposta = await request(app)
      .get("/api/discover")
      .set("Authorization", `Bearer ${token1}`)
      .query({
        animalId: rex.id,
        especie: "cachorro",
        sexo: "femea",
        cidade: "Fortaleza",
        estado: "CE",
      });

    expect(resposta.status).toBe(200);
    expect(resposta.body.total).toBe(1);
    expect(resposta.body.animais[0].id).toBe(maya.id);
  });

  test("Farejar não deve mostrar pets do próprio tutor", async () => {
    const resposta = await request(app)
      .get("/api/discover")
      .set("Authorization", `Bearer ${token1}`)
      .query({ animalId: rex.id });

    expect(resposta.status).toBe(200);

    const ids = resposta.body.animais.map((animal) => animal.id);

    expect(ids).not.toContain(rex.id);
    expect(ids).not.toContain(outroPet.id);
    expect(ids).toContain(maya.id);
  });

  test("Tutor não pode consultar pets de outra pessoa", async () => {
    const resposta = await request(app)
      .get("/api/matches")
      .set("Authorization", `Bearer ${token2}`)
      .query({ animalId: rex.id });

    expect(resposta.status).toBe(403);
  });

  test("Curtida unilateral não deve gerar match", async () => {
    const resposta = await request(app)
      .post("/api/interactions")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        animalOrigemId: rex.id,
        animalAlvoId: maya.id,
        tipo: "like",
      });

    expect(resposta.status).toBe(201);
    expect(resposta.body.deuMatch).toBe(false);
    expect(resposta.body.match).toBeNull();
  });

  test("Curtidas recíprocas devem gerar um match", async () => {
    await request(app)
      .post("/api/interactions")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        animalOrigemId: rex.id,
        animalAlvoId: maya.id,
        tipo: "like",
      })
      .expect(201);

    const resposta = await request(app)
      .post("/api/interactions")
      .set("Authorization", `Bearer ${token2}`)
      .send({
        animalOrigemId: maya.id,
        animalAlvoId: rex.id,
        tipo: "like",
      });

    expect(resposta.status).toBe(201);
    expect(resposta.body.deuMatch).toBe(true);
    expect(resposta.body.match).not.toBeNull();

    const totalMatches = await Match.count({
      where: {
        [Op.or]: [
          {
            animal_1_id: rex.id,
            animal_2_id: maya.id,
          },
          {
            animal_1_id: maya.id,
            animal_2_id: rex.id,
          },
        ],
      },
    });

    expect(totalMatches).toBe(1);
  });

  test("Não deve permitir interações duplicadas", async () => {
    const dados = {
      animalOrigemId: rex.id,
      animalAlvoId: maya.id,
      tipo: "like",
    };

    await request(app)
      .post("/api/interactions")
      .set("Authorization", `Bearer ${token1}`)
      .send(dados)
      .expect(201);

    const resposta = await request(app)
      .post("/api/interactions")
      .set("Authorization", `Bearer ${token1}`)
      .send(dados);

    expect(resposta.status).toBe(409);

    const totalInteracoes = await Interacao.count({
      where: {
        animal_origem_id: rex.id,
        animal_alvo_id: maya.id,
      },
    });

    expect(totalInteracoes).toBe(1);
  });

  test("Deve listar os matches do animal autenticado", async () => {
    await request(app)
      .post("/api/interactions")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        animalOrigemId: rex.id,
        animalAlvoId: maya.id,
        tipo: "like",
      })
      .expect(201);

    await request(app)
      .post("/api/interactions")
      .set("Authorization", `Bearer ${token2}`)
      .send({
        animalOrigemId: maya.id,
        animalAlvoId: rex.id,
        tipo: "like",
      })
      .expect(201);

    const resposta = await request(app)
      .get("/api/matches")
      .set("Authorization", `Bearer ${token1}`)
      .query({ animalId: rex.id });

    expect(resposta.status).toBe(200);
    expect(resposta.body.total).toBe(1);
    expect(resposta.body.matches[0].animal.id).toBe(maya.id);
  });

  test("Não deve exibir matches com animais desativados", async () => {
    await request(app)
      .post("/api/interactions")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        animalOrigemId: rex.id,
        animalAlvoId: maya.id,
        tipo: "like",
      })
      .expect(201);

    await request(app)
      .post("/api/interactions")
      .set("Authorization", `Bearer ${token2}`)
      .send({
        animalOrigemId: maya.id,
        animalAlvoId: rex.id,
        tipo: "like",
      })
      .expect(201);

    await maya.update({ ativo: false });

    const resposta = await request(app)
      .get("/api/matches")
      .set("Authorization", `Bearer ${token1}`)
      .query({ animalId: rex.id });

    expect(resposta.status).toBe(200);
    expect(resposta.body.total).toBe(0);
  });
});
