const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token d\'authentification manquant'
      });
    }

    const token = authHeader.substring(7); // Supprimer 'Bearer '

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Vérifier si l'utilisateur existe toujours
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Compte désactivé'
      });
    }

    // Attacher l'utilisateur à la requête
    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };

    next();
  } catch (error) {
    console.error('Erreur middleware auth:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token invalide'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expiré'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
};

module.exports = authMiddleware;
