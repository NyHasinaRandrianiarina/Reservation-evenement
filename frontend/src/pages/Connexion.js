import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Connexion() {
  const [form, setForm] = useState({ email: '', mot_de_passe: '' });
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const { connexion } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      const { data } = await axios.post(`${API}/auth/connexion`, form);
      connexion(data.token, data.utilisateur);
      navigate('/');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="form-container">
      <h1 className="form-title">Connexion</h1>
      <p className="form-subtitle">Heureux de vous revoir !</p>

      {erreur && <div className="alert alert-danger">{erreur}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="jean@email.com"
          />
        </div>

        <div className="form-group">
          <label>Mot de passe</label>
          <input
            type="password"
            name="mot_de_passe"
            value={form.mot_de_passe}
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
          {chargement ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <p className="form-link">
        Pas encore de compte ? <Link to="/inscription">S'inscrire</Link>
      </p>
    </div>
  );
}

export default Connexion;