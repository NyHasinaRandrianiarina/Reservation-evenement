const express = require('express');
const router = express.Router();
const { verifierToken } = require('../middleware/auth');
const {
  creerReservation, mesReservations, annulerReservation
} = require('../controllers/reservationsController');

router.post('/', verifierToken, creerReservation);
router.get('/mes-reservations', verifierToken, mesReservations);
router.put('/:id/annuler', verifierToken, annulerReservation);

module.exports = router;