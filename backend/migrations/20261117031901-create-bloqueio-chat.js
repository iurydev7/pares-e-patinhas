"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("bloqueios_chat", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      bloqueador_tutor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "tutores", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      bloqueado_tutor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "tutores", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Um tutor bloqueia outro no máximo uma vez.
    await queryInterface.addIndex(
      "bloqueios_chat",
      ["bloqueador_tutor_id", "bloqueado_tutor_id"],
      { unique: true, name: "uq_bloqueios_chat_par" }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("bloqueios_chat");
  },
};
