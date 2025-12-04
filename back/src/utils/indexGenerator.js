// CORRECTION : Un seul import avec extension .js
import { query } from '../config/database.js';

export const generateDocumentIndex = async (classificationPath) => {
  try {
    if (!classificationPath || !Array.isArray(classificationPath) || classificationPath.length === 0) {
      throw new Error('Chemin de classification requis');
    }

    // Extraire tous les codes du chemin hiérarchique
    const codes = classificationPath.map(item => item.code).join('-');
    const year = new Date().getFullYear();

    // Utiliser l'ID de la classification feuille pour compter les documents
    const leafClassificationId = classificationPath[classificationPath.length - 1].id;

    // Utiliser 'categorie_id' au lieu de 'classification_id'
    const countResult = await query(
      `SELECT COUNT(*) FROM documents
       WHERE categorie_id = $1
       AND EXTRACT(YEAR FROM created_at) = $2`,
      [leafClassificationId, year]
    );

    const sequence = parseInt(countResult.rows[0].count) + 1;

    return `${codes}-${year}-${sequence.toString().padStart(4, '0')}`;

  } catch (error) {
    console.error('Erreur génération index:', error);
    // Fallback en cas d'erreur
    const year = new Date().getFullYear();
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