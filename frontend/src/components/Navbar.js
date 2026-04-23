import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { utilisateur, deconnexion } = useAuth();
  const navigate = useNavigate();

  const handleDeconnexion = () => {
    deconnexion();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">🎟️ HasinaEvent's</Link>
      <div className="navbar-links">
        <Link to="/evenements">Événements</Link>
        {utilisateur ? (
          <>
            <Link to="/mes-reservations">Mes réservations</Link>
            {(utilisateur.role === 'organisateur' || utilisateur.role === 'admin') && (
              <Link to="/organisateur">Dashboard</Link>
            )}
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
              {utilisateur.prenom}
            </span>
            <button onClick={handleDeconnexion}
              className="btn btn-outline"
              style={{ color: 'white', borderColor: 'white' }}>
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link to="/connexion">Connexion</Link>
            <Link to="/inscription" className="btn btn-primary">
              S'inscrire
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;