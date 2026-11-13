require("dotenv").config();

const configBase = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  dialect: "mysql",
  dialectOptions: {
    ssl: {
      minVersion: 'TLSv1.2'
    }
  }
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
    database: process.env.DB_PROD_NAME,
  },
};