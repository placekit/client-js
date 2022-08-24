require('dotenv').config();
const express = require('express');
const placekit = require('../../');

const pk = placekit({
  appId: process.env.PLACEKIT_APP_ID,
  apiKey: process.env.PLACEKIT_API_KEY,
});

const app = express();
app.set('port', process.env.PORT || 3000);
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Search for addresses
app.post('/address', async (req, res) => {
  const results = await pk.search(req.body.query, {
    resultsPerPage: 5,
  });
  res.json(results.results);
});

// Search for city only
app.post('/city', async (req, res) => {
  const results = await pk.search(req.body.query, {
    type: 'city',
    resultsPerPage: 2,
  });
  res.json(results.results);
});

app.listen(app.get('port'), () => {
  console.log(`Example app listening on port ${app.get('port')}`);
});