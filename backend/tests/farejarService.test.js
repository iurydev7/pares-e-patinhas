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
  Sequelize: {
    Op: require("sequelize").Op,
  },
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
    expect(filtros.where.especie).toBe("Cachorro");
    expect(filtros.include[0].as).toBe("fotos");
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
});
