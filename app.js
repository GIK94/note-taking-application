const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const createHttpError = require('http-errors');
const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined', { stream: logger.stream }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/notes', require('./routes/note.routes'));
app.use('/api/users', require('./routes/user.routes'));

// 404 handler
app.use((req, res, next) => {
  next(createHttpError(404, 'Endpoint not found'));
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      status: err.status || 500
    }
  });
});

module.exports = app;