import dotenv from 'dotenv';
dotenv.config();

import PlaceKit from '../../';
import type { PKInstance, PKOptions, PKResponse } from '../../';

const options: Partial<PKOptions> = {
  hitsPerPage: 5,
};

const pkSearch: PKInstance = PlaceKit({
  appId: `${process.env.PLACEKIT_APP_ID}`,
  apiKey: `${process.env.PLACEKIT_API_KEY}`,
  options,
});

const [query] = process.argv.slice(2);

(async () => {
  const res: PKResponse = await pkSearch(query || '');
  console.log(res);
})();