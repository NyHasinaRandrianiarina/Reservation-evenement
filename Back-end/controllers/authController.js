const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const inscription = async (req, res) => {
  try {
    const { nom, prenom, email, mot_de_passe } = req.body;
    if (!nom || !prenom || !email || !mot_de_passe)
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });

    const [existant] = await pool.query('SELECT id FROM utilisateurs WHERE email = ?', [email]);
    if (existant.length > 0)
      return res.status(409).json({ message: 'Email déjà utilisé' });

    const hash = await bcrypt.hash(mot_de_passe, 10);
    const [result] = await pool.query(
      'INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe) VALUES (?, ?, ?, ?)',
      [nom, prenom, email, hash]
    );

    res.status(201).json({ message: 'Inscription réussie', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

const connexion = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    if (!email || !mot_de_passe)
      return res.status(400).json({ message: 'Email et mot de passe requis' });

    const [users] = await pool.query('SELECT * FROM utilisateurs WHERE email = ?', [email]);
    if (users.length === 0)
      return res.status(401).json({ message: 'Identifiants incorrects' });

    const utilisateur = users[0];
    if (!utilisateur.actif)
      return res.status(403).json({ message: 'Compte désactivé' });

    const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
    if (!motDePasseValide)
      return res.status(401).json({ message: 'Identifiants incorrects' });

    const token = jwt.sign(
      { id: utilisateur.id, email: utilisateur.email, role: utilisateur.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

const monProfil = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, nom, prenom, email, role, date_inscription FROM utilisateurs WHERE id = ?',
      [req.utilisateur.id]
    );
    if (users.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { inscription, connexion, monProfil };