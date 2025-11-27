import express from 'express';
import authController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route de connexion
router.post('/login', authController.login);

// Route pour obtenir le profil utilisateur (protégée)
router.get('/profile', authenticateToken, authController.getProfile);

export default router;
