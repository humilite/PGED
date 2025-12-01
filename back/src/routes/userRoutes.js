import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
  changePassword
} from '../controllers/userController.js';
import { User } from '../models/index.js';

const router = express.Router();

// Créer un nouvel utilisateur (admin seulement)
router.post('/', authenticateToken, adminMiddleware, createUser);

// Récupérer tous les utilisateurs (admin seulement)
router.get('/', authenticateToken, adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const result = await User.findAll(page, limit, search);

    // Transformer les données pour inclure le champ department et convertir en camelCase
    const transformedUsers = result.users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      department: user.department || '',
      isActive: user.is_active,
      lastLogin: user.last_login,
      createdAt: user.created_at,
      documentCount: user.document_count
    }));

    res.json({
      users: transformedUsers,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// Changer le mot de passe
router.put('/change-password', authenticateToken, changePassword);

// Récupérer un utilisateur par ID
router.get('/:id', authenticateToken, getUserById);

// Mettre à jour un utilisateur
router.put('/:id', authenticateToken, updateUser);

// Supprimer un utilisateur (désactiver)
router.delete('/:id', authenticateToken, adminMiddleware, deleteUser);

// Obtenir les statistiques des utilisateurs (admin seulement)
router.get('/admin/stats', authenticateToken, adminMiddleware, getUserStats);

export default router;
