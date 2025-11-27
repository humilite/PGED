import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Token d\'accès requis' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-fallback');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token invalide ou expiré' });
    }
};

export const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }
};

export const requireManager = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'gestionnaire')) {
        next();
    } else {
        return res.status(403).json({ error: 'Accès réservé aux gestionnaires et administrateurs' });
    }
};

export const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-fallback');
            req.user = decoded;
        } catch (error) {
            // Token invalide, mais on continue sans user
        }
    }
    next();
};