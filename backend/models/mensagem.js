module.exports = (sequelize, DataTypes) => {
  const Mensagem = sequelize.define('Mensagem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    match_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    remetente_tutor_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // Texto puro ou, quando `cifrada` = true, o conteúdo cifrado em base64.
    texto: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    cifrada: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    lida_em: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'mensagens',
    underscored: true
  });

  Mensagem.associate = (models) => {
    Mensagem.belongsTo(models.Match, { foreignKey: 'match_id', as: 'match' });
    Mensagem.belongsTo(models.Tutor, { foreignKey: 'remetente_tutor_id', as: 'remetente' });
  };

  return Mensagem;
};
