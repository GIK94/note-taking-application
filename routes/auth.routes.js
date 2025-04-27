const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

const authMiddleware = require('../middlewares/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);

router.use(authMiddleware.authenticate);
router.post('/logout', authController.logout);

module.exports = router;
