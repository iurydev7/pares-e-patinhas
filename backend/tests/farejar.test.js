const request = require("supertest");
const app = require("../src/app");
const config = require("../config/config");

describe("Testes automatizados do Farejar", () => {
  test("Deve utilizar o ambiente de testes", () => {
    expect(process.env.NODE_ENV).toBe("test");

    expect(config.test.database).toBe("pares_e_patinhas_test");

    expect(config.test.database).not.toBe(config.development.database);
  });

  test("Deve bloquear o Farejar sem autenticação", async () => {
    const resposta = await request(app)
      .get("/api/discover")
      .query({ animalId: 1 });

    expect(resposta.status).toBe(401);

    expect(resposta.body).toEqual({
      success: false,
      message: "Autenticação necessária.",
    });
  });
});
