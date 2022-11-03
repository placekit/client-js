import dotenv from 'dotenv';
dotenv.config();

import PlaceKit from '../../';
import type { PKClient, PKOptions, PKSearchResponse } from '../../';

const options: Partial<PKOptions> = {
  maxResults: 5,
};

const pk: PKClient = PlaceKit(process.env.PLACEKIT_API_KEY, options);

const [query] = process.argv.slice(2);

(async () => {
  const res: PKSearchResponse = await pk.search(query || '');
  console.log(res);
})();