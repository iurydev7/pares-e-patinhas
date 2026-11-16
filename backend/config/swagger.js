const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "API Pares e Patinhas",
      version: "1.0.0",
      description: "Documentação da API do Pares e Patinhas.",
    },

    servers: [
      {
        url: "http://localhost:3001",
        description: "Servidor local",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

  apis: [
    `${path.resolve(__dirname, "../src/routes").replace(/\\/g, "/")}/**/*.js`,
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
