import pool from '../src/config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔄 Initialisation de la base de données PostgreSQL...');

// Script SQL pour créer les tables (PostgreSQL)
const dropSQL = `
DROP TABLE IF EXISTS document_metadata CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS classification_plan CASCADE;
DROP TABLE IF EXISTS users CASCADE;
`;

const schemaSQL = `
-- Table des utilisateurs
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  department VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table du plan de classement
CREATE TABLE classification_plan (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id INTEGER REFERENCES classification_plan(id),
  path VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des documents
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  index_alphanum VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  file_path VARCHAR(1000) NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  classification_id INTEGER REFERENCES classification_plan(id),
  user_id INTEGER REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'draft',
  confidentiality_level VARCHAR(50) DEFAULT 'interne',
  metadata JSONB,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des métadonnées
CREATE TABLE document_metadata (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  key VARCHAR(255) NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimisation des recherches
CREATE INDEX idx_documents_index ON documents(index_alphanum);
CREATE INDEX idx_documents_title ON documents(title);
CREATE INDEX idx_documents_classification ON documents(classification_id);
CREATE INDEX idx_documents_metadata ON documents USING gin(metadata);
`;

// Données initiales
const seedSQL = `
-- Données de base pour le plan de classement
INSERT INTO classification_plan (code, name, description, path) VALUES
('RH', 'Ressources Humaines', 'Catégorie principale RH', 'RH'),
('RH-CTR', 'Contrats', 'Contrats de travail', 'RH/RH-CTR'),
('RH-DOS', 'Dossiers Personnel', 'Dossiers individuels', 'RH/RH-DOS'),
('RH-RAP', 'Rapports', 'Rapports d''activité', 'RH/RH-RAP'),
('RH-POL', 'Politiques', 'Politiques RH', 'RH/RH-POL')
ON CONFLICT (code) DO NOTHING;

-- Utilisateur admin par défaut (mot de passe: admin123)
INSERT INTO users (email, password, first_name, last_name, role) VALUES
('admin@dgrh.gov.ga', '$2a$10$8A5/5uW5eB0q3p6p8Y8Zz.ZrV8V5rV8V5rV8V5rV8V5rV8V5rV8V2', 'Admin', 'System', 'admin'),
('user@dgrh.gov.ga', '$2a$10$8A5/5uW5eB0q3p6p8Y8Zz.ZrV8V5rV8V5rV8V5rV8V5rV8V5rV8V2', 'Utilisateur', 'Test', 'user')
ON CONFLICT (email) DO NOTHING;
`;

// Fonction pour exécuter la migration
async function runMigration() {
  try {
    console.log('🗑️ Suppression des tables existantes...');
    await pool.query(dropSQL);
    console.log('✅ Tables supprimées avec succès');

    console.log('📋 Création des tables...');
    await pool.query(schemaSQL);
    console.log('✅ Tables créées avec succès');

    console.log('📝 Insertion des données initiales...');
    await pool.query(seedSQL);
    console.log('✅ Données initiales insérées avec succès');

    // Vérifier les tables créées
    const tablesResult = await pool.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    console.log('\n📋 Tables dans la base de données:');
    tablesResult.rows.forEach(row => {
      console.log('   -', row.tablename);
    });

    // Compter les enregistrements par table
    const tablesToCount = ['users', 'classification_plan', 'documents'];
    console.log('\n📊 Statistiques:');
    for (const tableName of tablesToCount) {
      const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`   - ${tableName}: ${countResult.rows[0].count} enregistrement(s)`);
    }

    console.log('\n🎉 Migration PostgreSQL terminée avec succès!');
    console.log('💡 Vous pouvez maintenant démarrer le serveur avec: npm run dev');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  }
}

// Exécuter la migration
runMigration();
