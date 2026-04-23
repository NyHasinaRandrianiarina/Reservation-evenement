import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Accueil from './pages/Accueil';
import Evenements from './pages/Evenements';
import DetailEvenement from './pages/DetailEvenement';
import Inscription from './pages/Inscription';
import Connexion from './pages/Connexion';
import MesReservations from './pages/MesReservations';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/evenements" element={<Evenements />} />
          <Route path="/evenements/:id" element={<DetailEvenement />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/mes-reservations" element={
            <ProtectedRoute><MesReservations /></ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;