import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';

import { connectDB } from './config/database.js';

// Import des routes
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import classificationRoutes from './routes/classificationRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/classifications', classificationRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'GED DGRH API is running',
    timestamp: new Date().toISOString()
  });
});

// Route de test de base de données
app.get('/api/test-db', async (req, res) => {
  try {
    await connectDB();
    res.json({ status: 'OK', message: 'Connexion DB réussie' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Middleware de gestion d'erreurs
app.use((error, req, res, next) => {
  console.error('Erreur serveur:', error);
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Une erreur est survenue'
  });
});

// Démarrer le serveur
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  
  // Tester la connexion à la base de données
  await connectDB();
});
