import express from 'express';
import { 
  uploadDocument, 
  searchDocuments, 
  getDocumentById,
  updateDocument,
  downloadDocument,
  getDocumentHistory
} from '../controllers/documentController';
import { authMiddleware } from '../middleware/authMiddleware';
import { upload } from '../config/multer';

const router = express.Router();

router.use(authMiddleware);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/search', searchDocuments);
router.get('/:id', getDocumentById);
router.put('/:id', updateDocument);
router.get('/:id/download', downloadDocument);
router.get('/:id/history', getDocumentHistory);

export default router;