const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

// Rutas de autenticación
router.get('/register', authController.showRegister);
router.post('/register', authController.register);

router.get('/login', authController.showLogin);
router.post('/login', authController.login);

router.post('/logout', requireAuth, authController.logout);

router.get('/dashboard', requireAuth, authController.dashboard);

// Rutas de administración (solo admin)
router.get('/admin', requireAuth, requireAdmin, authController.adminPanel);
router.post('/admin/delete/:id', requireAuth, requireAdmin, authController.deleteUser);

module.exports = router;  //exportamos el router para usarlo en server.js