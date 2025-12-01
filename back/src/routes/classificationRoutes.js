import express from 'express';
import {
    createClassification,
    getAllClassifications,
    getClassificationById,
    getFullTree,
    getChildren,
    updateClassification,
    moveClassification,
    deleteClassification
} from '../controllers/classificationController.js';

const router = express.Router();

// Route to create a new classification
router.post('/', createClassification);

// Route to get all classifications
router.get('/', getAllClassifications);

// Route to get full hierarchical tree
router.get('/tree', getFullTree);

// Route to get classification by ID
router.get('/:id', getClassificationById);

// Route to get children of a classification
router.get('/:parentId/children', getChildren);

// Route to update an existing classification by ID
router.put('/:id', updateClassification);

// Route to move a classification
router.put('/:id/move', moveClassification);

// Route to delete a classification by ID
router.delete('/:id', deleteClassification);

export default router;
