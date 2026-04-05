const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, userController.getUsers);
router.post('/', authenticate, userController.createUser);
router.patch('/:id/manager', authenticate, userController.assignManager);

module.exports = router;
