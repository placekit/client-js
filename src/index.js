/**
 * PlaceKIt initialization closure
 * @desc Fetch wrapper over the PlaceKit API to implement a retry strategy and parameters checking.
 *
 * @arg {Object} params
 * @arg {string} params.appId PlaceKit application ID
 * @arg {string} params.apiKey PlaceKit API key
 * @arg {Object} params.options Global parameters
 * @arg {string} params.options.language Results language (ISO 639-1)
 * @arg {string[]} params.options.countries Countries whitelist (ISO 639-1)
 * @arg {string} params.options.type Results type
 * @arg {boolean} params.options.postcodeSearch Search only postCode
 * @arg {string} params.options.aroundLatLng Coordinates search starts around
 * @arg {boolean} params.options.aroundLatLngViaIP Geolocalize using IP address
 * @arg {number} params.options.aroundRadius Radius around `aroundLatLng`
 * @arg {string} params.options.insideBoundingBox Filter inside rectangle area
 * @arg {string} params.options.insidePolygon Filter inside polygon
 * @arg {string} params.options.getRankingInfo Include ranking info in results
 * @arg {boolean} params.options.useDeviceLocation Filter inside polygon
 * @arg {Object} params.options.computeQueryParams Override query parameters
 *
 * @return {Object} instance
 */
const placekit = ({
  appId,
  apiKey,
  options = {}
}) => {
  // Cascade of hosts, both DSNs and servers, in order of retry priority.
  const hosts = [
    `https://${appId}.algolia.net/1/indexes/flowable-open-source/query`,
    `https://${appId}-dsn.algolia.net/1/indexes/flowable-open-source/query`,
    `https://${appId}-1.algolianet.com/1/indexes/flowable-open-source/query`,
    `https://${appId}-2.algolianet.com/1/indexes/flowable-open-source/query`,
    `https://${appId}-3.algolianet.com/1/indexes/flowable-open-source/query`,
  ];

  let currentHost = 0;
  let config = {};

  // TODO: remove this helper, should happen server-side
  const getLangAttr = (value, lang) => {
    return value[lang] || value.default;
  };

  const instance = (query, params) => {
    // TODO: keep action and language in globalParams to forward to server
    const { language, timeout, ...globalParams } = config;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout || 2000);
    return fetch(hosts[currentHost], {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Algolia-Application-Id': appId,
        'X-Algolia-API-Key': apiKey,
      },
      body: JSON.stringify({
        ...globalParams,
        ...params,
        query,
      }),
    }).then((res) => {
      clearTimeout(id);
      if (!res.ok) {
        throw ({
          status: res.status,
          statusText: res.statusText,
        });
      }
      return res.json();
    }).then((res) => {
      // TODO: move records remapping server-side
      return {
        ...res,
        hits: res.hits.map((item) => ({
          name: getLangAttr(item.name, language)[0],
          zipcode: item.zipcode[0],
          county: getLangAttr(item.county, language)[0],
          country: getLangAttr(item.country, language)[0],
        })),
      };
    }).catch((err) => {
      if (err.name === 'AbortError' || (err.status && err.status >= 500)) {
        // change host and retry if timeout or 50x
        currentHost++;
        if (currentHost < hosts.length-1) {
          return request(query, params);
        }
      }
      throw err;
    });
  };

  instance.configure = (opts = {}) => {
    config = opts;

    // set language from user perference
    if (!config.language) {
      config.language = typeof window !== 'undefined' && navigator.language ?
        window.navigator.language.replace(/-\w+$/, '') :
        'default';
    }

    // ask for device location
    if (config.useDeviceLocation) {
      instance.askDeviceLocation();
    }

    // TODO: type-check all options
  };

  // Asks for the device's location and update global config accordingly
  instance.usingDeviceLocation = false;
  instance.askDeviceLocation = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          instance.usingDeviceLocation = true;
          config.aroundLatLng = `${coords.latitude}, ${coords.longitude}`;
        },
        (err) => {
          console.warn(`ERROR(${err.code}): ${err.message}`);
          instance.usingDeviceLocation = false;
          delete config.aroundLatLn;
        },
        {
          timeout: 5000
        }
      );
    } else {
      console.warn('Device geolocation is only available in the browser.');
    }
  };

  // Set global configuration and return instance
  instance.configure(options);
  return instance;
};

module.exports = placekit;
