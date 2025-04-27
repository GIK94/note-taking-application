const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const logger = require('../utils/logger');
const RedisService = require('./redis.service');

class AuthService {
  async register(userData) {
    try {
      const existingUser = await db.User.findOne({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw new Error('User already exists');
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await db.User.create({
        username: userData.username,
        email: userData.email,
        password: hashedPassword
      });

      const token = this.generateToken(user);
      return { user, token };
    } catch (err) {
      logger.error(`Registration error: ${err.message}`);
      throw err;
    }
  }

  async login(email, password) {
    try {
      const user = await db.User.findOne({
        where: { email },
        attributes: { include: ['password'] }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Store refresh token in Redis
      await RedisService.setCache(`refreshToken:${user.id}`, refreshToken);

      return { user, token, refreshToken };
    } catch (err) {
      logger.error(`Login error: ${err.message}`);
      throw err;
    }
  }

  generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const storedToken = await RedisService.getCache(`refreshToken:${decoded.id}`);

      if (refreshToken !== storedToken) {
        throw new Error('Invalid refresh token');
      }

      const user = await db.User.findByPk(decoded.id);
      if (!user) {
        throw new Error('User not found');
      }

      const newToken = this.generateToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      // Update refresh token in Redis
      await RedisService.setCache(`refreshToken:${user.id}`, newRefreshToken);

      return { token: newToken, refreshToken: newRefreshToken };
    } catch (err) {
      logger.error(`Refresh token error: ${err.message}`);
      throw err;
    }
  }

  async logout(userId) {
    try {
      await RedisService.delCache(`refreshToken:${userId}`);
    } catch (err) {
      logger.error(`Logout error: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new AuthService();