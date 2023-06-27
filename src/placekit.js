export default (apiKey, options = {}) => {
  // Check apiKey parameter
  if (!['string', 'undefined'].includes(typeof apiKey)) {
    throw Error('PlaceKit: `apiKey` parameter is invalid, expected a string.');
  } else if (!apiKey) {
    console.warn('PlaceKit: missing or empty `apiKey` parameter.');
  }

  // Cascade of hosts, both DSNs and servers, in order of retry priority.
  let currentHost = 0;
  const hosts = [
    `https://api.placekit.co`,
  ];

  // Set global params default values
  let hasGeolocation = false;
  const globalParams = {
    maxResults: 5,
  };

  // Set default language from browser settings
  if (typeof window !== 'undefined' && navigator.language) {
    globalParams.language = navigator.language.slice(0, 2);
  }

  // Request wrapper
  const request = (method = 'POST', resource = '', opts = {}) => {
    const { timeout, forwardIP, ...params } = opts;
    const controller = new AbortController();
    const id = typeof timeout !== 'undefined' ? setTimeout(() => controller.abort(), timeout) : undefined;
    const url = new URL(resource.trim().replace(/^\/+/, ''), hosts[currentHost]);
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

  // PlaceKit client
  const client = {
    get options() {
      return globalParams;
    },

    get hasGeolocation() {
      return hasGeolocation;
    },

    // Search
    search(query, opts = {}) {
      if (!['string', 'undefined'].includes(typeof query)) {
        throw Error('PlaceKit `client.search`: `query` argument is invalid, expected a string.');
      }
      if (!['object', 'undefined'].includes(typeof opts) || Array.isArray(opts) || opts === null) {
        throw Error('PlaceKit.search: `opts` argument is invalid, expected an object.');
      }
      const params = {
        ...globalParams,
        ...opts,
        query,
      };
      return request('POST', 'search', params);
    },

    // Reverse geocoding
    reverse(opts = {}) {
      if (!['object', 'undefined'].includes(typeof opts) || Array.isArray(opts) || opts === null) {
        throw Error('PlaceKit.reverse: `opts` argument is invalid, expected an object.');
      }
      const params = {
        ...globalParams,
        ...opts,
      };
      return request('POST', 'reverse', params);
    },

    // Set global parameters
    configure(opts = {}) {
      if (!['object', 'undefined'].includes(typeof opts) || Array.isArray(opts) || opts === null) {
        throw Error('PlaceKit.configure: `opts` argument is invalid, expected an object.');
      }
      Object.assign(globalParams, opts);
    },

    // Request the device's location
    requestGeolocation(opts = {}) {
      return new Promise((resolve, reject) => {
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
    },

    // Clear device's location
    clearGeolocation() {
      hasGeolocation = false;
      delete globalParams.coordinates;
    },

    // Patch feature
    patch: {
      // List/search patch records
      list(opts = {}) {
        return request('POST', `patch/search`, opts);
      },

      // Create patch record
      create(update, ...args) {
        const [origin, opts] = args.length < 2 ? [, args[0]] : args;
        const method = typeof origin === 'undefined' ? 'POST' : 'PUT';
        const data = typeof origin === 'undefined' ? { record: update } : {
          origin: origin,
          update,
        };
        return request(method, 'patch', {
          ...data,
          status: opts?.status,
          language: opts?.language,
        });
      },

      // Retrieve patch record by ID
      get(id, language) {
        if (typeof id !== 'string' || !id) {
          throw Error('PlaceKit.patch.get: `id` argument is invalid, expected a string.');
        }
        if (!['string', 'undefined'].includes(typeof language)) {
          throw Error('PlaceKit.patch.get: `language` argument is invalid, expected a string.');
        }
        return request('GET', `patch/${id}`, {
          params: {
            language,
          },
        });
      },

      // Update patch record
      update(id, update, { status, language } = {}) {
        if (typeof id !== 'string' || !id) {
          throw Error('PlaceKit.patch.update: `id` argument is invalid, expected a string.');
        }
        return request('PATCH', `patch/${id}`, {
          update,
          status,
          language,
        });
      },

      // Delete patch record
      delete(id) {
        if (typeof id !== 'string' || !id) {
          throw Error('PlaceKit.patch.delete: `id` argument is invalid, expected a string.');
        }
        return request('DELETE', `patch/${id}`);
      },

      // Delete patch record translation
      deleteLang(id, language) {
        if (typeof id !== 'string' || !id) {
          throw Error('PlaceKit.patch.deleteLang: `id` argument is invalid, expected a string.');
        }
        if (typeof language !== 'string' || !language) {
          throw Error('PlaceKit.patch.deleteLang: `language` argument is invalid, expected a string.');
        }
        return request('DELETE', `patch/${id}/language/${language}`);
      },
    }
  };

  // Save global parameters and return client
  client.configure(options);
  return client;
};
