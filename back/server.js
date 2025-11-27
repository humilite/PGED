import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration des paths ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques pour les uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes de base
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Backend PGED est en marche !',
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Route de test de l'API
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'PGED Backend',
    timestamp: new Date().toISOString()
  });
});

// Route de test d'authentification temporaire
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔐 Tentative de connexion:', email);
  
  // Simulation d'authentification
  if (email === 'admin@dgrh.gov.ga' && password === 'admin123') {
    res.json({
      token: 'mock-jwt-token-for-development',
      user: {
        id: 1,
        email: 'admin@dgrh.gov.ga',
        firstName: 'Admin',
        lastName: 'System',
        role: 'admin'
      }
    });
  } else if (email === 'user@dgrh.gov.ga' && password === 'user123') {
    res.json({
      token: 'mock-jwt-token-for-development',
      user: {
        id: 2,
        email: 'user@dgrh.gov.ga',
        firstName: 'Utilisateur',
        lastName: 'Test',
        role: 'user'
      }
    });
  } else {
    res.status(401).json({ error: 'Identifiants invalides' });
  }
});

// Route pour récupérer les classifications
app.get('/api/classifications', (req, res) => {
  const classifications = [
    { id: 1, code: 'RH', name: 'Ressources Humaines', description: 'Catégorie principale RH', path: 'RH' },
    { id: 2, code: 'RH-CTR', name: 'Contrats', description: 'Contrats de travail', path: 'RH/RH-CTR' },
    { id: 3, code: 'RH-DOS', name: 'Dossiers Personnel', description: 'Dossiers individuels', path: 'RH/RH-DOS' },
    { id: 4, code: 'RH-RAP', name: 'Rapports', description: 'Rapports d activité', path: 'RH/RH-RAP' },
    { id: 5, code: 'RH-POL', name: 'Politiques', description: 'Politiques RH', path: 'RH/RH-POL' }
  ];
  
  res.json({ classifications });
});

// Route pour les statistiques du dashboard
app.get('/api/dashboard/stats', (req, res) => {
  const stats = {
    totalDocuments: 124,
    myDocuments: 45,
    recentDocuments: [
      { id: 1, title: 'Contrat CDI 2025', index_alphanum: 'RH-CTR-2025-0001', created_at: '2025-01-15' },
      { id: 2, title: 'Rapport annuel 2024', index_alphanum: 'RH-RAP-2024-0123', created_at: '2025-01-14' },
      { id: 3, title: 'Politique télétravail', index_alphanum: 'RH-POL-2025-0001', created_at: '2025-01-13' }
    ]
  };
  
  res.json(stats);
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error('💥 Erreur serveur:', err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log('');
  console.log('🎉 ========================================');
  console.log('🚀  Serveur PGED démarré avec succès!');
  console.log(`📡  URL: http://localhost:${PORT}`);
  console.log('========================================');
  console.log('');
  console.log('📋 Points de terminaison disponibles:');
  console.log(`   📍 GET  http://localhost:${PORT}/`);
  console.log(`   📍 GET  http://localhost:${PORT}/api/health`);
  console.log(`   📍 POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   📍 GET  http://localhost:${PORT}/api/classifications`);
  console.log(`   📍 GET  http://localhost:${PORT}/api/dashboard/stats`);
  console.log('');
  console.log('🔐 Comptes de test:');
  console.log('   👤 Admin: admin@dgrh.gov.ga / admin123');
  console.log('   👤 User:  user@dgrh.gov.ga / user123');
  console.log('');
});