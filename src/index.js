/** @external Position built-in Geolocation position type */

/**
 * @typedef {Object} Options PlaceKit parameters
 * @prop {number} timeout Timeout in ms
 * @prop {number} maxResults Max results to return
 * @prop {string} [type] Results type
 * @prop {string} [language] Results language (ISO 639-1)
 * @prop {string[]} [countries] Countries whitelist (ISO 639-1)
 * @prop {string} [coordinates] Coordinates search starts around
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
    maxResults: 10,
  };

  if (typeof window !== 'undefined' && navigator.language) {
    globalParams.language = navigator.language.slice(0, 2);
  }

  /**
   * Sanitize options
   * @arg {Options} opts PlaceKit options
   * @return {Options}
   */
  const checkOptions = (opts = {}) => {
    if (!Number.isInteger(opts.timeout) || opts.timeout <= 0) {
      opts.timeout = false;
    }

    if (!Number.isInteger(opts.maxResults) || opts.maxResults <= 0) {
      opts.maxResults = 10;
    }

    if (typeof opts.language === 'string') {
      opts.language = opts.language.slice(0, 2).toLocaleLowerCase();
    } else {
      delete opts.language;
    }

    if (![
      'city',
      'country',
      'address',
      'busStop',
      'trainStation',
      'townhall',
      'airport'
    ].includes(opts.type)) {
      delete opts.type;
    }

    if (Array.isArray(opts.countries)) {
      opts.countries = opts.countries.map((country) => country.slice(0, 2).toLocaleLowerCase());
    } else {
      delete opts.countries;
    }

    if (typeof opts.coordinates === 'string') {
      const [lat, lng] = opts.coordinates.split(/\s*,\s*/).map(parseFloat);
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
        opts.coordinates = [lat, lng].join(',');
      } else {
        delete opts.coordinates;
      }
    } else {
      delete opts.coordinates;
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
            globalParams.coordinates = `${pos.coords.latitude}, ${pos.coords.longitude}`;
            resolve(pos);
          },
          (err) => {
            hasGeolocation = false;
            globalParams.coordinates = null;
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
