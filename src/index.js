/** @external Position built-in Geolocation position type */

/**
 * @typedef {Object} Options PlaceKit parameters
 * @prop {number} timeout Timeout in ms
 * @prop {string} language Results language (ISO 639-1)
 * @prop {string[]} countries Countries whitelist (ISO 639-1)
 * @prop {string} type Results type
 * @prop {number} resultsPerPage Results per page
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
 * @typedef {Object} SearchResponse PlaceKit response
 * @prop {Object[]} results Results
 */

/**
 * PlaceKit initialization closure
 * @desc Fetch wrapper over the PlaceKit API to implement a retry strategy and parameters checking.
 * @module PlaceKit
 * @arg {string} apiKey PlaceKit API key
 * @arg {Options} options PlaceKit global parameters
 * @return {client}
 */
module.exports = (apiKey, options = {}) => {
  // Check apiKey parameter
  if (!['string', 'undefined'].includes(typeof apiKey)) {
    throw Error('PlaceKit initialization: `apiKey` parameter is invalid, expected a string.');
  } else if (!apiKey) {
    console.warn('PlaceKit initialization: missing or empty `apiKey` parameter.');
  }

  // Cascade of hosts, both DSNs and servers, in order of retry priority.
  let currentHost = 0;
  const hosts = [
    // `https://dev.api.placekit.co`,
    `http://localhost:8080`,
  ];

  // Set global params default values
  const globalParams = {
    timeout: false,
    language: typeof window !== 'undefined' && navigator.language ?
      navigator.language.slice(0, 2) :
      undefined,
    resultsPerPage: 10,
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
    if (opts.timeout !== false && Number.isInteger(opts.timeout)) {
      opts.timeout = Math.max(0, opts.timeout);
    }
    if (typeof opts.language === 'string' && opts.language !== 'default') {
      opts.language = opts.language.slice(0, 2).toLocaleLowerCase();
    }
    if (opts.resultsPerPage && Number.isInteger(opts.resultsPerPage)) {
      opts.resultsPerPage = Math.max(0, opts.resultsPerPage);
    }
    return opts;
  };

  /**
   * Request wrapper
   * @param {string} method
   * @param {string} resource
   * @param {Object} opts
   * @return {Promise<SearchResponse>}
   */
  const request = (method = 'POST', resource = '', opts = {}) => {
    const { timeout, ...params } = opts;
    const controller = new AbortController();
    const id = timeout !== false ? setTimeout(() => controller.abort(), timeout) : undefined;
    const url = [
      hosts[currentHost],
      resource.trim().replace(/^\/+/, '')
    ].filter((s) => s).join('/');
    return fetch(url, {
      method,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'x-placekit-api-key': apiKey,
      },
      body: JSON.stringify(params),
    }).then(async (res) => {
      clearTimeout(id);
      const body = await res.json();
      if (!res.ok) {
        throw ({
          status: res.status,
          statusText: res.statusText,
          ...body,
        });
      }
      return body;
    }).catch((err) => {
      if (err.name === 'AbortError' || (err.status && err.status >= 500)) {
        // change host and retry if timeout or 50x
        currentHost++;
        if (currentHost < hosts.length-1) {
          return request(method, resource, opts);
        }
      }
      throw err;
    });
  };

  /**
   * PlaceKit client
   */
  const client = {};

  /**
   * PlaceKit search
   * @memberof client
   * @param {string} query Query
   * @param {Options} opts Override global parameters
   * @return {Promise<SearchResponse>}
   */
  client.search = (query, opts = {}) => {
    if (!['string', 'undefined'].includes(typeof query)) {
      throw Error('PlaceKit: `query` parameter is invalid, expected a string.');
    }
    if (!['object', 'undefined'].includes(typeof opts) || Array.isArray(opts) || opts === null) {
      throw Error('PlaceKit: `opts` parameter is invalid, expected an object.');
    }
    const params = {
      ...globalParams,
      ...checkOptions(opts),
      query,
    };
    return request('POST', 'search', params);
  };

  /**
   * Make `client.options` read-only
   * @member {Options}
   * @memberof client
   * @readonly
   */
  Object.defineProperty(client, 'options', {
    get: () => globalParams,
  });

  /**
   * Set global parameters
   * @memberof client
   * @arg {Options} opts PlaceKit global parameters
   */
  client.configure = (opts = {}) => {
    if (!['object', 'undefined'].includes(typeof opts) || Array.isArray(opts) || opts === null) {
      throw Error('PlaceKit.configure: `opts` parameter is invalid, expected an object.');
    }

    Object.assign(globalParams, checkOptions(opts));
  };

  let hasGeolocation = false;
  /**
   * Make `client.hasGeolocation` read-only
   * @member {boolean}
   * @memberof client
   * @readonly
   */
  Object.defineProperty(client, 'hasGeolocation', {
    get: () => hasGeolocation,
  });

  /**
   * Request the device's location
   * @memberof client
   * @arg {number} timeout Geolocation request timeout
   * @return {Promise<Position>}
   */
  client.requestGeolocation = (timeout = 0) => {
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

  // Save global parameters and return client
  client.configure(options);
  return client;
};
