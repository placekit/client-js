import dotenv from 'dotenv';
dotenv.config({});

import PlaceKit from '../../';

const options: Partial<PlaceKit.PKOptions> = {
  hitsPerPage: 5,
};

const pkSearch: PlaceKit.PKInstance = PlaceKit({
  appId: `${process.env.PLACEKIT_APP_ID}`,
  apiKey: `${process.env.PLACEKIT_API_KEY}`,
  options,
});

const [query] = process.argv.slice(2);

(async () => {
  const res: PlaceKit.PKResponse = await pkSearch(query || '');
  console.log(res);
})();