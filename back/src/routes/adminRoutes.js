import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { User } from '../models/index.js';
import pool from '../config/database.js';

const router = express.Router();

// Statistiques du dashboard admin
router.get('/stats', authenticateToken, adminMiddleware, async (req, res) => {
  try {
    // Statistiques des utilisateurs
    const userStats = await User.getStats();

    // Statistiques des documents
    const documentQuery = `
      SELECT
        COUNT(*) as total_documents,
        COUNT(*) FILTER (WHERE status = 'draft') as draft_documents,
        COUNT(*) FILTER (WHERE status = 'published') as published_documents,
        COUNT(*) FILTER (WHERE status = 'archived') as archived_documents,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as recent_documents
      FROM documents
    `;

    const documentResult = await pool.query(documentQuery);
    const docStats = documentResult.rows[0];

    // Statistiques des classifications
    const classificationQuery = `
      SELECT COUNT(*) as total_classifications
      FROM classification_plan
    `;

    const classificationResult = await pool.query(classificationQuery);
    const classStats = classificationResult.rows[0];

    // Documents par classification
    const docsByClassQuery = `
      SELECT cp.name, COUNT(d.id) as count
      FROM classification_plan cp
      LEFT JOIN documents d ON cp.id = d.classification_id
      GROUP BY cp.id, cp.name
      ORDER BY count DESC
      LIMIT 10
    `;

    const docsByClassResult = await pool.query(docsByClassQuery);

    // Activité récente (derniers 7 jours)
    const activityQuery = `
      SELECT
        DATE(created_at) as date,
        COUNT(*) as documents_created,
        COUNT(DISTINCT user_id) as active_users
      FROM documents
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    const activityResult = await pool.query(activityQuery);

    // Top contributeurs
    const topContributorsQuery = `
      SELECT
        u.first_name,
        u.last_name,
        COUNT(d.id) as document_count
      FROM users u
      LEFT JOIN documents d ON u.id = d.user_id
      GROUP BY u.id, u.first_name, u.last_name
      ORDER BY document_count DESC
      LIMIT 5
    `;

    const topContributorsResult = await pool.query(topContributorsQuery);

    const stats = {
      users: userStats,
      documents: {
        total: parseInt(docStats.total_documents),
        draft: parseInt(docStats.draft_documents),
        published: parseInt(docStats.published_documents),
        archived: parseInt(docStats.archived_documents),
        recent: parseInt(docStats.recent_documents)
      },
      classifications: {
        total: parseInt(classStats.total_classifications)
      },
      documentsByClassification: docsByClassResult.rows,
      recentActivity: activityResult.rows,
      topContributors: topContributorsResult.rows
    };

    res.json(stats);
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Configuration système (placeholder pour futures fonctionnalités)
router.get('/config', authenticateToken, adminMiddleware, async (req, res) => {
  try {
    // Configuration de base
    const config = {
      maxFileSize: process.env.MAX_FILE_SIZE || '10MB',
      allowedFileTypes: process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,xls,xlsx,txt',
      jwtExpiration: process.env.JWT_EXPIRES_IN || '24h',
      databaseUrl: process.env.DATABASE_URL ? 'configured' : 'not configured',
      smtpConfigured: process.env.SMTP_HOST ? true : false
    };

    res.json({ config });
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Logs système (placeholder)
router.get('/logs', authenticateToken, adminMiddleware, async (req, res) => {
  try {
    // Dans une implémentation réelle, récupérer les logs depuis un fichier ou une base
    const logs = [
      {
        id: 1,
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: 'Serveur démarré avec succès',
        user: 'system'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        level: 'INFO',
        message: 'Nouvel utilisateur créé: user@example.com',
        user: 'admin'
      }
    ];

    res.json({ logs });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Maintenance - Vider le cache (placeholder)
router.post('/maintenance/clear-cache', authenticateToken, adminMiddleware, async (req, res) => {
  try {
    // Dans une implémentation réelle, vider les caches
    res.json({ message: 'Cache vidé avec succès' });
  } catch (error) {
    console.error('Clear cache error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Liste des utilisateurs avec pagination et recherche
router.get('/users', authenticateToken, adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const result = await User.findAll(page, limit, search);

    res.json({
      users: result.users,
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Maintenance - Optimiser la base de données
router.post('/maintenance/optimize-db', authenticateToken, adminMiddleware, async (req, res) => {
  try {
    // Optimiser les index et les tables
    const queries = [
      'VACUUM ANALYZE users',
      'VACUUM ANALYZE documents',
      'VACUUM ANALYZE classification_plan',
      'REINDEX TABLE users',
      'REINDEX TABLE documents',
      'REINDEX TABLE classification_plan'
    ];

    for (const query of queries) {
      await pool.query(query);
    }

    res.json({ message: 'Base de données optimisée avec succès' });
  } catch (error) {
    console.error('Optimize DB error:', error);
    res.status(500).json({ error: 'Erreur lors de l\'optimisation' });
  }
});

export default router;
