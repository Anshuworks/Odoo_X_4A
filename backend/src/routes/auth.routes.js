const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// ✅ Both routes working
router.post('/create-company', authController.createCompany);
router.post('/join-company', authController.joinCompany);
router.post('/login', authController.login);

module.exports = router;