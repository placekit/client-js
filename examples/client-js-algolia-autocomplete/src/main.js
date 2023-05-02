import placekit from '@placekit/client-js';
import { autocomplete } from '@algolia/autocomplete-js';

import './global.css';
import '@algolia/autocomplete-theme-classic';

const pk = placekit(import.meta.env.VITE_PLACEKIT_API_KEY, {
  countries: ['fr'],
});

autocomplete({
  container: '#autocomplete',
  placeholder: 'Search for places',
  getSources() {
    return [
      {
        sourceId: 'placekit',
        // make PlaceKit call inside `getItems`
        getItems({ query }) {
          return pk.search(query).then((res) => {
            // `getItems` expects an array of results, not a response object
            return res.results;
          });
        },
        templates: {
          item({ item }) {
            return [
              item.name,
              item.zipcode,
              item.county
            ].join(' ');
          },
        },
      },
    ];
  },
});