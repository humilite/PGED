import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT id, email, first_name, last_name, role, is_active, 
             last_login, created_at,
             (SELECT COUNT(*) FROM documents WHERE user_id = users.id) as document_count
      FROM users
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(Number(limit), offset);

    const result = await pool.query(query, params);

    // Count total
    const countQuery = `SELECT COUNT(*) FROM users ${search ? 'WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1' : ''}`;
    const countResult = await pool.query(countQuery, search ? [`%${search}%`] : []);

    res.json({
      users: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: Number(page),
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / Number(limit))
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const createUser = async (req, res) => {
  try {
    const { email, password, first_name, last_name, role } = req.body;

    // Validation des champs requis
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'Tous les champs requis doivent être fournis (email, password, first_name, last_name)' });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const result = await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, first_name, last_name, role, created_at`,
      [email, hashedPassword, first_name, last_name, role]
    );

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, role, is_active } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, role = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 
       RETURNING id, email, first_name, last_name, role, is_active, updated_at`,
      [first_name, last_name, role, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      message: 'Utilisateur mis à jour avec succès',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const [
      usersCount,
      activeUsersCount,
      documentsCount,
      classificationsCount,
      recentActivity
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM users WHERE is_active = true'),
      pool.query('SELECT COUNT(*) FROM documents'),
      pool.query('SELECT COUNT(*) FROM classification_plan'),
      pool.query(`
        SELECT 'document' as type, title, created_at 
        FROM documents 
        ORDER BY created_at DESC 
        LIMIT 5
      `)
    ]);

    res.json({
      totalUsers: parseInt(usersCount.rows[0].count),
      activeUsers: parseInt(activeUsersCount.rows[0].count),
      totalDocuments: parseInt(documentsCount.rows[0].count),
      totalClassifications: parseInt(classificationsCount.rows[0].count),
      recentActivity: recentActivity.rows
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export {
  getUsers,
  createUser,
  updateUser,
  getDashboardStats
};
