const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

// Public routes (NO authentication required)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (authentication required)
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/change-password', authenticate, authController.changePassword);

// User management routes (authentication + admin required)
router.get('/users', authenticate, userController.getAllUsers);
router.post('/users', authenticate, userController.createUser);
router.get('/users/:id', authenticate, userController.getUserById);
router.put('/users/:id', authenticate, userController.updateUser);
router.put('/users/:id/role', authenticate, userController.updateUserRole);
router.delete('/users/:id', authenticate, userController.deleteUser);

module.exports = router;