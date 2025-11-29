import express from 'express';
import {
  uploadDocument,
  searchDocuments,
  getDocumentById,
  updateDocument,
  downloadDocument,
  getDocumentHistory
} from '../controllers/documentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { upload } from '../config/multer.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/search', searchDocuments);
router.get('/dashboard/stats', async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    const stats = await Document.getDashboardStats(userId, userRole);

    res.json(stats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
router.get('/:id/download', downloadDocument);
router.get('/:id/history', getDocumentHistory);
router.get('/:id', getDocumentById);
router.put('/:id', updateDocument);

export default router;
