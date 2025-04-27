module.exports = (sequelize, DataTypes) => {
    const NoteVersion = sequelize.define('NoteVersion', {
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      version: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    });

      NoteVersion.associate = function(models) {
      NoteVersion.belongsTo(models.Note, { foreignKey: 'noteId', as: 'note' });
      NoteVersion.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    };
  
    return NoteVersion;
  };