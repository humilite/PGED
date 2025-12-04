import pool from '../config/database.js';

class Document {
  // Créer un nouveau document
  static async create(documentData) {
    const {
      index_alphanum,
      title,
      file_name,
      file_path,
      file_size,
      file_type,
      classification_id,
      user_id,
      confidentiality_level = 'interne',
      metadata = {}
    } = documentData;

    const query = `
      INSERT INTO documents 
      (index_alphanum, title, file_name, file_path, file_size, file_type, 
       classification_id, user_id, confidentiality_level, metadata) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *
    `;
    
    const values = [
      index_alphanum,
      title,
      file_name,
      file_path,
      file_size,
      file_type,
      classification_id,
      user_id,
      confidentiality_level,
      JSON.stringify(metadata)
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la création du document: ${error.message}`);
    }
  }

  // Trouver un document par ID
  static async findById(id, userId = null, userRole = null) {
    const query = `
      SELECT d.*, u.first_name, u.last_name, 
             cp.name as classification_name, cp.code as classification_code
      FROM documents d
      LEFT JOIN users u ON d.user_id = u.id
      LEFT JOIN classification_plan cp ON d.classification_id = cp.id
      WHERE d.id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const document = result.rows[0];

      // Vérifier les droits d'accès
      if (userRole !== 'admin' && 
          document.confidentiality_level === 'confidentiel' && 
          document.user_id !== userId) {
        throw new Error('Accès non autorisé à ce document');
      }

      return document;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche du document: ${error.message}`);
    }
  }

  // Rechercher des documents
  static async search(searchParams) {
    const {
      q = '',
      type = '',
      date_from = '',
      date_to = '',
      author = '',
      classification = '',
      page = 1,
      limit = 10,
      userId,
      userRole
    } = searchParams;

    const offset = (page - 1) * limit;
    
    let query = `
      SELECT d.*, u.first_name, u.last_name, cp.name as classification_name
      FROM documents d
      LEFT JOIN users u ON d.user_id = u.id
      LEFT JOIN classification_plan cp ON d.classification_id = cp.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 0;

    // Filtre de recherche texte
    if (q) {
      paramCount++;
      query += ` AND (d.title ILIKE $${paramCount} OR d.index_alphanum ILIKE $${paramCount})`;
      values.push(`%${q}%`);
    }

    // Filtre par type
    if (type) {
      paramCount++;
      query += ` AND d.file_type ILIKE $${paramCount}`;
      values.push(`%${type}%`);
    }

    // Filtre par date
    if (date_from) {
      paramCount++;
      query += ` AND d.created_at >= $${paramCount}`;
      values.push(date_from);
    }

    if (date_to) {
      paramCount++;
      query += ` AND d.created_at <= $${paramCount}`;
      values.push(date_to);
    }

    // Filtre par auteur
    if (author) {
      paramCount++;
      query += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount})`;
      values.push(`%${author}%`);
    }

    // Filtre par classification
    if (classification) {
      paramCount++;
      query += ` AND cp.code = $${paramCount}`;
      values.push(classification);
    }

    // Restriction des droits d'accès (sauf pour les admins)
    if (userRole !== 'admin') {
      paramCount++;
      query += ` AND (d.confidentiality_level != 'confidentiel' OR d.user_id = $${paramCount})`;
      values.push(userId);
    }

    // Compter le total avant la pagination
    const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Ajouter la pagination et le tri
    query += ` ORDER BY d.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    try {
      const result = await pool.query(query, values);
      
      return {
        documents: result.rows,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new Error(`Erreur lors de la recherche: ${error.message}`);
    }
  }

  // Mettre à jour un document
  static async update(id, updateData, userId, userRole) {
    const {
      title,
      description,
      classification_id,
      confidentiality_level,
      status,
      metadata
    } = updateData;

    // Vérifier que l'utilisateur peut modifier ce document
    const existingDoc = await this.findById(id, userId, userRole);
    if (!existingDoc) {
      throw new Error('Document non trouvé');
    }

    // Seul l'auteur ou un admin peut modifier
    if (userRole !== 'admin' && existingDoc.user_id !== userId) {
      throw new Error('Non autorisé à modifier ce document');
    }

    const query = `
      UPDATE documents 
      SET title = $1, description = $2, classification_id = $3, 
          confidentiality_level = $4, status = $5, metadata = $6,
          updated_at = CURRENT_TIMESTAMP, version = version + 1
      WHERE id = $7 
      RETURNING *
    `;
    
    const values = [
      title,
      description,
      classification_id,
      confidentiality_level,
      status,
      JSON.stringify(metadata),
      id
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
    }
  }

  // Obtenir les statistiques des documents
  static async getStats() {
    const queries = [
      // Total documents
      `SELECT COUNT(*) as total_documents FROM documents`,
      
      // Documents par type
      `SELECT file_type, COUNT(*) as count 
       FROM documents 
       GROUP BY file_type 
       ORDER BY count DESC`,
      
      // Documents par classification
      `SELECT cp.name, COUNT(*) as count 
       FROM documents d
       JOIN classification_plan cp ON d.classification_id = cp.id
       GROUP BY cp.name, cp.id 
       ORDER BY count DESC`,
      
      // Documents par mois (6 derniers mois)
      `SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as count
       FROM documents 
       WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
       GROUP BY month 
       ORDER BY month DESC`
    ];

    try {
      const [totalResult, typeResult, classificationResult, monthlyResult] = await Promise.all(
        queries.map(query => pool.query(query))
      );

      return {
        total: parseInt(totalResult.rows[0].total_documents),
        byType: typeResult.rows,
        byClassification: classificationResult.rows,
        monthly: monthlyResult.rows
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des stats: ${error.message}`);
    }
  }

  // Obtenir l'historique d'un document
  static async getHistory(documentId) {
    const query = `
      SELECT created_at, 'Création' as action, first_name, last_name
      FROM documents d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = $1
      UNION ALL
      SELECT updated_at, 'Modification' as action, first_name, last_name
      FROM documents d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = $1 AND updated_at != created_at
      ORDER BY created_at DESC
    `;

    try {
      const result = await pool.query(query, [documentId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'historique: ${error.message}`);
    }
  }

  // Supprimer un document (soft delete)
  static async softDelete(id, userId, userRole) {
    const existingDoc = await this.findById(id, userId, userRole);
    if (!existingDoc) {
      throw new Error('Document non trouvé');
    }

    if (userRole !== 'admin' && existingDoc.user_id !== userId) {
      throw new Error('Non autorisé à supprimer ce document');
    }

    const query = `
      UPDATE documents
      SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  }

  // Obtenir les statistiques générales
  static async getGeneralStats(userId, userRole) {
    try {
      let totalQuery = `SELECT COUNT(*) as total FROM documents WHERE is_deleted = false`;
      let approvedQuery = `SELECT COUNT(*) as approved FROM documents WHERE status = 'approved' AND is_deleted = false`;
      let pendingQuery = `SELECT COUNT(*) as pending FROM documents WHERE status = 'pending' AND is_deleted = false`;
      let rejectedQuery = `SELECT COUNT(*) as rejected FROM documents WHERE status = 'rejected' AND is_deleted = false`;

      // Restriction pour les non-admins
      if (userRole !== 'admin') {
        totalQuery += ` AND (confidentiality_level != 'confidentiel' OR user_id = $1)`;
        approvedQuery += ` AND (confidentiality_level != 'confidentiel' OR user_id = $1)`;
        pendingQuery += ` AND (confidentiality_level != 'confidentiel' OR user_id = $1)`;
        rejectedQuery += ` AND (confidentiality_level != 'confidentiel' OR user_id = $1)`;
      }

      const [totalResult, approvedResult, pendingResult, rejectedResult] = await Promise.all([
        pool.query(totalQuery, userRole !== 'admin' ? [userId] : []),
        pool.query(approvedQuery, userRole !== 'admin' ? [userId] : []),
        pool.query(pendingQuery, userRole !== 'admin' ? [userId] : []),
        pool.query(rejectedQuery, userRole !== 'admin' ? [userId] : [])
      ]);

      return {
        totalDocuments: parseInt(totalResult.rows[0].total),
        documentsApprouves: parseInt(approvedResult.rows[0].approved),
        documentsEnAttente: parseInt(pendingResult.rows[0].pending),
        documentsRejetes: parseInt(rejectedResult.rows[0].rejected)
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des stats générales: ${error.message}`);
    }
  }

  // Obtenir les statistiques du tableau de bord
  static async getDashboardStats(userId, userRole) {
    try {
      let totalQuery = `SELECT COUNT(*) as total FROM documents WHERE is_deleted = false`;
      let recentQuery = `SELECT COUNT(*) as recent FROM documents WHERE created_at >= CURRENT_DATE - INTERVAL '7 days' AND is_deleted = false`;
      let userQuery = `SELECT COUNT(*) as user_docs FROM documents WHERE user_id = $1 AND is_deleted = false`;

      const params = [userId];

      // Restriction pour les non-admins
      if (userRole !== 'admin') {
        totalQuery += ` AND (confidentiality_level != 'confidentiel' OR user_id = $1)`;
        recentQuery += ` AND (confidentiality_level != 'confidentiel' OR user_id = $1)`;
        params.push(userId);
      }

      const [totalResult, recentResult, userResult] = await Promise.all([
        pool.query(totalQuery, userRole !== 'admin' ? [userId] : []),
        pool.query(recentQuery, userRole !== 'admin' ? [userId] : []),
        pool.query(userQuery, params)
      ]);

      return {
        totalDocuments: parseInt(totalResult.rows[0].total),
        recentDocuments: parseInt(recentResult.rows[0].recent),
        userDocuments: parseInt(userResult.rows[0].user_docs)
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des stats du tableau de bord: ${error.message}`);
    }
  }
}

export default Document;
