require("dotenv").config();

const sslOptions = process.env.DB_SSL === "true"
  ? {
      minVersion: "TLSv1.2",
      ...(process.env.DB_SSL_CA
        ? { ca: process.env.DB_SSL_CA.replace(/\\n/g, "\n") }
        : {}),
    }
  : undefined;

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