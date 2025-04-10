require('dotenv').config(); 

const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');

const app = express();

connectDB();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', listingRoutes);

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
