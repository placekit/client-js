require('dotenv').config({});
const PlaceKit = require('../../dist/placekit.cjs.js');

const pkSearch = PlaceKit({
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