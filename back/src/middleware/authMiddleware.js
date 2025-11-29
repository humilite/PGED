import jwt from 'jsonwebtoken';

// Configuration JWT
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  fallbackSecret: 'pged-jwt-secret-key-2024-secure-random-string-change-in-production',
  algorithms: ['HS256']
};

// Validation du token JWT
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN

  // Logs de débogage (à désactiver en production)
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔐 Middleware - Headers Authorization:', authHeader ? 'Present' : 'Missing');
    console.log('🔐 Middleware - Token extrait:', token ? `${token.substring(0, 15)}...` : 'NULL');
  }

  // Vérification de la présence du token
  if (!token) {
    console.log('❌ Middleware - Aucun token fourni');
    return res.status(401).json({ 
      success: false,
      error: 'Token d\'accès requis',
      code: 'MISSING_TOKEN'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || JWT_CONFIG.fallbackSecret;
    
    // Vérification et décodage du token
    const decoded = jwt.verify(token, secret, { algorithms: JWT_CONFIG.algorithms });
    
    // Log de succès
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Middleware - Token décodé:', { 
        id: decoded.id, 
        email: decoded.email, 
        role: decoded.role 
      });
    }

    // Ajout des informations utilisateur à la requête
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      is_active: decoded.is_active
    };

    next();
  } catch (error) {
    console.error('❌ Middleware - Erreur vérification token:', error.message);
    
    // Gestion des erreurs spécifiques
    let errorMessage = 'Token invalide';
    let statusCode = 403;
    let errorCode = 'INVALID_TOKEN';

    if (error.name === 'TokenExpiredError') {
      errorMessage = 'Token expiré';
      errorCode = 'TOKEN_EXPIRED';
      statusCode = 401; // 401 pour expiration pour permettre un refresh
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Token malformé';
      errorCode = 'MALFORMED_TOKEN';
    }

    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
      code: errorCode,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Middleware pour admin uniquement
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentification requise',
      code: 'AUTH_REQUIRED'
    });
  }

  if (req.user.role === 'admin') {
    next();
  } else {
    console.log(`❌ Accès admin refusé pour l'utilisateur: ${req.user.email}, rôle: ${req.user.role}`);
    return res.status(403).json({
      success: false,
      error: 'Accès réservé aux administrateurs',
      code: 'ADMIN_REQUIRED',
      currentRole: req.user.role
    });
  }
};

// Middleware pour gestionnaires et admins
export const requireManager = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentification requise',
      code: 'AUTH_REQUIRED'
    });
  }

  const allowedRoles = ['admin', 'gestionnaire', 'manager'];
  
  if (allowedRoles.includes(req.user.role)) {
    next();
  } else {
    console.log(`❌ Accès gestionnaire refusé pour: ${req.user.email}, rôle: ${req.user.role}`);
    return res.status(403).json({
      success: false,
      error: 'Accès réservé aux gestionnaires et administrateurs',
      code: 'MANAGER_REQUIRED',
      currentRole: req.user.role,
      allowedRoles: ['admin', 'gestionnaire']
    });
  }
};

// Middleware d'authentification optionnelle
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const secret = process.env.JWT_SECRET || JWT_CONFIG.fallbackSecret;
      const decoded = jwt.verify(token, secret, { algorithms: JWT_CONFIG.algorithms });
      
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        is_active: decoded.is_active
      };

      if (process.env.NODE_ENV !== 'production') {
        console.log('🔐 Optional Auth - Utilisateur authentifié:', req.user.email);
      }
    } catch (error) {
      // Token invalide, mais on continue sans user
      if (process.env.NODE_ENV !== 'production') {
        console.log('⚠️ Optional Auth - Token invalide, continuation sans authentification');
      }
    }
  }
  
  next();
};

// Middleware pour vérifier si l'utilisateur est actif
export const requireActiveUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentification requise',
      code: 'AUTH_REQUIRED'
    });
  }

  if (req.user.is_active === false) {
    return res.status(403).json({
      success: false,
      error: 'Compte utilisateur désactivé',
      code: 'ACCOUNT_DISABLED'
    });
  }

  next();
};

// Middleware combiné (admin + actif)
export const requireActiveAdmin = [authenticateToken, requireActiveUser, requireAdmin];

// Middleware combiné (gestionnaire + actif)
export const requireActiveManager = [authenticateToken, requireActiveUser, requireManager];

// Génération de token (utile pour les tests ou autres parties de l'application)
export const generateToken = (userData) => {
  const secret = process.env.JWT_SECRET || JWT_CONFIG.fallbackSecret;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      is_active: userData.is_active
    },
    secret,
    { expiresIn, algorithm: 'HS256' }
  );
};

// Vérification de la configuration JWT (pour le démarrage de l'application)
export const checkJWTConfig = () => {
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️  AVERTISSEMENT: JWT_SECRET non défini, utilisation du secret de développement');
    console.warn('⚠️  Pour la production, définir JWT_SECRET dans les variables d\'environnement');
    return false;
  }
  
  console.log('✅ Configuration JWT vérifiée');
  return true;
};