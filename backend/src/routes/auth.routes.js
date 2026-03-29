const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

// Register route
router.post('/register', AuthController.register);

// Login route
router.post('/login', AuthController.login);

// Optional test route
router.get('/', (req, res) => {
  res.send("Auth API working 🚀");
});

module.exports = router;