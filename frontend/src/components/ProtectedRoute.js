import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, roles }) {
  const { utilisateur, chargement } = useAuth();

  if (chargement) return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      Chargement...
    </div>
  );

  if (!utilisateur) return <Navigate to="/connexion" replace />;

  if (roles && !roles.includes(utilisateur.role))
    return <Navigate to="/" replace />;

  return children;
}

export default ProtectedRoute;