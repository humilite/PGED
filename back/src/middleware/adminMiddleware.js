export const adminMiddleware = (req, res, next) => {
  const user = req.user;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Accès refusé. Droits administrateur requis.' 
    });
  }
  
  next();
};