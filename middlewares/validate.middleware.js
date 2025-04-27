const createHttpError = require('http-errors');

exports.validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false
  });

  if (error) {
    const message = error.details.map(detail => detail.message).join(', ');
    return next(createHttpError(422, message));
  }

  req.body = value;
  next();
};