module.exports = (sequelize, DataTypes) => {
  const BloqueioChat = sequelize.define('BloqueioChat', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    bloqueador_tutor_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    bloqueado_tutor_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'bloqueios_chat',
    underscored: true
  });

  BloqueioChat.associate = (models) => {
    BloqueioChat.belongsTo(models.Tutor, { foreignKey: 'bloqueador_tutor_id', as: 'bloqueador' });
    BloqueioChat.belongsTo(models.Tutor, { foreignKey: 'bloqueado_tutor_id', as: 'bloqueado' });
  };

  return BloqueioChat;
};
