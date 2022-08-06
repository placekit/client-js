import dotenv from 'dotenv';
dotenv.config();

import PlaceKit from '../../';
import type { PKClient, PKOptions, PKSearchResponse } from '../../';

const options: Partial<PKOptions> = {
  hitsPerPage: 5,
};

const pkClient: PKClient = PlaceKit({
  appId: `${process.env.PLACEKIT_APP_ID}`,
  apiKey: `${process.env.PLACEKIT_API_KEY}`,
  options,
});

const [query] = process.argv.slice(2);

(async () => {
  const res: PKSearchResponse = await pkClient.search(query || '');
  console.log(res);
})();