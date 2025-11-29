import pool from '../config/database.js';

class User {
  // Créer un nouvel utilisateur
  static async create(userData) {
    const { email, password, first_name, last_name, role = 'user', department } = userData;

    // Validation des champs requis
    if (!email || !password || !first_name || !last_name) {
      throw new Error('Tous les champs requis doivent être fournis: email, password, first_name, last_name');
    }

    const query = `
      INSERT INTO users (email, password, first_name, last_name, role, department)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [email, password, first_name, last_name, role, department];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
    }
  }

  // Trouver un utilisateur par email
  static async findByEmail(email) {
    const query = `SELECT * FROM users WHERE email = $1`;

    try {
      const result = await pool.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la recherche par email: ${error.message}`);
    }
  }

  // Trouver un utilisateur par ID
  static async findById(id) {
    const query = `
      SELECT id, email, first_name, last_name, role, department, is_active, last_login, created_at
      FROM users WHERE id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la recherche par ID: ${error.message}`);
    }
  }

  // Mettre à jour un utilisateur
  static async update(id, updateData) {
    const { first_name, last_name, role, department, is_active } = updateData;

    // Construire la requête dynamiquement pour éviter les valeurs undefined
    const setParts = [];
    const values = [];
    let paramIndex = 1;

    if (first_name !== undefined) {
      setParts.push(`first_name = $${paramIndex++}`);
      values.push(first_name);
    }
    if (last_name !== undefined) {
      setParts.push(`last_name = $${paramIndex++}`);
      values.push(last_name);
    }
    if (role !== undefined) {
      setParts.push(`role = $${paramIndex++}`);
      values.push(role);
    }
    if (department !== undefined) {
      setParts.push(`department = $${paramIndex++}`);
      values.push(department);
    }
    if (is_active !== undefined) {
      setParts.push(`is_active = $${paramIndex++}`);
      values.push(is_active);
    }

    if (setParts.length === 0) {
      throw new Error('Aucune donnée à mettre à jour');
    }

    setParts.push(`updated_at = CURRENT_TIMESTAMP`);

    const query = `
      UPDATE users
      SET ${setParts.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    values.push(id);

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
    }
  }

  // Mettre à jour le dernier login
  static async updateLastLogin(id) {
    const query = `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1`;

    try {
      await pool.query(query, [id]);
    } catch (error) {
      throw new Error(`Erreur mise à jour dernier login: ${error.message}`);
    }
  }

  // Récupérer tous les utilisateurs (avec pagination)
  static async findAll(page = 1, limit = 10, search = '') {
    const offset = (page - 1) * limit;

    try {
      let query = `
        SELECT id, email, first_name, last_name, role, department, is_active,
               last_login, created_at,
               (SELECT COUNT(*) FROM documents WHERE user_id = users.id) as document_count
        FROM users
      `;

      const params = [];
      let paramIndex = 1;

      if (search) {
        query += ` WHERE (UPPER(first_name) LIKE UPPER($${paramIndex}) OR UPPER(last_name) LIKE UPPER($${paramIndex + 1}) OR UPPER(email) LIKE UPPER($${paramIndex + 2}))`;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
        paramIndex += 3;
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);
      const users = result.rows;

      // Compter le total
      let countQuery = `SELECT COUNT(*) as count FROM users`;
      const countParams = [];

      if (search) {
        countQuery += ` WHERE (UPPER(first_name) LIKE UPPER($1) OR UPPER(last_name) LIKE UPPER($2) OR UPPER(email) LIKE UPPER($3))`;
        const searchPattern = `%${search}%`;
        countParams.push(searchPattern, searchPattern, searchPattern);
      }

      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      return {
        users,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des utilisateurs: ${error.message}`);
    }
  }

  // Obtenir les statistiques des utilisateurs
  static async getStats() {
    const query = `
      SELECT
        COUNT(*) as total_users,
        SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count,
        SUM(CASE WHEN role = 'gestionnaire' THEN 1 ELSE 0 END) as gestionnaire_count
      FROM users
    `;

    try {
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des stats: ${error.message}`);
    }
  }
}

export default User;
