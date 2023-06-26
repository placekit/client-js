/** @external Position built-in Geolocation position type */

/**
 * @typedef {Object} Options PlaceKit parameters
 * @prop {number} [timeout] Timeout in ms
 * @prop {number} [maxResults] Max results to return
 * @prop {string[]} [types] Results type
 * @prop {string} [language] Results language (ISO 639-1)
 * @prop {boolean} [countryByIP] Get country from IP
 * @prop {boolean} [forwardIP] Set `x-forwarded-for` header to override IP when `countryByIP` is `true`.
 * @prop {string[]} [countries] Countries to search in, or fallback to if `countryByIP` is true (ISO_3166-1_alpha-2)
 * @prop {string} [coordinates] Coordinates search starts around
 */

/**
 * @typedef {Object} Result PlaceKit result
 * @prop {Object} [street]
 * @prop {string} street.number
 * @prop {string} street.suffix
 * @prop {string} street.name
 * @prop {string} name
 * @prop {string} city
 * @prop {string} county
 * @prop {string} administrative
 * @prop {string} country
 * @prop {string} countrycode
 * @prop {string} coordinates // "lat,lng"
 * @prop {number} [lat] // deprecated
 * @prop {number} [lng] // deprecated
 * @prop {string} type
 * @prop {string[]} zipcode
 * @prop {number} population
 * @prop {string} highlight
 */

/**
 * @typedef {Object} PatchResult PlaceKit Patch result
 * @extends Result
 * @prop {string} id
 * @prop {'pendint' | 'approved'} status
 */

/**
 * @typedef {Object} PatchUpdate PlaceKit Patch update fields
 * @prop {string} name
 * @prop {string} city
 * @prop {string} county
 * @prop {string} administrative
 * @prop {string} country
 * @prop {string} countrycode
 * @prop {string} coordinates // "lat,lng"
 * @prop {string} type
 * @prop {string[]} zipcode
 * @prop {number} [population]
 */

/**
 * @typedef {Object} PatchSearchResponse PlaceKit response
 * @prop {PatchResult[]} results Results
 * @prop {number} resultsCount Number of items results found
 * @prop {number} maxResults Maximum number of results items returned
 * @prop {number} offset Offset used for this paginated response
 * @prop {number} totalResults The total number of available items
 */

