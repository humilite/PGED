import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './src/config/database.js';

// Importer les routes
import authRoutes from './src/routes/authRoutes.js';
import documentRoutes from './src/routes/documentRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import classificationRoutes from './src/routes/classificationRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';

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

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classifications', classificationRoutes);
app.use('/api/admin', adminRoutes);

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error('💥 Erreur serveur:', err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Connexion à PostgreSQL et démarrage du serveur
const startServer = async () => {
  // Test de connexion à PostgreSQL
  try {
    const connected = await connectDB();
    if (connected) {
      console.log('✅ Connexion à PostgreSQL réussie');
    } else {
      console.error('❌ Erreur de connexion à PostgreSQL');
      console.warn('⚠️  Mode sans base de données activé');
      console.warn('⚠️  Certaines fonctionnalités peuvent ne pas fonctionner');
    }
  } catch (error) {
    console.error('❌ Erreur de connexion à PostgreSQL:', error.message);
    console.warn('⚠️  Mode sans base de données activé');
    console.warn('⚠️  Certaines fonctionnalités peuvent ne pas fonctionner');
  }

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
    console.log(`   📍 GET  http://localhost:${PORT}/api/documents/dashboard/stats`);
    console.log(`   📍 GET  http://localhost:${PORT}/api/classifications`);
    console.log(`   📍 GET  http://localhost:${PORT}/api/admin/stats`);
    console.log(`   📍 GET  http://localhost:${PORT}/api/users`);
    console.log('');
    console.log('🔐 Comptes de test:');
    console.log('   👤 Admin: admin@dgrh.gov.ga / admin123');
    console.log('   👤 User:  user@dgrh.gov.ga / user123');
    console.log('   👤 Gestionnaire: gestionnaire@dgrh.gov.ga / gest123');
    console.log('');
  });
};

startServer();
