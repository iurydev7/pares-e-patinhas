"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("mensagens", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      // Conversa = match. Apagar o match (ou um dos pets) apaga as mensagens.
      match_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "matches", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      // Apagar a conta do tutor apaga as mensagens que ele enviou.
      remetente_tutor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "tutores", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      // Texto puro ou, quando `cifrada` = true, o conteúdo cifrado (AES-256-GCM) em base64.
      texto: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      cifrada: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      lida_em: {
        type: Sequelize.DATE,
        allowNull: true,
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

    // Leitura da conversa em ordem e busca de mensagens novas.
    await queryInterface.addIndex("mensagens", ["match_id", "id"], {
      name: "idx_mensagens_match_id",
    });

    // Limite de envio por tutor (mensagens no último minuto).
    await queryInterface.addIndex("mensagens", ["remetente_tutor_id", "created_at"], {
      name: "idx_mensagens_remetente_data",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("mensagens");
  },
};
