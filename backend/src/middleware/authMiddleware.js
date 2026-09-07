const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attacher l'utilisateur à la requête (sans le mot de passe)
      req.user = await User.findById(decoded.id).select('-passwordHash');
      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Non autorisé, token invalide.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Non autorisé, aucun token fourni.' });
  }
};

module.exports = { protect };