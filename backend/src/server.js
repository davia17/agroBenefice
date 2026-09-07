const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const exploitationRoutes = require('./routes/exploitationRoutes');
const parcelRoutes = require('./routes/parcelRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const parcelCampaignRoutes = require('./routes/parcelCampaignRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

connectDB();

const app = express();

app.use(express.json());
app.use(cors());

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/exploitation', exploitationRoutes);
app.use('/api/parcels', parcelRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/parcel-campaigns', parcelCampaignRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
  res.json({ message: "API AgroBénéfice opérationnelle" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});