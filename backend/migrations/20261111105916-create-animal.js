"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("animals", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      nome: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },

      especie: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },

      sexo: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },

      raca: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      idadeAnos: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      idadeMeses: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      porte: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },

      descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      cidade: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      estado: {
        type: Sequelize.STRING(2),
        allowNull: true,
      },

      tutorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "tutores",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("animals");
  },
};