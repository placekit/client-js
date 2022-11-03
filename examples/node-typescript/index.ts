import dotenv from 'dotenv';
dotenv.config();

import PlaceKit from '@placekit/placekit-js';
import type { PKClient, PKOptions, PKSearchResponse } from '@placekit/placekit-js';

const options: PKOptions = {
  maxResults: 5,
};

const pk: PKClient = PlaceKit(process.env.PLACEKIT_API_KEY, options);

const [query] = process.argv.slice(2);

(async () => {
  const res: PKSearchResponse = await pk.search(query || '');
  console.log(res);
})();