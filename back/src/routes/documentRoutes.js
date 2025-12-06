import express from 'express';
import {
  uploadDocument,
  searchDocuments,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  downloadDocument,
  getDocumentHistory,
  getDocumentStats
} from '../controllers/documentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { upload } from '../config/multer.js';
import { Document } from '../models/index.js';

const router = express.Router();

router.post('/upload', authenticateToken, upload.single('file'), uploadDocument);
router.get('/search', authenticateToken, searchDocuments);
router.get('/stats', authenticateToken, getDocumentStats);
router.get('/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const stats = await Document.getDashboardStats(userId, userRole);

    res.json(stats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
router.get('/', authenticateToken, getAllDocuments);
router.get('/:id/download', authenticateToken, downloadDocument);
router.get('/:id/history', authenticateToken, getDocumentHistory);
router.get('/:id', authenticateToken, getDocumentById);
router.put('/:id', authenticateToken, updateDocument);
router.delete('/:id', authenticateToken, deleteDocument);

export default router;
