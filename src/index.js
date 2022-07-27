/** @external Position built-in Geolocation position type */

/**
 * @typedef {Object} PKOptions PlaceKit parameters
 * @prop {number} retryTimeout Retry timeout in ms
 * @prop {string} language Results language (ISO 639-1)
 * @prop {string[]} countries Countries whitelist (ISO 639-1)
 * @prop {string} type Results type
 * @prop {boolean} postcodeSearch Search only postCode
 * @prop {string} aroundLatLng Coordinates search starts around
 * @prop {boolean} aroundLatLngViaIP Geolocalize using IP address
 * @prop {number} aroundRadius Radius around `aroundLatLng`
 * @prop {string} insideBoundingBox Filter inside rectangle area
 * @prop {string} insidePolygon Filter inside polygon
 * @prop {string} getRankingInfo Include ranking info in results
 * @prop {Object} computeQueryParams Override query parameters
 */

/**
 * @typedef {Object} PKResponse PlaceKit response
 * @prop {Object[]} hits Results
 */

/**
 * PlaceKIt initialization closure
 * @desc Fetch wrapper over the PlaceKit API to implement a retry strategy and parameters checking.
 * @arg {Object} params
 * @arg {string} params.appId PlaceKit application ID
 * @arg {string} params.apiKey PlaceKit API key
 * @arg {PKOptions} params.options PlaceKit global parameters
 * @return {instance}
 */
const PlaceKit = ({
  appId,
  apiKey,
  options = {}
}) => {
  // Check appId parameter
  if (!['string', 'undefined'].includes(typeof appId)) {
    throw Error('PlaceKit initialization: `appId` parameter is invalid, expected a string.');
  } else if (!appId) {
    console.warn('PlaceKit initialization: missing or empty `appId` parameter.');
  }

  // Check apiKey parameter
  if (!['string', 'undefined'].includes(typeof apiKey)) {
    throw Error('PlaceKit initialization: `apiKey` parameter is invalid, expected a string.');
  } else if (!apiKey) {
    console.warn('PlaceKit initialization: missing or empty `apiKey` parameter.');
  }

  // Cascade of hosts, both DSNs and servers, in order of retry priority.
  let currentHost = 0;
  const hosts = [
    `https://${appId}.algolia.net/1/indexes/flowable-open-source/query`,
    `https://${appId}-dsn.algolia.net/1/indexes/flowable-open-source/query`,
    `https://${appId}-1.algolianet.com/1/indexes/flowable-open-source/query`,
    `https://${appId}-2.algolianet.com/1/indexes/flowable-open-source/query`,
    `https://${appId}-3.algolianet.com/1/indexes/flowable-open-source/query`,
  ];

  // Set global params default values
  const globalParams = {
    retryTimeout: 2000,
    language: typeof window !== 'undefined' && navigator.language ?
      navigator.language.slice(0, 2) :
      'default',
    // countries: [],
    // type: '',
    // postcodeSearch: '',
    // aroundLatLng: '',
    // aroundLatLngViaIP: '',
    // aroundRadius: '',
    // insideBoundingBox: '',
    // insidePolygon: '',
    // getRankingInfo: '',
    // computeQueryParams: '',
  };

  /**
   * Sanitize options
   * @arg {PKOptions} opts PlaceKit options
   * @return {PKOptions}
   */
  const checkOptions = (opts = {}) => {
    if (opts.retryTimeout && Number.isInteger(ops.retryTimeout)) {
      opts.retryTimeout = Math.max(0, opts.retryTimeout);
    }
    if (typeof opts.language === 'string' && opts.language !== 'default') {
      opts.language = opts.language.slice(0, 2).toLocaleLowerCase();
    }
    return opts;
  };

  // TODO: remove this helper, should happen server-side
  const getLangAttr = (value, lang) => {
    return value[lang] || value.default;
  };

  /**
   * PlaceKit instance is a function to search for places
   * @param {string} query Query
   * @param {PKOptions} opts Override global parameters
   * @return {Promise<PKResponse>}
   */
  const instance = (query, opts = {}) => {
    if (!['string', 'undefined'].includes(typeof query)) {
      throw Error('PlaceKit: `query` parameter is invalid, expected a string.');
    }
    if (typeof opts !== 'object' || Array.isArray(opts) || opts === null) {
      throw Error('PlaceKit: `opts` parameter is invalid, expected an object.');
    }

    // TODO: keep action and language in globalParams to forward to server
    const { language, retryTimeout, ...params } = {
      ...globalParams,
      ...checkOptions(opts),
    };
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), retryTimeout || 2000);
    return fetch(hosts[currentHost], {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Algolia-Application-Id': appId,
        'X-Algolia-API-Key': apiKey,
      },
      body: JSON.stringify({
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
          return instance(query, options);
        }
      }
      throw err;
    });
  };

  /**
   * Set global parameters
   * @memberof instance
   * @arg {PKOptions} opts PlaceKit global parameters
   */
  instance.configure = (opts = {}) => {
    if (typeof opts !== 'object' || Array.isArray(opts) || opts === null) {
      throw Error('PlaceKit.configure: `opts` parameter is invalid, expected an object.');
    }

    Object.assign(globalParams, checkOptions(opts));
  };


  // Make `instance.hasGeolocation` read-only
  let hasGeolocation = false;
  /**
   * @member {boolean}
   * @memberof instance
   * @readonly
   */
  Object.defineProperty(instance, 'hasGeolocation', {
    get: () => hasGeolocation,
  });

  /**
   * Request the device's location
   * @memberof instance
   * @arg {number} timeout Geolocation request timeout
   * @return {Promise<Position>}
   */
  instance.requestGeolocation = (timeout = 0) => {
    if (typeof timeout !== 'number' || !Number.isInteger(timeout) || timeout < 0) {
      throw Error('PlaceKit.requestGeolocation: `timeout` parameter is invalid, expected a positive integer.');
    }

    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        reject(Error('PlaceKit.requestGeolocation: geolocation is only available in the browser.'));
      } else {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            hasGeolocation = true;
            globalParams.aroundLatLng = `${pos.coords.latitude}, ${pos.coords.longitude}`;
            resolve(pos);
          },
          (err) => {
            hasGeolocation = false;
            delete globalParams.aroundLatLn;
            reject(Error(`PlaceKit.requestGeolocation: (${err.code}) ${err.message}`));
          },
          {
            timeout,
          }
        );
      }
    });
  };

  // Save global parameters and return instance
  instance.configure(options);
  return instance;
};

module.exports = PlaceKit;
