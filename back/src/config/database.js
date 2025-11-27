import pkg from 'pg';
const { Pool } = pkg;

// Configuration de la base de données
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'pged_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    max: 20, // maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Fonction utilitaire pour exécuter des requêtes
export const query = (text, params) => {
    return pool.query(text, params);
};

// Test de connexion à la base de données
export const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log('✅ Connexion à PostgreSQL réussie');
        client.release();
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