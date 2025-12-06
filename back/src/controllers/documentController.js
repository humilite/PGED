import { Document } from '../models/index.js';
import { generateDocumentIndex } from '../utils/indexGenerator.js';

export const uploadDocument = async (req, res) => {
  try {
    console.log('🔍 Upload Debug - req.user:', req.user);
    console.log('🔍 Upload Debug - req.user.id:', req.user?.id);

    // Use authenticated user ID since user is already authenticated
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }
    const { title, classification_id, confidentiality_level, classification_path } = req.body;

    console.log('🔍 Upload Debug - Final userId:', userId);

    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier uploadé' });
    }

    // Générer l'index alphanumérique avec le chemin complet
    const indexAlphanum = await generateDocumentIndex(classification_path ? JSON.parse(classification_path) : null);

    // Créer le document via le modèle
    const documentData = {
      index_alphanum: indexAlphanum,
      title,
      file_name: req.file.originalname,
      file_path: req.file.path,
      file_size: req.file.size,
      file_type: req.file.mimetype,
      classification_id,
      user_id: userId,
      confidentiality_level: confidentiality_level || 'interne',
      metadata: {
        originalName: req.file.originalname,
        uploadDate: new Date().toISOString()
      }
    };

    console.log('🔍 Document creation - documentData:', documentData);

    const document = await Document.create(documentData);

    console.log('🔍 Document created - result:', document);

    res.status(201).json({
      message: 'Document uploadé avec succès',
      document: document
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload' });
  }
};

export const searchDocuments = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }
    const userRole = req.user.role;
    const { q, type, date_from, date_to, author, classification, page = 1, limit = 10 } = req.query;

    const searchParams = {
      q,
      type,
      date_from,
      date_to,
      author,
      classification,
      page: parseInt(page),
      limit: parseInt(limit),
      userId,
      userRole
    };

    const result = await Document.search(searchParams);

    res.json(result);

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }
    const userRole = req.user.role;

    const document = await Document.findById(id, userId, userRole);

    if (!document) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    res.json({ document });

  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, classification_id, confidentiality_level, status, metadata } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const updateData = {
      title,
      description,
      classification_id,
      confidentiality_level,
      status,
      metadata
    };

    const updatedDocument = await Document.update(id, updateData, userId, userRole);

    res.json({
      message: 'Document mis à jour avec succès',
      document: updatedDocument
    });

  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
};

export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }
    const userRole = req.user.role;

    // Use Document model for consistency and access control
    const document = await Document.findById(id, userId, userRole);

    if (!document) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    res.download(document.file_path, document.file_name);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement' });
  }
};

export const getDocumentHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const history = await Document.getHistory(id);

    res.json({ history });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getAllDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }
    const userRole = req.user.role;

    const searchParams = {
      page: parseInt(page),
      limit: parseInt(limit),
      userId,
      userRole
    };

    const result = await Document.search(searchParams);

    res.json(result);

  } catch (error) {
    console.error('Get all documents error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des documents' });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }
    const userRole = req.user.role;

    const deletedDocument = await Document.softDelete(id, userId, userRole);

    res.json({
      message: 'Document supprimé avec succès',
      document: deletedDocument
    });

  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};

export const getDocumentStats = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }
    const userRole = req.user.role;

    const stats = await Document.getGeneralStats(userId, userRole);

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
