import Classification from '../models/classification.js';

export const createClassification = async (req, res) => {
    try {
        const classification = await Classification.create(req.body);
        res.status(201).json({
            message: 'Classification créée avec succès',
            classification,
        });
    } catch (error) {
        console.error('Create classification error:', error);
        res.status(500).json({ error: 'Erreur lors de la création' });
    }
};

export const getAllClassifications = async (req, res) => {
    try {
        const classifications = await Classification.findAll();
        res.json(classifications);
    } catch (error) {
        console.error('Get all classifications error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des classifications' });
    }
};

export const getClassificationById = async (req, res) => {
    try {
        const { id } = req.params;
        const classification = await Classification.findById(id);

        if (!classification) {
            return res.status(404).json({ error: 'Classification non trouvée' });
        }

        res.json(classification);
    } catch (error) {
        console.error('Get classification by ID error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de la classification' });
    }
};

export const getFullTree = async (req, res) => {
    try {
        const tree = await Classification.getFullTree();
        res.json(tree);
    } catch (error) {
        console.error('Get full tree error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'arbre complet' });
    }
};

export const getChildren = async (req, res) => {
    try {
        const { parentId } = req.params;
        const children = await Classification.getChildren(parentId);
        res.json(children);
    } catch (error) {
        console.error('Get children error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des enfants' });
    }
};

export const updateClassification = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedClassification = await Classification.update(id, req.body);

        if (!updatedClassification) {
            return res.status(404).json({ error: 'Classification non trouvée' });
        }

        return res.json({
            message: 'Mise à jour réussie',
            updatedClassification
        });

    } catch (error) {
        console.error('Update classification error:', error);
        return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
}

export const moveClassification = async (req, res) => {
    try {
        const { id } = req.params;
        const { newParentId } = req.body;

        const movedClassification = await Classification.moveNode(id, newParentId);

        res.json({
            message: 'Classification déplacée avec succès',
            movedClassification
        });
    } catch (error) {
        console.error('Move classification error:', error);
        res.status(500).json({ error: 'Erreur lors du déplacement de la classification' });
    }
};

export const deleteClassification = async (req, res) => {
    try {
        // Get ID from params
        let { id } = req.params;

        // Call delete method on model
        await Classification.delete(id);

        // Send success response
        return res.json({
            message: "Suppression réussie"
        });

    } catch (error) {
        console.error("Delete Error:", error);
        return res.status(500).json({ "Error": "Erreur lors de la suppression" });
    }
}
