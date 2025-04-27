module.exports = (sequelize, DataTypes) => {
    const Note = sequelize.define('Note', {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      version: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, {
      paranoid: true,
      indexes: [
        {
          type: 'FULLTEXT',
          name: 'title_content_idx',
          fields: ['title', 'content']
        }
      ]
    });
  
    Note.associate = function(models) {
      // A Note belongs to a User
      Note.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  
      // A Note can have many versions
      Note.hasMany(models.NoteVersion, { foreignKey: 'noteId', as: 'versions' });
  
      // A Note can be shared with many users (Many-to-Many)
      Note.belongsToMany(models.User, {
        through: models.SharedNote,
        foreignKey: 'noteId',
        as: 'sharedWith',
      });
    };
  
    return Note;
  };