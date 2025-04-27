require('dotenv').config();

const app = require('./app');
const db = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

// Test database connection
db.sequelize.authenticate()
  .then(() => {
    logger.info('Database connection established');
    
    // Sync models (remove force: true in production)
    return db.sequelize.sync({ force: false });
  })
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    logger.error(`Unable to connect to database: ${err.message}`);
    process.exit(1);
  });

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});