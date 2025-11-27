import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM classification_plan 
      ORDER BY path
    `);
    
    res.json({ classifications: result.rows });
  } catch (error) {
    console.error('Get classifications error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;