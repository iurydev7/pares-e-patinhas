'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tutor extends Model {
    
    static associate(db) {
      Tutor.hasMany(db.Animal, {
        foreignKey: 'tutorId',
        as: 'animais',
      });
    }
  }
  Tutor.init(
    {
      nome: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },

      senhaHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      cidade: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      estado: {
        type: DataTypes.STRING(2),
        allowNull: true,
      },

      // Verificação de e-mail: o código nunca é salvo em texto puro, só o HMAC dele.
      emailVerificado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      codigoVerificacaoHash: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },

      codigoExpiraEm: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      codigoTentativas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      codigoEnviadoEm: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Tutor",
      tableName: "tutores",
    }
  );
  return Tutor;
};