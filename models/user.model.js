module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, {
      paranoid: true,
      defaultScope: {
        attributes: { exclude: ['password'] }
      },
      scopes: {
        withPassword: {
          attributes: {}
        }
      }
    });
  
    User.associate = function(models) {
      User.hasMany(models.Note, { foreignKey: 'userId', as: 'notes' });
      User.belongsToMany(models.Note, {
        through: models.SharedNote,
        foreignKey: 'userId',
        as: 'sharedNotes'
      });
    };
  
    return User;
  };