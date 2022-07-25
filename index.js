const path = require('path');
const express = require('express');
const ejs = require('ejs');
const app = express();

// Render static files
app.use(express.static('public'));

// Set EJS as templating engine
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  res.render('pages/home', { name: 'Dan' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});