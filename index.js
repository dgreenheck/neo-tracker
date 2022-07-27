import express, { query } from 'express';

import { getNEO, getNEOs } from './services/neo.js';
import { getStats } from './services/stats.js';

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
  const data = await getNEOs(0);
  res.render('pages/home', data);
});

app.get('/:page', async (req, res) => {
  let page = '0';
  if (req.params['page'] !== undefined) {
    page = req.params['page'];
  }
  const neos = await getNEOs(page);
  res.render('pages/home', neos);
});

app.get('/neo/:id', async (req, res) => {
  if (req.params['id'] === undefined) return;

  let neoId = req.params['id'];
  let startDateString = req.query['startDate'];
  let endDateString = req.query['endDate'];

  const neo = await getNEO(neoId);

  res.render('pages/neo-details', { 
    neo: neo, 
    startDateString: startDateString,
    endDateString: endDateString
  });
});

app.get('/stats', async (req, res) => {
  const data = await getStats();
  res.render('pages/stats', data);
});