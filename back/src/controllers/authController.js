// authController.js - Version avec export par défaut
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.js';

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

            // Rechercher l'utilisateur dans la base de données
            const user = await User.findByEmail(email);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Identifiants incorrects'
                });
            }

            // Vérifier si le compte est actif
            if (!user.is_active) {
                return res.status(401).json({
                    success: false,
                    error: 'Compte désactivé'
                });
            }

            // Vérifier le mot de passe avec bcrypt ou en clair (pour compatibilité temporaire)
            let isPasswordValid = false;
            try {
                isPasswordValid = await bcrypt.compare(password, user.password);
            } catch (error) {
                // Si bcrypt échoue, vérifier en clair (mot de passe non hashé)
                isPasswordValid = (user.password === password);
            }

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Identifiants incorrects'
                });
            }

            // Mettre à jour la dernière connexion
            await User.updateLastLogin(user.id);

            const secret = process.env.JWT_SECRET || JWT_CONFIG.fallbackSecret;
            const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    name: `${user.first_name} ${user.last_name}`,
                    is_active: user.is_active
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
                    name: `${user.first_name} ${user.last_name}`,
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
            // Extraire le token du header Authorization
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];

            if (!token) {
                return res.status(401).json({
                    success: false,
                    error: 'Token requis'
                });
            }

            // Décoder le token (même si expiré)
            const decoded = jwt.decode(token);

            if (!decoded) {
                return res.status(401).json({
                    success: false,
                    error: 'Token invalide'
                });
            }

            // Générer un nouveau token
            const secret = process.env.JWT_SECRET || JWT_CONFIG.fallbackSecret;
            const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
            const newToken = jwt.sign(
                {
                    id: decoded.id,
                    email: decoded.email,
                    role: decoded.role,
                    name: decoded.name,
                    is_active: decoded.is_active
                },
                secret,
                { expiresIn, algorithm: 'HS256' }
            );

            console.log(`🔄 Token rafraîchi pour l'utilisateur: ${decoded.email}`);

            res.json({
                success: true,
                token: newToken,
                user: {
                    id: decoded.id,
                    email: decoded.email,
                    name: decoded.name,
                    role: decoded.role
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
