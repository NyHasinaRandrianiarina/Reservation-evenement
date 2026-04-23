import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [utilisateur, setUtilisateur] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const userSauvegarde = localStorage.getItem('utilisateur');
    if (token && userSauvegarde) {
      setUtilisateur(JSON.parse(userSauvegarde));
    }
    setChargement(false);
  }, [token]);

  const connexion = (tokenRecu, userRecu) => {
    localStorage.setItem('token', tokenRecu);
    localStorage.setItem('utilisateur', JSON.stringify(userRecu));
    setToken(tokenRecu);
    setUtilisateur(userRecu);
  };

  const deconnexion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    setToken(null);
    setUtilisateur(null);
  };

  return (
    <AuthContext.Provider value={{ utilisateur, token, connexion, deconnexion, chargement }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);