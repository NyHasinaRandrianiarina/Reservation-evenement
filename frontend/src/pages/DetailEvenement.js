import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function DetailEvenement() {
  const { id } = useParams();
  const { utilisateur, token } = useAuth();
  const navigate = useNavigate();
  const [evenement, setEvenement] = useState(null);
  const [places, setPlaces] = useState(1);
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  useEffect(() => {
    axios.get(`${API}/evenements/${id}`)
      .then(r => setEvenement(r.data))
      .catch(() => navigate('/evenements'));
  }, [id]);

  const reserver = async () => {
    if (!utilisateur) return navigate('/connexion');
    setErreur('');
    setMessage('');
    setChargement(true);
    try {
      await axios.post(
        `${API}/reservations`,
        { id_evenement: id, nb_places_reservees: places },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`✅ Réservation confirmée pour ${places} place(s) !`);
      setEvenement(prev => ({
        ...prev,
        nb_places_restantes: prev.nb_places_restantes - places
      }));
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la réservation');
    } finally {
      setChargement(false);
    }
  };

  if (!evenement) return (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
      Chargement...
    </div>
  );

  const date = new Date(evenement.date_evenement).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      {evenement.image_url && (
        <img src={evenement.image_url} alt={evenement.titre}
          style={{
            width: '100%', height: '350px',
            objectFit: 'cover', borderRadius: '12px',
            marginBottom: '2rem'
          }}
        />
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
        <span className="badge badge-info">{evenement.categorie_nom}</span>
        <span className={`badge ${evenement.nb_places_restantes > 0 ? 'badge-success' : 'badge-danger'}`}>
          {evenement.nb_places_restantes > 0
            ? `${evenement.nb_places_restantes} places`
            : 'Complet'}
        </span>
      </div>

      <h1 style={{ fontSize: '2rem', fontWeight: '700',
        color: '#1E3A5F', marginBottom: '1rem' }}>
        {evenement.titre}
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column',
        gap: '0.5rem', color: '#6B7280', marginBottom: '1.5rem' }}>
        <span>📅 {date} à {evenement.heure?.slice(0, 5)}</span>
        <span>📍 {evenement.lieu}, {evenement.ville}</span>
        <span>👤 Organisé par {evenement.organisateur_prenom} {evenement.organisateur_nom}</span>
        <span style={{ color: '#1E3A5F', fontWeight: '700', fontSize: '1.2rem' }}>
          💰 {evenement.prix == 0 ? 'Gratuit' : `${evenement.prix} Ar`}
        </span>
      </div>

      <p style={{ lineHeight: '1.8', marginBottom: '2rem', color: '#374151' }}>
        {evenement.description}
      </p>

      {message && <div className="alert alert-success">{message}</div>}
      {erreur && <div className="alert alert-danger">{erreur}</div>}

      {evenement.nb_places_restantes > 0 && !message && (
        <div style={{
          background: 'white', padding: '1.5rem',
          borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#1E3A5F' }}>
            Réserver des places
          </h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label>Nombre de places :</label>
            <input
              type="number" min="1"
              max={evenement.nb_places_restantes}
              value={places}
              onChange={e => setPlaces(Number(e.target.value))}
              style={{
                width: '80px', padding: '0.5rem',
                border: '1.5px solid #E5E7EB', borderRadius: '8px'
              }}
            />
            <button
              className="btn btn-primary"
              onClick={reserver}
              disabled={chargement}>
              {chargement ? 'Réservation...'
                : `Réserver (${evenement.prix == 0
                  ? 'Gratuit'
                  : `${evenement.prix * places} Ar`})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetailEvenement;