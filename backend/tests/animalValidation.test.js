/* global jest, describe, afterEach, it, expect */

jest.mock("../models", () => ({
  Animal: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
  },
  FotoAnimal: {
    destroy: jest.fn(),
    bulkCreate: jest.fn(),
  },
  sequelize: {
    transaction: jest.fn(),
  },
}));

const { Animal, sequelize } = require("../models");
const {
  cadastrarAnimal,
  atualizarAnimal,
} = require("../src/controllers/animalController");
const { validarCadastroAnimal } = require("../src/validators/animalValidator");

const animalValido = {
  nome: "Rex",
  especie: "Cachorro",
  sexo: "Macho",
  idadeAnos: 2,
  idadeMeses: 3,
  porte: "Grande",
  cidade: "Fortaleza",
  estado: "CE",
};

describe("Validação de animais", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("normaliza os campos categóricos aceitos", () => {
    expect(validarCadastroAnimal(animalValido)).toMatchObject({
      especie: "cachorro",
      sexo: "macho",
      porte: "grande",
    });
  });

  it("rejeita espécies, sexos e nomes fora dos limites permitidos", () => {
    expect(() =>
      validarCadastroAnimal({
        ...animalValido,
        nome: "R".repeat(121),
        especie: "dragao",
        sexo: "xyz",
      }),
    ).toThrow(/Nome deve conter até 120 caracteres/);

    expect(() =>
      validarCadastroAnimal({
        ...animalValido,
        especie: "dragao",
      }),
    ).toThrow(/Espécie inválida/);

    expect(() =>
      validarCadastroAnimal({
        ...animalValido,
        sexo: "xyz",
      }),
    ).toThrow(/Sexo inválido/);
  });

  it("impede que a rota de cadastro grave dados inválidos", async () => {
    const next = jest.fn();

    await cadastrarAnimal(
      {
        body: { ...animalValido, especie: "dragao", sexo: "xyz" },
        auth: { tutorId: "1" },
      },
      {},
      next,
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400 }),
    );
    expect(sequelize.transaction).not.toHaveBeenCalled();
    expect(Animal.create).not.toHaveBeenCalled();
  });

  it("impede que a rota de atualização grave dados inválidos", async () => {
    const atualizar = jest.fn();
    const animalAtual = {
      toJSON: () => animalValido,
      update: atualizar,
    };
    const next = jest.fn();
    sequelize.transaction.mockImplementation((callback) => callback({}));
    Animal.findOne.mockResolvedValue(animalAtual);

    await atualizarAnimal(
      {
        params: { id: "1" },
        body: { sexo: "xyz" },
        auth: { tutorId: "1" },
      },
      {},
      next,
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400 }),
    );
    expect(atualizar).not.toHaveBeenCalled();
  });

  it("mantém os campos atuais ao atualizar parcialmente um animal válido", async () => {
    const atualizar = jest.fn();
    const animalAtual = {
      toJSON: () => animalValido,
      update: atualizar,
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    sequelize.transaction.mockImplementation((callback) => callback({}));
    Animal.findOne
      .mockResolvedValueOnce(animalAtual)
      .mockResolvedValueOnce({ toJSON: () => ({ ...animalValido, nome: "Mel" }) });

    await atualizarAnimal(
      {
        params: { id: "1" },
        body: { nome: "Mel" },
        auth: { tutorId: "1" },
      },
      res,
      jest.fn(),
    );

    expect(atualizar).toHaveBeenCalledWith(
      expect.objectContaining({ nome: "Mel", especie: "cachorro", sexo: "macho" }),
      expect.any(Object),
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
