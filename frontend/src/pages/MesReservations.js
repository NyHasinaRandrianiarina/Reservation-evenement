import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function MesReservations() {
  const { token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    chargerReservations();
  }, []);

  const chargerReservations = async () => {
    try {
      const { data } = await axios.get(
        `${API}/reservations/mes-reservations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReservations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  const annuler = async (id) => {
    if (!window.confirm('Confirmer l\'annulation ?')) return;
    try {
      await axios.put(
        `${API}/reservations/${id}/annuler`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      chargerReservations();
    } catch (err) {
      alert('Erreur lors de l\'annulation');
    }
  };

  if (chargement) return (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
      Chargement...
    </div>
  );

  return (
    <div className="container">
      <h1 className="section-titre" style={{ marginBottom: '1.5rem' }}>
        Mes réservations
      </h1>

      {reservations.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '3rem',
          background: 'white', borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎫</p>
          <p style={{ color: '#6B7280', fontSize: '1.1rem' }}>
            Vous n'avez aucune réservation pour le moment.
          </p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Événement</th>
              <th>Date</th>
              <th>Lieu</th>
              <th>Places</th>
              <th>Statut</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600 }}>{r.titre}</td>
                <td>
                  {new Date(r.date_evenement).toLocaleDateString('fr-FR')}
                </td>
                <td>{r.lieu}, {r.ville}</td>
                <td>{r.nb_places_reservees}</td>
                <td>
                  <span className={`badge ${r.statut === 'confirmee'
                    ? 'badge-success' : 'badge-danger'}`}>
                    {r.statut === 'confirmee' ? 'Confirmée' : 'Annulée'}
                  </span>
                </td>
                <td>
                  {r.statut === 'confirmee' && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => annuler(r.id)}>
                      Annuler
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MesReservations;