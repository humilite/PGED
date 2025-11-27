// authController.js - Version avec export par défaut
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-fallback';

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

            const token = jwt.sign(
                { 
                    id: user.id, 
                    email: user.email, 
                    role: user.role, 
                    name: user.name 
                },
                JWT_SECRET,
                { expiresIn: '24h' }
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
    }
};

export default authController; // ← EXPORT PAR DÉFAUT
