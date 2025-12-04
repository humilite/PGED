import { Document } from '../models/index.js';
import { generateDocumentIndex } from '../utils/indexGenerator.js';

export const uploadDocument = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, classification_id, confidentiality_level, classification_path } = req.body;

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

    const document = await Document.create(documentData);

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
    const { q, type, date_from, date_to, author, classification, page = 1, limit = 10 } = req.query;
    const userId = req.user.userId;
    const userRole = req.user.role;

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
    const userId = req.user.userId;
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
    const userId = req.user.userId;
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
    const userId = req.user.userId;
    const userRole = req.user.role;

    const result = await pool.query(
      'SELECT file_path, file_name, confidentiality_level, user_id ' +
      'FROM documents WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    const document = result.rows[0];

    // Vérifier les droits d'accès
    if (userRole !== 'admin' && document.confidentiality_level === 'confidentiel' && document.user_id !== userId) {
      return res.status(403).json({ error: 'Accès non autorisé à ce document' });
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

export const getDocumentStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    const stats = await Document.getGeneralStats(userId, userRole);

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
