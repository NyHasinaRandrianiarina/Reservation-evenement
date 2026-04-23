const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const evenementsRoutes = require('./routes/evenements');
const reservationsRoutes = require('./routes/reservations');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/evenements', evenementsRoutes);
app.use('/api/reservations', reservationsRoutes);

app.get('/', (req, res) => res.json({ message: 'API Réservation Événements OK' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));