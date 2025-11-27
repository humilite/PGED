import pool from '../config/database.js';

class User {
  // Créer un nouvel utilisateur
  static async create(userData) {
    const { email, password, first_name, last_name, role = 'user' } = userData;

    const query = `
      INSERT INTO users (email, password, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, last_name, role, is_active, created_at
    `;

    const values = [email, password, first_name, last_name, role];

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
      SELECT id, email, first_name, last_name, role, is_active, last_login, created_at
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
    const { first_name, last_name, role, is_active } = updateData;

    const query = `
      UPDATE users
      SET first_name = $1, last_name = $2, role = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, email, first_name, last_name, role, is_active, updated_at
    `;

    const values = [first_name, last_name, role, is_active, id];

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
        SELECT id, email, first_name, last_name, role, is_active,
               last_login, created_at,
               (SELECT COUNT(*) FROM documents WHERE user_id = users.id) as document_count
        FROM users
      `;

      const params = [];
      let paramCount = 0;

      if (search) {
        paramCount++;
        query += ` WHERE (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      paramCount++;
      query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
      params.push(limit);

      paramCount++;
      query += ` OFFSET $${paramCount}`;
      params.push(offset);

      const result = await pool.query(query, params);
      const users = result.rows;

      // Compter le total
      let countQuery = `SELECT COUNT(*) as count FROM users`;
      const countParams = [];

      if (search) {
        countQuery += ` WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)`;
        countParams.push(`%${search}%`);
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

export default User; // ← EXPORT ES6