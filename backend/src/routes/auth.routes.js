const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

const authController = require('../controllers/auth.controller');

// ✅ Both routes working
router.post('/signup', authController.signup);
router.post('/login', authController.login);

module.exports = router;