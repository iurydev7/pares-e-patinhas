const swaggerSpec = require("../config/swagger");

describe("Documentação Swagger - Pares & Patinhas", () => {
  test("Deve utilizar OpenAPI 3.0.0", () => {
    expect(swaggerSpec.openapi).toBe("3.0.0");
  });

  test("Deve documentar a rota do Farejar", () => {
    const rota = swaggerSpec.paths["/api/discover"];

    expect(rota).toBeDefined();
    expect(rota.get).toBeDefined();

    const parametros = rota.get.parameters;

    expect(parametros.some((parametro) => parametro.name === "animalId")).toBe(
      true,
    );
  });

  test("Deve documentar a rota de Interações", () => {
    const rota = swaggerSpec.paths["/api/interactions"];

    expect(rota).toBeDefined();
    expect(rota.post).toBeDefined();
    expect(rota.post.requestBody).toBeDefined();
  });

  test("Deve documentar a rota de Matches", () => {
    const rota = swaggerSpec.paths["/api/matches"];

    expect(rota).toBeDefined();
    expect(rota.get).toBeDefined();
  });

  test("Deve exigir JWT nos três endpoints", () => {
    const endpoints = [
      swaggerSpec.paths["/api/discover"].get,
      swaggerSpec.paths["/api/interactions"].post,
      swaggerSpec.paths["/api/matches"].get,
    ];

    endpoints.forEach((endpoint) => {
      expect(endpoint.security).toEqual([{ bearerAuth: [] }]);
    });
  });

  test("Deve configurar autenticação Bearer JWT", () => {
    const bearerAuth = swaggerSpec.components.securitySchemes.bearerAuth;

    expect(bearerAuth.type).toBe("http");
    expect(bearerAuth.scheme).toBe("bearer");
    expect(bearerAuth.bearerFormat).toBe("JWT");
  });
});
