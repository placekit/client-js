import dotenv from 'dotenv';
dotenv.config();

import PlaceKit from '@placekit/client-js';
import type { PKClient, PKOptions, PKSearchResponse } from '@placekit/client-js';

const options: PKOptions = {
  maxResults: 5,
  countries: ['fr'],
};

const pk: PKClient = PlaceKit(process.env.PLACEKIT_API_KEY, options);

const [query] = process.argv.slice(2);

(async () => {
  const res: PKSearchResponse = await pk.search(query || '');
  console.log(res);
})();