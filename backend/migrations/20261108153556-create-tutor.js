"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tutores", {
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

      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },

      senhaHash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      cidade: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      estado: {
        type: Sequelize.STRING(2),
        allowNull: true,
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
    await queryInterface.dropTable("tutores");
  },
};