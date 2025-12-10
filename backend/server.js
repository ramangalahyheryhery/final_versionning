const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const API_KEY = process.env.API_KEY;


// Routes API
app.get('/api/weather/:city', async (req, res) => {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${req.params.city}&appid=${API_KEY}&units=metric&lang=fr`;
        const response = await axios.get(url);
        res.json(response.data);
    } catch {
        res.status(404).json({ error: 'Ville non trouvée' });
    }
});

app.get('/api/forecast/:city', async (req, res) => {
    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${req.params.city}&appid=${API_KEY}&units=metric&lang=fr`;
        const response = await axios.get(url);
        res.json(response.data);
    } catch {
        res.status(404).json({ error: 'Erreur prévisions' });
    }
});

app.get('/', (req, res) => {
  res.send('Backend operationnel');
});


app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Backend ready on port ${PORT}`);
});


