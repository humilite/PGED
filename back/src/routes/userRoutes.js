import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { User } from '../models/index.js';

const router = express.Router();

// Créer un nouvel utilisateur (admin seulement)
router.post('/', authenticateToken, adminMiddleware, async (req, res) => {
  try {
    console.log('Received user creation request body:', req.body);
    const { email, password, first_name, last_name, role, department } = req.body;

    // Validation des champs requis
    if (!email || !password || !first_name || !last_name) {
      console.log('Validation failed. Fields:', { email, password: password ? '[HIDDEN]' : null, first_name, last_name });
      return res.status(400).json({ error: 'Tous les champs requis doivent être fournis (email, password, first_name, last_name)' });
    }

    // Hacher le mot de passe
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      role: role || 'user',
      department
    });

    // Ne pas retourner le mot de passe et convertir en camelCase
    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        department: user.department,
        isActive: user.is_active,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
  }
});

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

// Récupérer un utilisateur par ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Les utilisateurs peuvent voir leur propre profil, les admins peuvent voir tous les profils
    if (userRole !== 'admin' && parseInt(id) !== userId) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Ne pas retourner le mot de passe et convertir en camelCase
    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        department: user.department,
        isActive: user.is_active,
        lastLogin: user.last_login,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mettre à jour un utilisateur
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'ID invalide' });
    }
    const { first_name, last_name, role, department, is_active } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Les utilisateurs peuvent modifier leur propre profil, les admins peuvent modifier tous les profils
    if (userRole !== 'admin' && id !== userId) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // Seuls les admins peuvent changer le rôle
    const updateData = userRole === 'admin' ? { first_name, last_name, role, department, is_active } : { first_name, last_name, department };

    const user = await User.update(id, updateData);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Ne pas retourner le mot de passe et convertir en camelCase
    res.json({
      message: 'Utilisateur mis à jour avec succès',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        department: user.department,
        isActive: user.is_active,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// Supprimer un utilisateur (désactiver)
router.delete('/:id', authenticateToken, adminMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    const user = await User.update(id, { is_active: false });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ message: 'Utilisateur désactivé avec succès' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// Obtenir les statistiques des utilisateurs (admin seulement)
router.get('/admin/stats', authenticateToken, adminMiddleware, async (req, res) => {
  try {
    const stats = await User.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
