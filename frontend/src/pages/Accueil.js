import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CarteEvenement from '../components/CarteEvenement';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Accueil() {
  const [evenements, setEvenements] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    axios.get(`${API}/evenements`)
      .then(r => setEvenements(r.data.slice(0, 3)))
      .catch(err => console.error(err))
      .finally(() => setChargement(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <div className="hero">
        <h1>Découvrez les meilleurs événements</h1>
        <p>Réservez vos places en quelques clics</p>
        <div className="hero-search">
          <input type="text" placeholder="Rechercher un événement..." />
          <Link to="/evenements" className="btn btn-primary">
            Rechercher
          </Link>
        </div>
      </div>

      {/* Événements à la une */}
      <div className="container">
        <div className="section-header">
          <h2 className="section-titre">Événements à la une</h2>
          <Link to="/evenements" className="btn btn-outline">
            Voir tout
          </Link>
        </div>

        {chargement ? (
          <p style={{ textAlign: 'center', color: '#6B7280' }}>
            Chargement...
          </p>
        ) : evenements.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6B7280' }}>
            Aucun événement disponible pour le moment.
          </p>
        ) : (
          <div className="evenements-grid">
            {evenements.map(e => (
              <CarteEvenement key={e.id} evenement={e} />
            ))}
          </div>
        )}

        {/* Catégories */}
        <div style={{ marginTop: '3rem' }}>
          <h2 className="section-titre" style={{ marginBottom: '1.5rem' }}>
            Parcourir par catégorie
          </h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {['Concert', 'Conférence', 'Atelier', 'Festival', 'Sport'].map(cat => (
              <Link key={cat} to={`/evenements`}
                style={{
                  padding: '0.8rem 1.5rem',
                  background: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  textDecoration: 'none',
                  color: '#1E3A5F',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}>
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Accueil;