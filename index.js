import express from 'express';

import { getNEO, getNEOs, getTodayNEOs, getStats } from './services/neo.js';

const app = express();

// Render static files
app.use(express.static('public'));

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
  res.render('pages/home', { 
    // NEOs are nested underneath a date property on the JSON data
    near_earth_objects: Object.values(data.near_earth_objects)[0],
    stats: stats
  });
});

app.get('/browse/:page', async (req, res) => {
  let page = '0';
  if (req.params['page'] !== undefined) {
    page = req.params['page'];
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