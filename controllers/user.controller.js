const db = require('../config/database');
const createHttpError = require('http-errors');

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await db.User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'email', 'createdAt']
    });
    if (!user) {
      throw createHttpError(404, 'User not found');
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await db.User.findAll({
      attributes: ['id', 'username', 'email', 'createdAt'],
      where: {
        id: { [db.Sequelize.Op.not]: req.user.id }
      }
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
};