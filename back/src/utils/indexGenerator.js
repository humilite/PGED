import { pool } from '../config/database';

export const generateDocumentIndex = async (classificationId) => {
  // Récupérer le code de classification
  const classificationResult = await pool.query(
    'SELECT code FROM classification_plan WHERE id = $1',
    [classificationId]
  );

  if (classificationResult.rows.length === 0) {
    throw new Error('Classification non trouvée');
  }

  const classificationCode = classificationResult.rows[0].code;
  const year = new Date().getFullYear();

  // Compter les documents de cette classification cette année
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM documents 
     WHERE classification_id = $1 
     AND EXTRACT(YEAR FROM created_at) = $2`,
    [classificationId, year]
  );

  const sequence = parseInt(countResult.rows[0].count) + 1;
  
  return `${classificationCode}-${year}-${sequence.toString().padStart(4, '0')}`;
};