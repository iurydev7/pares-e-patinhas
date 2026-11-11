
'use strict';

const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Animal extends Model {
    static associate(db) {
      Animal.belongsTo(db.Tutor, {
        foreignKey: 'tutorId',
        as: 'tutor',
      });
    }
  }

  Animal.init(
    {
      nome: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },

      especie: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },

      sexo: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },

      raca: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      idadeAnos: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      idadeMeses: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      porte: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },

      descricao: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      cidade: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      estado: {
        type: DataTypes.STRING(2),
        allowNull: true,
      },

      tutorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Animal',
      tableName: 'animals',
    }
  );

  return Animal;
};
