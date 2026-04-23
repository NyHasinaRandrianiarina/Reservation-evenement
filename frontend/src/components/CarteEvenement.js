import React from 'react';
import { Link } from 'react-router-dom';

function CarteEvenement({ evenement }) {
  const { id, titre, date_evenement, lieu, ville, prix, 
          nb_places_restantes, image_url, categorie_nom } = evenement;

  const dateFormatee = new Date(date_evenement).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="carte-evenement">
      {image_url
        ? <img src={image_url} alt={titre} />
        : <div className="carte-img-placeholder">🎉</div>
      }
      <div className="carte-body">
        <div className="carte-categorie">{categorie_nom}</div>
        <div className="carte-titre">{titre}</div>
        <div className="carte-info">📅 {dateFormatee}</div>
        <div className="carte-info">📍 {lieu}, {ville}</div>
        <div className="carte-footer">
          <span className="carte-prix">
            {prix == 0 ? 'Gratuit' : `${prix} Ar`}
          </span>
          <span className="carte-places">
            {nb_places_restantes > 0
              ? `${nb_places_restantes} places restantes`
              : <span style={{ color: '#EF4444', fontWeight: 600 }}>
                  Complet
                </span>
            }
          </span>
        </div>
        <Link to={`/evenements/${id}`}
          className="btn btn-primary"
          style={{ display: 'block', textAlign: 'center', marginTop: '1rem' }}>
          Voir les détails
        </Link>
      </div>
    </div>
  );
}

export default CarteEvenement;