const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: msg => logger.debug(msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const db = {};

// Add Sequelize instance and constructor to db object
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Define models and import them
db.User = require('../models/user.model')(sequelize, Sequelize);
db.Note = require('../models/note.model')(sequelize, Sequelize);
db.NoteVersion = require('../models/noteVersion.model')(sequelize, Sequelize);
db.SharedNote = require('../models/sharedNote.model')(sequelize, Sequelize);

// Define associations between models

// User has many Notes
db.User.hasMany(db.Note, { foreignKey: 'userId' });
db.Note.belongsTo(db.User, { foreignKey: 'userId' });

// Note has many NoteVersions
db.Note.hasMany(db.NoteVersion, { foreignKey: 'noteId' });
db.NoteVersion.belongsTo(db.Note, { foreignKey: 'noteId' });

db.Note.belongsToMany(db.User, {
  through: db.SharedNote,
  foreignKey: 'noteId',
  otherKey: 'userId',
  as: 'sharedWith', // Alias for the shared users
});

db.User.belongsToMany(db.Note, {
  through: db.SharedNote,
  foreignKey: 'userId',
  otherKey: 'noteId',
  as: 'sharedNotes', // Alias for the shared notes
});

// Sync database (optional, make sure you run this only in development or with migrations)
sequelize.sync()
  .then(() => {
    console.log('Database synced successfully');
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });

// Export the db object to use the models and sequelize instance elsewhere in the app
module.exports = db;