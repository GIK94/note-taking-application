const createHttpError = require('http-errors');
const logger = require('../utils/logger');

exports.errorHandler = (err, req, res, next) => {
  logger.error(err.message);
  
  if (err instanceof createHttpError.HttpError) {
    res.status(err.status).json({
      error: {
        message: err.message,
        status: err.status
      }
    });
  } else {
    res.status(500).json({
      error: {
        message: 'Internal Server Error',
        status: 500
      }
    });
  }
};

exports.notFound = (req, res, next) => {
  next(createHttpError(404, 'Endpoint not found'));
};