/**
 * @typedef {Object} SearchResponse PlaceKit response
 * @prop {Result[]} results Results
 * @prop {number} resultsCount Number of items results found
 * @prop {number} maxResults Maximum number of results items returned
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
    throw Error('PlaceKit constructor: `apiKey` parameter is invalid, expected a string.');
  } else if (!apiKey) {
    console.warn('PlaceKit constructor: missing or empty `apiKey` parameter.');
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

  // Set default language from browser settings
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
    const { timeout, forwardIP, ...params } = opts;
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
    if (forwardIP) {
      headers['x-forwarded-for'] = forwardIP;
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
      throw Error('PlaceKit `client.search`: `query` argument is invalid, expected a string.');
    }
    if (!['object', 'undefined'].includes(typeof opts) || Array.isArray(opts) || opts === null) {
      throw Error('PlaceKit `client.search`: `opts` argument is invalid, expected an object.');
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
   * @param {Options} [opts] Override global parameters
   * @return {Promise<SearchResponse>}
   */
  client.reverse = (opts = {}) => {
    if (!['object', 'undefined'].includes(typeof opts) || Array.isArray(opts) || opts === null) {
      throw Error('PlaceKit `client.reverse`: `opts` argument is invalid, expected an object.');
    }
    const params = {
      ...globalParams,
      ...opts,
    };
    return request('POST', 'reverse', params);
  };

  /**
   * PlaceKit patch
   * @memberof client
   */
  client.patch = {
    /**
     * PlaceKit list/search patches
     * @arg {string} [query] Search query
     * @arg {Object} [params]
     * @arg {'pending' | 'approved'} [params.status] Filter patches on status
     * @arg {string[]} [params.countries] Filter patches by country (ISO_3166-1_alpha-2)
     * @arg {number} [params.maxResults] Number of patches to retrieve
     * @arg {number} [params.offset] Offset search by N results
     * @return {Promise<PatchSearchResponse>}
     */
    search(query, params = {}) {
      if (!['string', 'undefined'].includes(typeof query)) {
        throw Error('PlaceKit `client.patch.search`: `query` argument is invalid, expected a string.');
      }
      if (!['object', 'undefined'].includes(typeof params) || Array.isArray(params) || params === null) {
        throw Error('PlaceKit `client.patch.search`: `params` argument is invalid, expected an object.');
      }
      return request('POST', `patch/search`, {
        params: {
          ...params,
          query,
        }
      });
    },
    /**
     * PlaceKit create patch
     * @arg {PatchUpdate} address Patch address fields to update
     * @arg {Result} [origin] Original record to patch (Add mode if omited, Fix mode if specified)
     * @arg {Object} [opts] Patch update options
     * @arg {'pending' | 'approved'} [opts.status] Patch status option
     * @arg {string} [opts.language] Patch language option (ISO 639-1)
     * @return {Promise<PatchResult>}
     */
    create(address, origin, { status, language } = {}) {
      const method = typeof origin === 'undefined' ? 'POST' : 'PUT';
      const data = typeof origin === 'undefined' ? { record: address } : {
        origin: origin,
        update: address,
      };
      return request(method, 'patch', {
        ...data,
        status,
        language,
      });
    },
    /**
     * PlaceKit get patch by ID
     * @arg {string} id Patch ID
     * @return {Promise<PatchResult>}
     */
    get(id) {
      if (typeof id !== 'string' || !id) {
        throw Error('PlaceKit `client.patch.get`: `id` argument is invalid, expected a string.');
      }
      return request('GET', `patch/${id}`);
    },
    /**
     * PlaceKit update patch by ID
     * @arg {string} id Patch ID
     * @arg {PatchUpdate} address Patch address fields to update //TODO:
     * @arg {Object} [opts] Patch update options
     * @arg {'pending' | 'approved'} [opts.status] Patch status option
     * @arg {string} [opts.language] Patch language option (ISO 639-1)
     * @return {Promise<PatchResult>}
     */
    update(id, address, { status, language } = {}) {
      if (typeof id !== 'string' || !id) {
        throw Error('PlaceKit `client.patch.update`: `id` argument is invalid, expected a string.');
      }
      return request('PATCH', `patch/${id}`, {
        update: address,
        status,
        language,
      });
    },
    /**
     * PlaceKit delete patch or patch translation by ID
     * @arg {string} id Patch ID
     * @arg {string} [language] Patch language (ISO 639-1)
     * @return {Promise<void>}
     */
    delete(id, language) {
      if (typeof id !== 'string' || !id) {
        throw Error('PlaceKit `client.patch.delete`: `id` argument is invalid, expected a string.');
      }
      if (!['string', 'undefined'].includes(typeof language)) {
        throw Error('PlaceKit `client.patch.delete`: `language` argument is invalid, expected a string.');
      }
      const resource = !!language ? `patch/${id}/language/${language}` : `patch/${id}`;
      return request('DELETE', resource);
    },
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
          globalParams.coordinates = `${pos.coords.latitude},${pos.coords.longitude}`;
          resolve(pos);
        },
        (err) => {
          hasGeolocation = false;
          delete globalParams.coordinates;
          reject(Error(`PlaceKit.requestGeolocation: (${err.code}) ${err.message}`));
        },
        opts
      );
    }
  });

  /**
   * Clear device's location
   * @memberof client
   */
  client.clearGeolocation = () => {
    hasGeolocation = false;
    delete globalParams.coordinates;
  };

  // Save global parameters and return client
  client.configure(options);
  return client;
};
