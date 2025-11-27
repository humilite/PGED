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
router.get('/:id', getDocumentById);
router.put('/:id', updateDocument);
router.get('/:id/download', downloadDocument);
router.get('/:id/history', getDocumentHistory);

export default router;