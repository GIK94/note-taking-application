const jwt = require('jsonwebtoken');
const createHttpError = require('http-errors');
const logger = require('../utils/logger');

exports.authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      throw createHttpError(401, 'Authentication token required');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        logger.error(`JWT verification error: ${err.message}`);
        throw createHttpError(403, 'Invalid or expired token');
      }
      req.user = user;
      next();
    });
  } catch (err) {
    next(err);
  }
};