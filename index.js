import express from 'express';
import path from 'path';

import { getStats } from './services/stats.js';

const app = express();

// Render static files
app.use(express.static('public'));

// Set EJS as templating engine
app.set('view engine', 'ejs');

// Routes
app.get('/', async (req, res) => {
  const data = await getStats();
  res.render('pages/neo-stats', data);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});