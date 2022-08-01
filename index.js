import express from 'express';
import path from 'path';
import favicon from 'serve-favicon';

import { getNEO, getNEOs, getTodayNEOs, getStats } from './services/neo.js';

const app = express();

// Render static files
app.use(express.static('public'));
app.use(favicon('public/favicon.ico'));

// Set EJS as templating engine
app.set('view engine', 'ejs');

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3001;
}
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
});

/* --- ROUTES --- */

app.get('/', async (req, res) => {
  const data = await getTodayNEOs();
  const stats = await getStats();
  res.render('pages/today', { 
    // NEOs are nested underneath a date property on the JSON data
    near_earth_objects: Object.values(data.near_earth_objects)[0],
    stats: stats
  });
});

app.get('/browse/', async (req, res) => {
  const data = await getNEOs(0);
  const stats = await getStats();
  res.render('pages/browse', { 
    page: data.page,
    near_earth_objects: data.near_earth_objects,
    stats: stats
  });
});

app.get('/browse/:page', async (req, res) => {
  let page = 0;
  if (req.params['page'] !== undefined) {
    // Subtract 1 from page parameter. User facing pages are 1-based while
    // the NASA API is 0-based.
    page = Number(req.params['page']) - 1;

    if (page < 0) page = 0;
  }
  const data = await getNEOs(page);
  const stats = await getStats();
  res.render('pages/browse', { 
    page: data.page,
    near_earth_objects: data.near_earth_objects,
    stats: stats
  });
});

app.get('/neo/:id', async (req, res) => {
  if (req.params['id'] === undefined) return;
  let neoId = req.params['id'];
  const data = await getNEO(neoId)
  res.render('pages/neo-details', data);
});

app.get('/stats', async (req, res) => {
  const data = await getStats();
  res.render('pages/stats', data);
});