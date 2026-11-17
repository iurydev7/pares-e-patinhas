module.exports = (sequelize, DataTypes) => {
  const FotoAnimal = sequelize.define('FotoAnimal', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    animal_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    url: {
      type: DataTypes.TEXT('medium'),
      allowNull: false
    },
    ordem: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'fotos_animais',
    underscored: true
  });

  FotoAnimal.associate = (models) => {
    FotoAnimal.belongsTo(models.Animal, {
      foreignKey: 'animal_id',
      as: 'animal'
    });
  };

  return FotoAnimal;
};