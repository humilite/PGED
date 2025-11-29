// authController.js - Version avec export par défaut
import jwt from 'jsonwebtoken';

// Configuration JWT (doit correspondre à authMiddleware.js)
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  fallbackSecret: 'pged-jwt-secret-key-2024-secure-random-string-change-in-production',
  algorithms: ['HS256']
};

const authController = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            console.log(`🔐 Tentative de connexion: ${email}`);

            const mockUsers = {
                'admin@dgrh.gov.ga': { 
                    id: 1, 
                    email: 'admin@dgrh.gov.ga', 
                    password: 'admin123', 
                    name: 'Administrateur', 
                    role: 'admin' 
                },
                'user@dgrh.gov.ga': { 
                    id: 2, 
                    email: 'user@dgrh.gov.ga', 
                    password: 'user123', 
                    name: 'Utilisateur', 
                    role: 'user' 
                }
            };

            const user = mockUsers[email];

            if (!user || user.password !== password) {
                return res.status(401).json({ 
                    success: false,
                    error: 'Identifiants incorrects' 
                });
            }

            const secret = process.env.JWT_SECRET || JWT_CONFIG.fallbackSecret;
            const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    name: user.name
                },
                secret,
                { expiresIn, algorithm: 'HS256' }
            );

            res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                },
                redirect: user.role === 'admin' ? '/admin-dashboard' : '/dashboard'
            });

        } catch (error) {
            console.error('Erreur connexion:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur serveur'
            });
        }
    },

    getProfile: async (req, res) => {
        try {
            // For mock users, get from token payload
            const user = req.user; // Assuming middleware sets req.user
            if (!user) {
                return res.status(404).json({ error: 'Utilisateur non trouvé' });
            }

            res.json({ user });
        } catch (error) {
            console.error('Erreur récupération profil:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur serveur'
            });
        }
    },

    refreshToken: async (req, res) => {
        try {
            // L'utilisateur est déjà authentifié via le middleware
            const user = req.user;

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Utilisateur non authentifié'
                });
            }

            const secret = process.env.JWT_SECRET || JWT_CONFIG.fallbackSecret;
            const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

            const newToken = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    name: user.name,
                    is_active: user.is_active
                },
                secret,
                { expiresIn, algorithm: 'HS256' }
            );

            console.log(`🔄 Token rafraîchi pour l'utilisateur: ${user.email}`);

            res.json({
                success: true,
                token: newToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            });

        } catch (error) {
            console.error('Erreur rafraîchissement token:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors du rafraîchissement du token'
            });
        }
    }
};

export default authController; // ← EXPORT PAR DÉFAUT
