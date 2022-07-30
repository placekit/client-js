/** @external Position built-in Geolocation position type */

/**
 * @typedef {Object} Options PlaceKit parameters
 * @prop {number} retryTimeout Retry timeout in ms
 * @prop {string} language Results language (ISO 639-1)
 * @prop {string[]} countries Countries whitelist (ISO 639-1)
 * @prop {string} type Results type
 * @prop {number} hitsPerPage Results per page
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
 * @typedef {Object} Response PlaceKit response
 * @prop {Object[]} hits Results
 */

/**
 * PlaceKit initialization closure
 * @desc Fetch wrapper over the PlaceKit API to implement a retry strategy and parameters checking.
 * @module PlaceKit
 * @arg {Object} params
 * @arg {string} params.appId PlaceKit application ID
 * @arg {string} params.apiKey PlaceKit API key
 * @arg {Options} params.options PlaceKit global parameters
 * @return {instance}
 */
module.exports = ({
  appId,
  apiKey,
  options = {}
} = {}) => {
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
    hitsPerPage: 10,
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
   * @arg {Options} opts PlaceKit options
   * @return {Options}
   */
  const checkOptions = (opts = {}) => {
    if (opts.retryTimeout && Number.isInteger(opts.retryTimeout)) {
      opts.retryTimeout = Math.max(0, opts.retryTimeout);
    }
    if (typeof opts.language === 'string' && opts.language !== 'default') {
      opts.language = opts.language.slice(0, 2).toLocaleLowerCase();
    }
    if (opts.hitsPerPage && Number.isInteger(opts.hitsPerPage)) {
      opts.hitsPerPage = Math.max(0, opts.hitsPerPage);
    }
    return opts;
  };

  // TODO: remove this helper, should happen server-side
  const getLangAttr = (value, lang) => {
    const prop = value[lang] || value.default;
    return prop ? prop[0] : '';
  };

  /**
   * PlaceKit instance is a function to search for places
   * @param {string} query Query
   * @param {Options} opts Override global parameters
   * @return {Promise<Response>}
   */
  const instance = (query, opts = {}) => {
    if (!['string', 'undefined'].includes(typeof query)) {
      throw Error('PlaceKit: `query` parameter is invalid, expected a string.');
    }
    if (!['object', 'undefined'].includes(typeof opts) || Array.isArray(opts) || opts === null) {
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
          id: item.objectID,
          name: getLangAttr(item.name, language),
          zipcode: item.zipcode ? item.zipcode[0] : '',
          county: getLangAttr(item.county, language),
          country: getLangAttr(item.country, language),
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
   * Make `instance.options` read-only
   * @member {Options}
   * @memberof instance
   * @readonly
   */
  Object.defineProperty(instance, 'options', {
    get: () => globalParams,
  });

  /**
   * Set global parameters
   * @memberof instance
   * @arg {Options} opts PlaceKit global parameters
   */
  instance.configure = (opts = {}) => {
    if (!['object', 'undefined'].includes(typeof opts) || Array.isArray(opts) || opts === null) {
      throw Error('PlaceKit.configure: `opts` parameter is invalid, expected an object.');
    }

    Object.assign(globalParams, checkOptions(opts));
  };

  let hasGeolocation = false;
  /**
   * Make `instance.hasGeolocation` read-only
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
    if (!['number', 'undefined'].includes(typeof opts) || !Number.isInteger(timeout) || timeout < 0) {
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
            globalParams.aroundLatLng = null;
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
