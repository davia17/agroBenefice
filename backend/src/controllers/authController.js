const User = require('../models/User');
const Exploitation = require('../models/Exploitation');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Inscription avec création automatique de l'exploitation
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, exploitationName, location } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return 
      res.status(400).json({ message: "Cet utilisateur existe déjà." });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role: role || 'AGRICULTEUR'
    });

    if (user) {
      // Création de l'exploitation liée au nouvel utilisateur
      await Exploitation.create({
        user: user._id,
        name: exploitationName || `Exploitation de ${user.name}`,
        location: location || 'Madagascar'
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: "Données utilisateur invalides." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Connexion 
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: "Email ou mot de passe incorrect." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };