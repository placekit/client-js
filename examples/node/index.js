require('dotenv').config({ });
const placekit = require('../../src/index.js');

const pkSearch = placekit({
  appId: process.env.PLACEKIT_APP_ID,
  apiKey: process.env.PLACEKIT_API_KEY,
  options: {
    hitsPerPage: 5,
  },
});

(async () => {
  const res = await pkSearch('Paris');
  console.log(res);
})();
