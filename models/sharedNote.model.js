module.exports = (sequelize, DataTypes) => {
  const SharedNote = sequelize.define('SharedNote', {
    permission: {
      type: DataTypes.ENUM('read', 'write'),
      allowNull: false,
      defaultValue: 'read',
    },
  });

  // Make sure associations are defined
  SharedNote.associate = function (models) {
    // A SharedNote belongs to a Note
    SharedNote.belongsTo(models.Note, { foreignKey: 'noteId', as: 'note' });

    // A SharedNote belongs to a User
    SharedNote.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return SharedNote;
};
