'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tutor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
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
    },
    {
      sequelize,
      modelName: "Tutor",
      tableName: "tutores",
    }
  );
  return Tutor;
};