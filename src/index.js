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
     * @return {Promise<PatchRecord[]>} //TODO:
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
     * @arg {PatchUpdate} address Patch address fields to update //TODO:
     * @arg {Object} [opts] Patch update options
     * @arg {'pending' | 'approved'} [opts.status] Patch status option
     * @arg {string} [opts.language] Patch language option (ISO 639-1)
     * @arg {Record} [original] Original record to patch (Add mode if omited, Fix mode if specified)
     * @return {Promise<PatchRecord>} //TODO:
     */
    add(address = {}, { status, language } = {}, original) {
      if (!['object', 'undefined'].includes(typeof address) || Array.isArray(address) || address === null) {
        throw Error('PlaceKit `client.patch.update`: `address` argument is invalid, expected an object.');
      }
      if (!['object', 'undefined'].includes(typeof original) || Array.isArray(original) || original === null) {
        throw Error('PlaceKit `client.patch.update`: `original` argument is invalid, expected an object.');
      }
      const method = typeof original === 'undefined' ? 'POST' : 'PUT';
      const data = typeof original === 'undefined' ? { record: address } : {
        origin: original,
        update: address,
      };
      return request(method, `patch/${id}`, {
        ...data,
        status,
        language,
      });
    },
    /**
     * PlaceKit get patch by ID
     * @arg {string} id Patch ID
     * @return {Promise<PatchRecord>} //TODO:
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
     * @return {Promise<PatchRecord>} //TODO:
     */
    update(id, address = {}, { status, language } = {}) {
      if (typeof id !== 'string' || !id) {
        throw Error('PlaceKit `client.patch.update`: `id` argument is invalid, expected a string.');
      }
      if (typeof address !== 'object' || Array.isArray(address) || address === null) {
        throw Error('PlaceKit `client.patch.update`: `address` argument is invalid, expected an object.');
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
     * @return {Promise<any>} //TODO:
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
