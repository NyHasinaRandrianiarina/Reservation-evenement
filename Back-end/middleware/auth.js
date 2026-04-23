const jwt = require('jsonwebtoken');

const verifierToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Accès refusé, token manquant' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.utilisateur = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token invalide ou expiré' });
  }
};

const verifierRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.utilisateur.role)) {
      return res.status(403).json({ message: 'Accès refusé : rôle insuffisant' });
    }
    next();
  };
};

module.exports = { verifierToken, verifierRole };