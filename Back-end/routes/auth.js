const express = require('express');
const router = express.Router();
const { inscription, connexion, monProfil } = require('../controllers/authController');
const { verifierToken } = require('../middleware/auth');

router.post('/inscription', inscription);
router.post('/connexion', connexion);
router.get('/profil', verifierToken, monProfil);

module.exports = router;