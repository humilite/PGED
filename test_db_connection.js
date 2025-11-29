dmin
import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ged_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin',
});

async function testConnection() {
  try {
    console.log('🔍 Test de connexion à PostgreSQL...');
    const client = await pool.connect();
    console.log('✅ Connexion réussie!');

    // Tester une requête simple
    const result = await client.query('SELECT version()');
    console.log('📋 Version PostgreSQL:', result.rows[0].version);

    // Vérifier si la base de données ged_db existe
    const dbResult = await client.query("SELECT datname FROM pg_database WHERE datname = 'ged_db'");
    if (dbResult.rows.length > 0) {
      console.log('✅ Base de données ged_db existe');
    } else {
      console.log('❌ Base de données ged_db n\'existe pas');
    }

    client.release();
    await pool.end();
    console.log('🎉 Test terminé avec succès!');
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    process.exit(1);
  }
}

testConnection();
