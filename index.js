import express, { query } from 'express';
import url from 'url';

import { getNEOs } from './services/neo.js';
import { getStats } from './services/stats.js';

const app = express();

// Render static files
app.use(express.static('public'));

// Set EJS as templating engine
app.set('view engine', 'ejs');



const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});

/* --- ROUTES --- */

app.get('/', async (req, res) => {
  const data = await getNEOs(0);
  res.render('pages/home', data);
});

app.get('/:page', async (req, res) => {
  let page = '0';
  if (req.params['page'] !== undefined) {
    page = req.params['page'];
  }
  console.log(page);
  const data = await getNEOs(page);
  res.render('pages/home', data);
});

app.get('/stats', async (req, res) => {
  const data = await getStats();
  res.render('pages/neo-stats', data);
});