require("dotenv").config();

// DB_SSL_REJECT_UNAUTHORIZED=false desliga a validação do certificado do banco.
// Use só no seu computador, se a rede/antivírus interferir na conexão. Nunca em produção.
const validarCertificado =
  process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" ||
  process.env.NODE_ENV === "production";

const sslOptions =
  process.env.DB_SSL === "false" && process.env.NODE_ENV !== "production"
    ? undefined
    : {
        minVersion: "TLSv1.2",
        rejectUnauthorized: validarCertificado,
        ...(process.env.DB_SSL_CA
          ? { ca: process.env.DB_SSL_CA.replace(/\\n/g, "\n") }
          : {}),
      };

const configBase = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  dialect: "mysql",
  ...(sslOptions ? { dialectOptions: { ssl: sslOptions } } : {}),
};

module.exports = {
  development: {
    ...configBase,
    database: process.env.DB_NAME,
  },

  test: {
    ...configBase,
    database: process.env.DB_TEST_NAME || "pares_e_patinhas_test",
  },

  production: {
    ...configBase,
    database: process.env.DB_PROD_NAME || process.env.DB_NAME,
  },
};