require('dotenv').config();
const placekit = require('../../');

const pkSearch = placekit({
  appId: process.env.PLACEKIT_APP_ID,
  apiKey: process.env.PLACEKIT_API_KEY,
  options: {
    hitsPerPage: 5,
  },
});

const [query] = process.argv.slice(2);

(async () => {
  const res = await pkSearch(query || '');
  console.log(res);
})();