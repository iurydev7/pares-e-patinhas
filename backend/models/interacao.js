module.exports = (sequelize, DataTypes) => {
  const Interacao = sequelize.define('Interacao', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tutor_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    animal_alvo_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tipo: {
      type: DataTypes.ENUM('like', 'dislike'),
      allowNull: false
    }
  }, {
    tableName: 'interacoes',
    underscored: true
  });

  Interacao.associate = (models) => {
    Interacao.belongsTo(models.Tutor, { foreignKey: 'tutor_id', as: 'tutor' });
    Interacao.belongsTo(models.Animal, { foreignKey: 'animal_alvo_id', as: 'animal_alvo' });
  };

  return Interacao;
};