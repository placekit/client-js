/** @external Position built-in Geolocation position type */

/**
 * @typedef {Object} Options PlaceKit parameters
 * @prop {number} [timeout] Timeout in ms
 * @prop {number} [maxResults] Max results to return
 * @prop {string[]} [types] Results type
 * @prop {string} [language] Results language (ISO 639-1)
 * @prop {boolean} [countryByIP] Get country from IP
 * @prop {boolean} [overrideIP] Set `x-forwarded-for` header to override IP when `countryByIP` is `true`.
 * @prop {string[]} [countries] Countries to search in, or fallback to if `countryByIP` is true (ISO 639-1)
 * @prop {string} [coordinates] Coordinates search starts around
 */

/**
 * @typedef {Object} Result PlaceKit result
 * @prop {string} name
 * @prop {string} city
 * @prop {string} county
 * @prop {string} administrative
 * @prop {string} country
 * @prop {string} countrycode
 * @prop {number} lat
 * @prop {number} lng
 * @prop {string} type
 * @prop {string[]} zipcode
 * @prop {number} population
 * @prop {string} highlight
 */

/**
 * @typedef {Object} SearchResponse PlaceKit response
 * @prop {Result[]} results Results
 * @prop {number} resultsCount Actual number of results
 * @prop {number} maxResults Max number of results
 * @prop {string} query Search query
 */

/**
 * PlaceKit initialization closure
 * @desc Fetch wrapper over the PlaceKit API to implement a retry strategy and parameters checking.
 * @module PlaceKit
 * @arg {string} apiKey PlaceKit API key
 * @arg {Options} [options] PlaceKit global parameters
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
    `https://api.placekit.co`,
  ];

  // Set global params default values
  const globalParams = {
    maxResults: 5,
  };

  // get default language from browser settings
  if (typeof window !== 'undefined' && navigator.language) {
    globalParams.language = navigator.language.slice(0, 2);
  }

  /**
   * Request wrapper
   * @param {string} method
   * @param {string} resource
   * @param {Object} opts
   * @return {Promise<SearchResponse>}
   */
  const request = (method = 'POST', resource = '', opts = {}) => {
    const { timeout, overrideIP, ...params } = opts;
    const controller = new AbortController();
    const id = typeof timeout !== 'undefined' ? setTimeout(() => controller.abort(), timeout) : undefined;
    const url = [
      hosts[currentHost],
      resource.trim().replace(/^\/+/, '')
    ].filter((s) => s).join('/');
    const headers = {
      'Content-Type': 'application/json; charset=UTF-8',
      'x-placekit-api-key': apiKey,
    };
    if (params.countryByIP && overrideIP) {
      headers['x-forwarded-for'] = overrideIP;
    }
    return fetch(url, {
      method,
      headers,
      signal: controller.signal,
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
   * @param {Options} [opts] Override global parameters
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
      ...opts,
      query,
    };
    return request('POST', 'search', params);
  };

  /**
   * PlaceKit reverse geocoding
   * @memberof client
   * @param {string} coordinates Coordinates "lat,lng"
   * @param {Options} [opts] Override global parameters
   * @return {Promise<SearchResponse>}
   */
  client.reverse = (coordinates, opts = {}) => {
    if (!['string', 'undefined'].includes(typeof coordinates)) {
      throw Error('PlaceKit: `coordinates` parameter is invalid, expected a string.');
    }
    if (!['object', 'undefined'].includes(typeof opts) || Array.isArray(opts) || opts === null) {
      throw Error('PlaceKit: `opts` parameter is invalid, expected an object.');
    }
    const params = {
      ...globalParams,
      ...opts,
      coordinates,
    };
    return request('POST', 'reverse', params);
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
   * @arg {Options} [opts] PlaceKit global parameters
   */
  client.configure = (opts = {}) => {
    if (!['object', 'undefined'].includes(typeof opts) || Array.isArray(opts) || opts === null) {
      throw Error('PlaceKit.configure: `opts` parameter is invalid, expected an object.');
    }

    Object.assign(globalParams, opts);
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
   * @arg {Object} [opts] `navigator.geolocation.getCurrentPosition` options
   * @return {Promise<Position>}
   */
  client.requestGeolocation = (opts = {}) => new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(Error('PlaceKit.requestGeolocation: geolocation is only available in the browser.'));
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          hasGeolocation = true;
          globalParams.coordinates = `${pos.coords.latitude}, ${pos.coords.longitude}`;
          resolve(pos);
        },
        (err) => {
          hasGeolocation = false;
          globalParams.coordinates = null;
          reject(Error(`PlaceKit.requestGeolocation: (${err.code}) ${err.message}`));
        },
        opts
      );
    }
  });

  // Save global parameters and return client
  client.configure(options);
  return client;
};
