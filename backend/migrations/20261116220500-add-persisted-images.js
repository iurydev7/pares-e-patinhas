"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("tutores", "foto", {
      type: Sequelize.TEXT("medium"),
      allowNull: true,
    });

    await queryInterface.changeColumn("fotos_animais", "url", {
      type: Sequelize.TEXT("medium"),
      allowNull: false,
    });

    await queryInterface.addColumn("fotos_animais", "ordem", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("fotos_animais", "ordem");
    await queryInterface.changeColumn("fotos_animais", "url", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.removeColumn("tutores", "foto");
  },
};
