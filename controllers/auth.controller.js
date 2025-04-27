const AuthService = require('../services/auth.service');
const createHttpError = require('http-errors');

exports.register = async (req, res, next) => {
  try {
    const { user, token } = await AuthService.register(req.body);
    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      token
    });
  } catch (err) {
    next(createHttpError(400, err.message));
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token, refreshToken } = await AuthService.login(email, password);
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      token,
      refreshToken
    });
  } catch (err) {
    next(createHttpError(401, err.message));
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { token, refreshToken } = await AuthService.refreshToken(req.body.refreshToken);
    res.json({ token, refreshToken });
  } catch (err) {
    next(createHttpError(401, err.message));
  }
};

exports.logout = async (req, res, next) => {
  try {
    await AuthService.logout(req.user.id);
    res.status(204).end();
  } catch (err) {
    next(createHttpError(500, 'Logout failed'));
  }
};