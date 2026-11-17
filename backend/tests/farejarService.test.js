/* global jest, describe, beforeEach, it, expect */

jest.mock("../models", () => ({
  Animal: {
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
  },
  FotoAnimal: {},
  Interacao: {
    findAll: jest.fn(),
  },
  Sequelize: require("sequelize"),
}));

const { Animal, Interacao, Sequelize } = require("../models");
const { listarAnimais } = require("../src/services/farejarService");

describe("Serviço de descoberta de pets", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Animal.findByPk.mockResolvedValue({
      id: 1,
      tutorId: 7,
      especie: "Cachorro",
      sexo: "Macho",
      ativo: true,
      disponivel: true,
    });
    Interacao.findAll.mockResolvedValue([{ animal_alvo_id: 3 }]);
    Animal.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: [
        {
          toJSON: () => ({
            id: 2,
            fotos: [
              { url: "https://example.com/segunda.jpg", ordem: 2 },
              { url: "https://example.com/primeira.jpg", ordem: 1 },
            ],
          }),
        },
      ],
    });
  });

  it("devolve pets do banco com fotos ordenadas e exclui pets próprios e já avaliados", async () => {
    const resultado = await listarAnimais({
      tutorId: 7,
      animalId: 1,
      page: 1,
      limit: 10,
    });

    expect(resultado.animais[0]).toMatchObject({
      id: 2,
      fotos: [
        "https://example.com/primeira.jpg",
        "https://example.com/segunda.jpg",
      ],
      foto: "https://example.com/primeira.jpg",
    });

    const filtros = Animal.findAndCountAll.mock.calls[0][0];
    expect(filtros.where.id[Sequelize.Op.notIn]).toEqual([1, 3]);
    expect(filtros.where.tutorId[Sequelize.Op.ne]).toBe(7);
    const filtroEspecie = filtros.where[Sequelize.Op.and][0];
    expect(filtroEspecie.attribute.fn).toBe("LOWER");
    expect(filtroEspecie.attribute.args[0].col).toBe("especie");
    expect(filtroEspecie.logic).toBe("cachorro");
    const filtroSexo = filtros.where[Sequelize.Op.and][1];
    expect(filtroSexo.attribute.fn).toBe("REPLACE");
    expect(filtroSexo.attribute.args[0].fn).toBe("LOWER");
    expect(filtroSexo.attribute.args[0].args[0].col).toBe("sexo");
    expect(filtroSexo.logic).toBe("femea");
    expect(filtros.include[0].as).toBe("fotos");
    expect(filtros.order).toEqual([["id", "DESC"]]);
    expect(filtros.distinct).toBe(true);
  });

  it("não permite consultar pets de espécie diferente do animal selecionado", async () => {
    await expect(
      listarAnimais({
        tutorId: 7,
        animalId: 1,
        especie: "gato",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "A espécie informada deve ser a mesma do animal selecionado.",
    });

    expect(Animal.findAndCountAll).not.toHaveBeenCalled();
  });

  it("filtra fêmeas para uma origem macho mesmo com variação de maiúsculas", async () => {
    await listarAnimais({
      tutorId: 7,
      animalId: 1,
    });

    const filtros = Animal.findAndCountAll.mock.calls[0][0];
    const filtroSexo = filtros.where[Sequelize.Op.and][1];

    expect(filtroSexo.logic).toBe("femea");
  });

  it("filtra machos para uma origem fêmea", async () => {
    Animal.findByPk.mockResolvedValue({
      id: 1,
      tutorId: 7,
      especie: "Cachorro",
      sexo: "Fêmea",
      ativo: true,
      disponivel: true,
    });

    await listarAnimais({
      tutorId: 7,
      animalId: 1,
    });

    const filtros = Animal.findAndCountAll.mock.calls[0][0];
    const filtroSexo = filtros.where[Sequelize.Op.and][1];

    expect(filtroSexo.logic).toBe("macho");
  });

  it("não permite solicitar pets do mesmo sexo do animal selecionado", async () => {
    await expect(
      listarAnimais({
        tutorId: 7,
        animalId: 1,
        sexo: "macho",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "O sexo informado deve ser o oposto ao do animal selecionado.",
    });

    expect(Animal.findAndCountAll).not.toHaveBeenCalled();
  });
});
