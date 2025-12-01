import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

async function migratePostgreSQL() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // Connect to default database first
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Admin',
  });

  try {
    console.log('🔄 Connexion à PostgreSQL...');
    await client.connect();

    const dbName = process.env.DB_NAME || 'ged_bd';

    // Vérifier si la base de données existe
    const dbCheck = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (dbCheck.rows.length === 0) {
      console.log(`📁 Création de la base de données '${dbName}'...`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Base de données '${dbName}' créée`);
    } else {
      console.log(`✅ Base de données '${dbName}' existe déjà`);
    }

    await client.end();

    // Se connecter à la base de données cible
    const targetClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: dbName,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'Admin',
    });

    await targetClient.connect();
    console.log(`🔗 Connecté à la base de données '${dbName}'`);

    // Lire et exécuter le schema
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    console.log('📖 Exécution du schema SQL...');
    await targetClient.query(schemaSQL);
    console.log('✅ Schema appliqué avec succès');

    // Vérifier les utilisateurs
    const users = await targetClient.query('SELECT id, email, first_name, last_name, role FROM users');
    console.log('👥 Utilisateurs dans la base de données:');
    users.rows.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });

    await targetClient.end();
    console.log('🎉 Migration terminée avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  }
}

migratePostgreSQL();
