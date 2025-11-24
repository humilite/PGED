import { pool } from '../config/database';
import { generateDocumentIndex } from '../utils/indexGenerator';

export const uploadDocument = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, classification_id, confidentiality_level } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier uploadé' });
    }

    // Générer l'index alphanumérique
    const indexAlphanum = await generateDocumentIndex(classification_id);

    // Insérer le document dans la base
    const result = await pool.query(
      'INSERT INTO documents ' +
      '(index_alphanum, title, file_name, file_path, file_size, file_type, ' +
      'classification_id, user_id, confidentiality_level, metadata) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ' +
      'RETURNING *',
      [
        indexAlphanum,
        title,
        req.file.originalname,
        req.file.path,
        req.file.size,
        req.file.mimetype,
        classification_id,
        userId,
        confidentiality_level || 'interne',
        JSON.stringify({
          originalName: req.file.originalname,
          uploadDate: new Date().toISOString()
        })
      ]
    );

    res.status(201).json({
      message: 'Document uploadé avec succès',
      document: result.rows[0]
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload' });
  }
};

export const searchDocuments = async (req, res) => {
  try {
    const { q, type, date_from, date_to, author, classification } = req.query;
    const userId = req.user.userId;
    const userRole = req.user.role;

    let query = 
      'SELECT d.*, u.first_name, u.last_name, cp.name as classification_name ' +
      'FROM documents d ' +
      'LEFT JOIN users u ON d.user_id = u.id ' +
      'LEFT JOIN classification_plan cp ON d.classification_id = cp.id ' +
      'WHERE 1=1';

    const params = [];
    let paramCount = 0;

    // Filtre de recherche texte
    if (q) {
      paramCount++;
      query += ' AND (d.title ILIKE $' + paramCount + ' OR d.index_alphanum ILIKE $' + paramCount + ')';
      params.push('%' + q + '%');
    }

    // Filtre par type
    if (type) {
      paramCount++;
      query += ' AND d.file_type ILIKE $' + paramCount;
      params.push('%' + type + '%');
    }

    // Filtre par date
    if (date_from) {
      paramCount++;
      query += ' AND d.created_at >= $' + paramCount;
      params.push(date_from);
    }

    if (date_to) {
      paramCount++;
      query += ' AND d.created_at <= $' + paramCount;
      params.push(date_to);
    }

    // Filtre par auteur
    if (author) {
      paramCount++;
      query += ' AND (u.first_name ILIKE $' + paramCount + ' OR u.last_name ILIKE $' + paramCount + ')';
      params.push('%' + author + '%');
    }

    // Filtre par classification
    if (classification) {
      paramCount++;
      query += ' AND cp.code = $' + paramCount;
      params.push(classification);
    }

    // Restriction des droits d'accès (sauf pour les admins)
    if (userRole !== 'admin') {
      paramCount++;
      query += " AND (d.confidentiality_level != 'confidentiel' OR d.user_id = $" + paramCount + ')';
      params.push(userId);
    }

    query += ' ORDER BY d.created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      total: result.rows.length,
      documents: result.rows
    });

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

    const query =
      'SELECT d.*, u.first_name, u.last_name, cp.name as classification_name, ' +
      'cp.code as classification_code ' +
      'FROM documents d ' +
      'LEFT JOIN users u ON d.user_id = u.id ' +
      'LEFT JOIN classification_plan cp ON d.classification_id = cp.id ' +
      'WHERE d.id = $1';

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    const document = result.rows[0];

    // Vérifier les droits d'accès
    if (userRole !== 'admin' && document.confidentiality_level === 'confidentiel' && document.user_id !== userId) {
      return res.status(403).json({ error: 'Accès non autorisé à ce document' });
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

    // Vérifier que l'utilisateur peut modifier ce document
    const existingDoc = await pool.query(
      'SELECT user_id FROM documents WHERE id = $1',
      [id]
    );

    if (existingDoc.rows.length === 0) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    const document = existingDoc.rows[0];
    const userRole = req.user.role;

    // Seul l'auteur ou un admin peut modifier
    if (userRole !== 'admin' && document.user_id !== userId) {
      return res.status(403).json({ error: 'Non autorisé à modifier ce document' });
    }

    const result = await pool.query(
      'UPDATE documents ' +
      'SET title = $1, description = $2, classification_id = $3, ' +
      'confidentiality_level = $4, status = $5, metadata = $6, ' +
      'updated_at = CURRENT_TIMESTAMP, version = version + 1 ' +
      'WHERE id = $7 ' +
      'RETURNING *',
      [title, description, classification_id, confidentiality_level, status, metadata, id]
    );

    res.json({
      message: 'Document mis à jour avec succès',
      document: result.rows[0]
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

    // Dans une implémentation réelle, vous auriez une table d'historique
    const result = await pool.query(
      'SELECT created_at, \'Création\' as action, first_name, last_name ' +
      'FROM documents d ' +
      'JOIN users u ON d.user_id = u.id ' +
      'WHERE d.id = $1 ' +
      'UNION ALL ' +
      'SELECT updated_at, \'Modification\' as action, first_name, last_name ' +
      'FROM documents d ' +
      'JOIN users u ON d.user_id = u.id ' +
      'WHERE d.id = $1 AND updated_at != created_at ' +
      'ORDER BY created_at DESC',
      [id]
    );

    res.json({ history: result.rows });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
