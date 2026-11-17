
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Verifica se já existem interações cadastradas.
    const registros = await queryInterface.sequelize.query(
      "SELECT COUNT(*) AS total FROM `interacoes`",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (Number(registros[0].total) > 0) {
      throw new Error(
        "A tabela interacoes possui registros. " +
        "É necessário definir o animal de origem " +
        "das interações existentes antes desta migration."
      );
    }

    // Verifica se uma tentativa anterior já criou a coluna.
    const colunas = await queryInterface.describeTable("interacoes");

    // 1. Adiciona a coluna sem criar a chave estrangeira.
    if (!colunas.animal_origem_id) {
      await queryInterface.addColumn(
        "interacoes",
        "animal_origem_id",
        {
          type: Sequelize.INTEGER,
          allowNull: false,
        }
      );
    }

    // 2. Cria a chave estrangeira separadamente.
    await queryInterface.addConstraint("interacoes", {
      fields: ["animal_origem_id"],
      type: "foreign key",
      name: "fk_interacoes_animal_origem",
      references: {
        table: "animals",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    // 3. Cria o índice único entre os dois animais.
    await queryInterface.addIndex(
      "interacoes",
      ["animal_origem_id", "animal_alvo_id"],
      {
        unique: true,
        name: "unique_interacao_entre_animais",
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "interacoes",
      "unique_interacao_entre_animais"
    );

    await queryInterface.removeConstraint(
      "interacoes",
      "fk_interacoes_animal_origem"
    );

    await queryInterface.removeColumn(
      "interacoes",
      "animal_origem_id"
    );
  },
};
