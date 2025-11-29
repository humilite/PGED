const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pged_users';

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    return false;
  }
};

module.exports = connectDB;
