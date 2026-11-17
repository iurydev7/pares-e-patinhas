"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("interacoes", "animal_origem_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "animals",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.addIndex(
      "interacoes",
      ["animal_origem_id", "animal_alvo_id"],
      {
        unique: true,
        name: "unique_interacao_entre_animais",
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "interacoes",
      "unique_interacao_entre_animais",
    );

    await queryInterface.removeColumn("interacoes", "animal_origem_id");
  },
};
