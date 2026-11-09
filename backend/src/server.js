require("dotenv").config();

const app = require("./app");
const { sequelize } = require("../models");

const PORT = process.env.PORT || 3001;

async function iniciarServidor() {
  try {
    // Testa a conexão com o banco de dados MySQL
    await sequelize.authenticate();

    console.log("MySQL conectado com sucesso!");

    // Inicia o servidor Express
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });

  } catch (error) {
    console.error("Erro ao iniciar o servidor:", error.message);
    process.exit(1);
  }
}

iniciarServidor();