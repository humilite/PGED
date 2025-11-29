import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

// Configuration de la base de données PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ged_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin',
  max: 20, // Nombre maximum de connexions
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Gestion des erreurs de connexion
pool.on('error', (err, client) => {
  console.error('❌ Erreur inattendue sur le client PostgreSQL:', err);
  process.exit(-1);
});

// Wrapper pour les requêtes PostgreSQL
export const query = (text, params = []) => {
  return pool.query(text, params);
};

// Test de connexion à la base de données
export const connectDB = async () => {
  try {
    // Tester la connexion avec une requête simple
    await query('SELECT 1');
    console.log('✅ Connexion à PostgreSQL réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à PostgreSQL:', error.message);
    return false;
  }
};

// Gestion propre de la fermeture du pool
export const closePool = () => {
  return pool.end();
};

export default pool;
