require('dotenv').config();
const placekit = require('../../src/index.js');

const pk = placekit({
  appId: process.env.PLACEKIT_APP_ID,
  apiKey: process.env.PLACEKIT_API_KEY,
  options: {
    resultsPerPage: 5,
  },
});

const [query] = process.argv.slice(2);

(async () => {
  const res = await pk.search(query || '').catch(console.error);
  console.log(res);
})();