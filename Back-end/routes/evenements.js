const express = require('express');
const router = express.Router();
const { verifierToken, verifierRole } = require('../middleware/auth');
const {
  tousLesEvenements, unEvenement, creerEvenement,
  modifierEvenement, supprimerEvenement
} = require('../controllers/evenementsController');

router.get('/', tousLesEvenements);
router.get('/:id', unEvenement);
router.post('/', verifierToken, verifierRole('organisateur', 'admin'), creerEvenement);
router.put('/:id', verifierToken, verifierRole('organisateur', 'admin'), modifierEvenement);
router.delete('/:id', verifierToken, verifierRole('organisateur', 'admin'), supprimerEvenement);

module.exports = router;