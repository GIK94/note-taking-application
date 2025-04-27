const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware.authenticate);

router.get('/profile', userController.getUserProfile);
router.get('/', userController.getUsers);

module.exports = router;