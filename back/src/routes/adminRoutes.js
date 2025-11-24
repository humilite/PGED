import express from 'express';
import { 
  getUsers, 
  createUser, 
  updateUser, 
  getDashboardStats 
} from '../controllers/adminController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.get('/stats', getDashboardStats);

export default router;