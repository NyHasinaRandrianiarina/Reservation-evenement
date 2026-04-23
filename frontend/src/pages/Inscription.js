import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Inscription() {
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '',
    mot_de_passe: '', confirm: ''
  });
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [chargement, setChargement] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    if (form.mot_de_passe !== form.confirm)
      return setErreur('Les mots de passe ne correspondent pas');
    if (form.mot_de_passe.length < 6)
      return setErreur('Le mot de passe doit faire au moins 6 caractères');

    setChargement(true);
    try {
      await axios.post(`${API}/auth/inscription`, {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        mot_de_passe: form.mot_de_passe
      });
      setSucces('Inscription réussie ! Redirection...');
      setTimeout(() => navigate('/connexion'), 1500);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="form-container">
      <h1 className="form-title">Créer un compte</h1>
      <p className="form-subtitle">Rejoignez EventBook gratuitement</p>

      {erreur && <div className="alert alert-danger">{erreur}</div>}
      {succes && <div className="alert alert-success">{succes}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Prénom</label>
            <input
              type="text" name="prenom"
              value={form.prenom}
              onChange={handleChange}
              required
              placeholder="Jean"
            />
          </div>
          <div className="form-group">
            <label>Nom</label>
            <input
              type="text" name="nom"
              value={form.nom}
              onChange={handleChange}
              required
              placeholder="Rakoto"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email" name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="jean@email.com"
          />
        </div>

        <div className="form-group">
          <label>Mot de passe</label>
          <input
            type="password" name="mot_de_passe"
            value={form.mot_de_passe}
            onChange={handleChange}
            required
            placeholder="••••••••"
          />
        </div>

        <div className="form-group">
          <label>Confirmer le mot de passe</label>
          <input
            type="password" name="confirm"
            value={form.confirm}
            onChange={handleChange}
            required
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.85rem' }}
          disabled={chargement}>
          {chargement ? 'Inscription...' : 'Créer mon compte'}
        </button>
      </form>

      <p className="form-link">
        Déjà un compte ? <Link to="/connexion">Se connecter</Link>
      </p>
    </div>
  );
}

export default Inscription;