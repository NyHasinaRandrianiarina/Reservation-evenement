const pool = require('../config/db');

const creerReservation = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { id_evenement, nb_places_reservees = 1 } = req.body;

    const [evenements] = await conn.query(
      "SELECT * FROM evenements WHERE id = ? AND statut = 'actif' FOR UPDATE",
      [id_evenement]
    );
    if (evenements.length === 0)
      return res.status(404).json({ message: 'Événement non trouvé' });

    if (evenements[0].nb_places_restantes < nb_places_reservees)
      return res.status(400).json({ message: 'Pas assez de places disponibles' });

    await conn.query(
      'INSERT INTO reservations (id_utilisateur, id_evenement, nb_places_reservees) VALUES (?, ?, ?)',
      [req.utilisateur.id, id_evenement, nb_places_reservees]
    );
    await conn.query(
      'UPDATE evenements SET nb_places_restantes = nb_places_restantes - ? WHERE id = ?',
      [nb_places_reservees, id_evenement]
    );

    await conn.commit();
    res.status(201).json({ message: 'Réservation confirmée !' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  } finally {
    conn.release();
  }
};

const mesReservations = async (req, res) => {
  try {
    const [reservations] = await pool.query(`
      SELECT r.*, e.titre, e.date_evenement, e.lieu, e.ville, e.image_url
      FROM reservations r
      JOIN evenements e ON r.id_evenement = e.id
      WHERE r.id_utilisateur = ?
      ORDER BY r.date_reservation DESC
    `, [req.utilisateur.id]);
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const annulerReservation = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [reservations] = await conn.query(
      "SELECT * FROM reservations WHERE id = ? AND id_utilisateur = ? AND statut = 'confirmee'",
      [req.params.id, req.utilisateur.id]
    );
    if (reservations.length === 0)
      return res.status(404).json({ message: 'Réservation non trouvée' });

    const { nb_places_reservees, id_evenement } = reservations[0];
    await conn.query("UPDATE reservations SET statut = 'annulee' WHERE id = ?", [req.params.id]);
    await conn.query(
      'UPDATE evenements SET nb_places_restantes = nb_places_restantes + ? WHERE id = ?',
      [nb_places_reservees, id_evenement]
    );

    await conn.commit();
    res.json({ message: 'Réservation annulée avec succès' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Erreur serveur' });
  } finally {
    conn.release();
  }
};

module.exports = { creerReservation, mesReservations, annulerReservation };