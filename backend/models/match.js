module.exports = (sequelize, DataTypes) => {
  const Match = sequelize.define('Match', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    animal_1_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    animal_2_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'matches',
    underscored: true
  });

  Match.associate = (models) => {
    Match.belongsTo(models.Animal, { foreignKey: 'animal_1_id', as: 'pet_origem' });
    Match.belongsTo(models.Animal, { foreignKey: 'animal_2_id', as: 'pet_destino' });
  };

  return Match;
};