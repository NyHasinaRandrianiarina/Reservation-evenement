import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CarteEvenement from '../components/CarteEvenement';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Evenements() {
  const [evenements, setEvenements] = useState([]);
  const [filtres, setFiltres] = useState({ categorie: '', ville: '', date: '' });
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    chargerEvenements();
  }, [filtres]);

  const chargerEvenements = async () => {
    setChargement(true);
    try {
      const params = {};
      if (filtres.categorie) params.categorie = filtres.categorie;
      if (filtres.ville) params.ville = filtres.ville;
      if (filtres.date) params.date = filtres.date;
      const { data } = await axios.get(`${API}/evenements`, { params });
      setEvenements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  const handleFiltre = (e) => {
    setFiltres({ ...filtres, [e.target.name]: e.target.value });
  };

  return (
    <div className="container">
      <div className="section-header">
        <h1 className="section-titre">Tous les événements</h1>
        <span style={{ color: '#6B7280' }}>{evenements.length} événement(s)</span>
      </div>

      {/* Filtres */}
      <div className="filtres">
        <input
          type="text"
          name="ville"
          placeholder="🔍 Rechercher par ville..."
          value={filtres.ville}
          onChange={handleFiltre}
        />
        <input
          type="date"
          name="date"
          value={filtres.date}
          onChange={handleFiltre}
        />
        <select name="categorie" value={filtres.categorie} onChange={handleFiltre}>
          <option value="">Toutes les catégories</option>
          <option value="1">Concert</option>
          <option value="2">Conférence</option>
          <option value="3">Atelier</option>
          <option value="4">Festival</option>
          <option value="5">Sport</option>
          <option value="6">Autre</option>
        </select>
        {(filtres.categorie || filtres.ville || filtres.date) && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setFiltres({ categorie: '', ville: '', date: '' })}>
            Réinitialiser
          </button>
        )}
      </div>

      {/* Liste événements */}
      {chargement ? (
        <p style={{ textAlign: 'center', color: '#6B7280', marginTop: '3rem' }}>
          Chargement des événements...
        </p>
      ) : evenements.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6B7280', marginTop: '3rem' }}>
          Aucun événement trouvé.
        </p>
      ) : (
        <div className="evenements-grid">
          {evenements.map(e => (
            <CarteEvenement key={e.id} evenement={e} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Evenements;