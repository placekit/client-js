require('dotenv').config();
const express = require('express');
const placekit = require('@placekit/client-js');

const pk = placekit(process.env.PLACEKIT_API_KEY);

const app = express();
app.set('port', process.env.PORT || 3000);
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Search for addresses
app.post('/address', async (req, res) => {
  const results = await pk.search(req.body.query, {
    maxResults: 5,
    countries: ['fr'],
  });
  res.json(results.results);
});

// Search for city only
app.post('/city', async (req, res) => {
  const results = await pk.search(req.body.query, {
    type: 'city',
    maxResults: 2,
  });
  res.json(results.results);
});

app.listen(app.get('port'), () => {
  console.log(`Example app listening on port ${app.get('port')}`);
});