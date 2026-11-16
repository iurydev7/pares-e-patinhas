"use strict";

const COLUNAS = [
  "emailVerificado",
  "codigoVerificacaoHash",
  "codigoExpiraEm",
  "codigoTentativas",
  "codigoEnviadoEm",
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("tutores", "emailVerificado", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn("tutores", "codigoVerificacaoHash", {
      type: Sequelize.STRING(64),
      allowNull: true,
    });

    await queryInterface.addColumn("tutores", "codigoExpiraEm", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("tutores", "codigoTentativas", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn("tutores", "codigoEnviadoEm", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Contas criadas ANTES da verificação existir continuam entrando normalmente.
    await queryInterface.bulkUpdate("tutores", { emailVerificado: true }, {});
  },

  async down(queryInterface) {
    for (const coluna of COLUNAS.slice().reverse()) {
      await queryInterface.removeColumn("tutores", coluna);
    }
  },
};
