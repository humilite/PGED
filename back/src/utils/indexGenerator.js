// CORRECTION : Un seul import avec extension .js
import { query } from '../config/database.js';

export const generateDocumentIndex = async (classificationId) => {
  try {
    // Utiliser la table 'classifications' au lieu de 'classification_plan'
    const classificationResult = await query(
      'SELECT code FROM classifications WHERE id = $1',
      [classificationId]
    );

    if (classificationResult.rows.length === 0) {
      throw new Error('Classification non trouvée');
    }

    const classificationCode = classificationResult.rows[0].code;
    const year = new Date().getFullYear();

    // Utiliser 'categorie_id' au lieu de 'classification_id'
    const countResult = await query(
      `SELECT COUNT(*) FROM documents 
       WHERE categorie_id = $1 
       AND EXTRACT(YEAR FROM created_at) = $2`,
      [classificationId, year]
    );

    const sequence = parseInt(countResult.rows[0].count) + 1;
    
    return `${classificationCode}-${year}-${sequence.toString().padStart(4, '0')}`;
    
  } catch (error) {
    console.error('Erreur génération index:', error);
    // Fallback en cas d'erreur
    return `DOC-${year}-${Date.now().toString().slice(-6)}`;
  }
};

// Version simplifiée pour développement
export const generateSimpleIndex = (prefix = 'DOC') => {
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${Date.now().toString().slice(-6)}`;
};

export default {
  generateDocumentIndex,
  generateSimpleIndex
};