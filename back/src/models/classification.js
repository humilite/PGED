import pool from '../config/database.js';

class Classification {
  // Récupérer toutes les classifications
  static async findAll() {
    const query = `
      SELECT * FROM classification_plan 
      ORDER BY path
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des classifications: ${error.message}`);
    }
  }

  // Trouver une classification par ID
  static async findById(id) {
    const query = `
      SELECT * FROM classification_plan 
      WHERE id = $1
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la recherche: ${error.message}`);
    }
  }

  // Trouver une classification par code
  static async findByCode(code) {
    const query = `
      SELECT * FROM classification_plan 
      WHERE code = $1
    `;
    
    try {
      const result = await pool.query(query, [code]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la recherche: ${error.message}`);
    }
  }

  // Créer une nouvelle classification
  static async create(classificationData) {
    const { code, name, description, parent_id = null } = classificationData;
    
    let path = code;
    
    // Si parent_id est spécifié, construire le chemin hiérarchique
    if (parent_id) {
      const parent = await this.findById(parent_id);
      if (!parent) {
        throw new Error('Classification parente non trouvée');
      }
      path = `${parent.path}/${code}`;
    }

    const query = `
      INSERT INTO classification_plan (code, name, description, parent_id, path) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `;
    
    const values = [code, name, description, parent_id, path];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la création: ${error.message}`);
    }
  }

  // Mettre à jour une classification
  static async update(id, updateData) {
    const { name, description } = updateData;
    
    const query = `
      UPDATE classification_plan 
      SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 
      RETURNING *
    `;
    
    const values = [name, description, id];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
    }
  }

  // Obtenir l'arborescence complète
  static async getTree() {
    const query = `
      WITH RECURSIVE classification_tree AS (
        SELECT 
          id,
          code,
          name,
          description,
          parent_id,
          path,
          1 as level
        FROM classification_plan 
        WHERE parent_id IS NULL
        
        UNION ALL
        
        SELECT 
          cp.id,
          cp.code,
          cp.name,
          cp.description,
          cp.parent_id,
          cp.path,
          ct.level + 1
        FROM classification_plan cp
        INNER JOIN classification_tree ct ON cp.parent_id = ct.id
      )
      SELECT 
        ct.*,
        (SELECT COUNT(*) FROM documents WHERE classification_id = ct.id) as document_count
      FROM classification_tree ct
      ORDER BY ct.path
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'arborescence: ${error.message}`);
    }
  }

  // Obtenir les statistiques des classifications
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_classifications,
        COUNT(DISTINCT parent_id) as categories_principales,
        (SELECT COUNT(*) FROM classification_plan WHERE parent_id IS NULL) as racines
      FROM classification_plan
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des stats: ${error.message}`);
    }
  }
}

export default Classification;
