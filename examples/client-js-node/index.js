require('dotenv').config();
const placekit = require('@placekit/client-js');

const pk = placekit(process.env.PLACEKIT_API_KEY, {
  maxResults: 5,
  countries: ['fr'],
});

const [query] = process.argv.slice(2);

(async () => {
  try {
    const res = await pk.search(query || '');
    console.log(res);
  } catch (err) {
    console.error(err);
  }
})();