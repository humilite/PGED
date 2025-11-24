// database/init.js
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Créer le dossier database s'il n'existe pas
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Chemin de la base de données
const dbPath = path.join(__dirname, 'pged.db');
console.log('📁 Création de la base de données:', dbPath);

// Créer la connexion à la base de données
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erreur de connexion:', err.message);
    } else {
        console.log('✅ Connecté à la base de données SQLite');
    }
});

// Lire le fichier schema.sql
const schemaPath = path.join(__dirname, 'schema.sql');

if (!fs.existsSync(schemaPath)) {
    console.error('❌ Fichier schema.sql non trouvé:', schemaPath);
    process.exit(1);
}

const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
console.log('📖 Lecture du schema SQL...');

// Exécuter le schema SQL
db.exec(schemaSQL, (err) => {
    if (err) {
        console.error('❌ Erreur lors de l\'exécution du schema:', err);
    } else {
        console.log('✅ Base de données initialisée avec succès!');
        console.log('📊 Fichier de base de données:', dbPath);
        
        // Vérifier les tables créées
        db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
            if (err) {
                console.error('❌ Erreur lors de la vérification des tables:', err);
            } else {
                console.log('📋 Tables créées:');
                tables.forEach(table => {
                    console.log('   -', table.name);
                });
            }
            db.close();
        });
    }
});