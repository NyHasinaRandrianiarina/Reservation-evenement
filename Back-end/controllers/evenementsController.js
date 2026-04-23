const pool = require('../config/db');

const tousLesEvenements = async (req, res) => {
  try {
    const { categorie, ville, date } = req.query;
    let query = `
      SELECT e.*, c.nom AS categorie_nom,
             u.nom AS organisateur_nom, u.prenom AS organisateur_prenom
      FROM evenements e
      JOIN categories c ON e.id_categorie = c.id
      JOIN utilisateurs u ON e.id_organisateur = u.id
      WHERE e.statut = 'actif'
    `;
    const params = [];
    if (categorie) { query += ' AND e.id_categorie = ?'; params.push(categorie); }
    if (ville) { query += ' AND e.ville LIKE ?'; params.push(`%${ville}%`); }
    if (date) { query += ' AND DATE(e.date_evenement) = ?'; params.push(date); }
    query += ' ORDER BY e.date_evenement ASC';

    const [evenements] = await pool.query(query, params);
    res.json(evenements);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

const unEvenement = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.*, c.nom AS categorie_nom,
             u.nom AS organisateur_nom, u.prenom AS organisateur_prenom
      FROM evenements e
      JOIN categories c ON e.id_categorie = c.id
      JOIN utilisateurs u ON e.id_organisateur = u.id
      WHERE e.id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Événement non trouvé' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const creerEvenement = async (req, res) => {
  try {
    const { titre, description, date_evenement, heure, lieu, ville,
            prix, nb_places_total, image_url, id_categorie } = req.body;
    if (!titre || !date_evenement || !lieu || !nb_places_total || !id_categorie)
      return res.status(400).json({ message: 'Champs obligatoires manquants' });

    const [result] = await pool.query(`
      INSERT INTO evenements
        (titre, description, date_evenement, heure, lieu, ville, prix,
         nb_places_total, nb_places_restantes, image_url, id_organisateur, id_categorie)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [titre, description, date_evenement, heure, lieu, ville,
        prix || 0, nb_places_total, nb_places_total, image_url,
        req.utilisateur.id, id_categorie]);

    res.status(201).json({ message: 'Événement créé avec succès', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

const modifierEvenement = async (req, res) => {
  try {
    const { titre, description, date_evenement, heure, lieu,
            ville, prix, image_url, id_categorie } = req.body;
    await pool.query(`
      UPDATE evenements
      SET titre=?, description=?, date_evenement=?, heure=?, lieu=?,
          ville=?, prix=?, image_url=?, id_categorie=?
      WHERE id=? AND id_organisateur=?
    `, [titre, description, date_evenement, heure, lieu,
        ville, prix, image_url, id_categorie,
        req.params.id, req.utilisateur.id]);
    res.json({ message: 'Événement modifié avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const supprimerEvenement = async (req, res) => {
  try {
    await pool.query(
      "UPDATE evenements SET statut = 'annule' WHERE id = ? AND id_organisateur = ?",
      [req.params.id, req.utilisateur.id]
    );
    res.json({ message: 'Événement supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { tousLesEvenements, unEvenement, creerEvenement, modifierEvenement, supprimerEvenement };