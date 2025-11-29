import { connectDB } from './back/src/config/database.js';

async function testConnection() {
  try {
    await connectDB();
    console.log('✅ Connexion à la base de données réussie');
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }
}

testConnection();
