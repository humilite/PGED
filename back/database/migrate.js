import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'pged.db');

// Créer le dossier database s'il n'existe pas
if (!fs.existsSync(__dirname)) {
  fs.mkdirSync(__dirname, { recursive: true });
}

console.log('🔄 Initialisation de la base de données SQLite...');
console.log('📁 Chemin de la base de données:', dbPath);

// Supprimer l'ancienne base de données si elle existe
if (fs.existsSync(dbPath)) {
  console.log('🗑️  Suppression de l ancienne base de données...');
  fs.unlinkSync(dbPath);
}

// Créer la connexion à la base de données
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erreur de connexion à la base de données:', err.message);
    process.exit(1);
  }
  console.log('✅ Connecté à la base de données SQLite');
});

// Script SQL pour créer les tables
const schemaSQL = `
-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  is_active INTEGER DEFAULT 1,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table du plan de classement
CREATE TABLE IF NOT EXISTS classification_plan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  parent_id INTEGER REFERENCES classification_plan(id),
  path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des documents
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  index_alphanum TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  classification_id INTEGER REFERENCES classification_plan(id),
  user_id INTEGER REFERENCES users(id),
  status TEXT DEFAULT 'draft',
  confidentiality_level TEXT DEFAULT 'interne',
  metadata TEXT,
  version INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des métadonnées
CREATE TABLE IF NOT EXISTS document_metadata (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimisation des recherches
CREATE INDEX IF NOT EXISTS idx_documents_index ON documents(index_alphanum);
CREATE INDEX IF NOT EXISTS idx_documents_title ON documents(title);
CREATE INDEX IF NOT EXISTS idx_documents_classification ON documents(classification_id);
`;

// Données initiales
const seedSQL = `
-- Données de base pour le plan de classement
INSERT INTO classification_plan (code, name, description, path) VALUES
('RH', 'Ressources Humaines', 'Catégorie principale RH', 'RH'),
('RH-CTR', 'Contrats', 'Contrats de travail', 'RH/RH-CTR'),
('RH-DOS', 'Dossiers Personnel', 'Dossiers individuels', 'RH/RH-DOS'),
('RH-RAP', 'Rapports', 'Rapports d activite', 'RH/RH-RAP'),
('RH-POL', 'Politiques', 'Politiques RH', 'RH/RH-POL');

-- Utilisateur admin par défaut (mot de passe: admin123)
INSERT INTO users (email, password, first_name, last_name, role) VALUES
('admin@dgrh.gov.ga', '$2a$10$8A5/5uW5eB0q3p6p8Y8Zz.ZrV8V5rV8V5rV8V5rV8V5rV8V5rV8V2', 'Admin', 'System', 'admin'),
('user@dgrh.gov.ga', '$2a$10$8A5/5uW5eB0q3p6p8Y8Zz.ZrV8V5rV8V5rV8V5rV8V5rV8V5rV8V2', 'Utilisateur', 'Test', 'user');
`;

// Exécuter la migration
db.exec(schemaSQL, (err) => {
  if (err) {
    console.error('❌ Erreur lors de la création des tables:', err.message);
    db.close();
    process.exit(1);
  }
  
  console.log('✅ Tables créées avec succès');
  
  // Insérer les données initiales
  db.exec(seedSQL, (err) => {
    if (err) {
      console.error('❌ Erreur lors de l insertion des données:', err.message);
    } else {
      console.log('✅ Données initiales insérées avec succès');
    }
    
    // Vérifier les tables créées
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
      if (err) {
        console.error('❌ Erreur lors de la vérification des tables:', err.message);
      } else {
        console.log('\n📋 Tables dans la base de données:');
        tables.forEach(table => {
          console.log('   -', table.name);
        });
      }
      
      // Compter les enregistrements par table
      const tablesToCount = ['users', 'classification_plan', 'documents'];
      let countCompleted = 0;
      
      console.log('\n📊 Statistiques:');
      tablesToCount.forEach(tableName => {
        db.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, row) => {
          if (!err) {
            console.log(`   - ${tableName}: ${row.count} enregistrement(s)`);
          }
          countCompleted++;
          
          if (countCompleted === tablesToCount.length) {
            db.close();
            console.log('\n🎉 Migration SQLite terminée avec succès!');
            console.log('💡 Vous pouvez maintenant démarrer le serveur avec: npm run dev');
          }
        });
      });
    });
  });
});