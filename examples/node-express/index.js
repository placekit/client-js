require('dotenv').config();
const express = require('express');
const placekit = require('../../');

const pkClient = placekit({
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
  const results = await pkClient.search(req.body.query, {
    hitsPerPage: 5,
  });
  res.json(results.hits);
});

// Search for city only
app.post('/city', async (req, res) => {
  const results = await pkClient.search(req.body.query, {
    type: 'city',
    hitsPerPage: 2,
  });
  res.json(results.hits);
});

app.listen(app.get('port'), () => {
  console.log(`Example app listening on port ${app.get('port')}`);
});