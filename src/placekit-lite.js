// Extend client
const extensions = new Map();

// PlaceKit init
export default function placekit(apiKey, options = {}) {
  // Check apiKey parameter
  if (!['string', 'undefined'].includes(typeof apiKey)) {
    throw Error('PlaceKit: `apiKey` argument is invalid, expected a string.');
  } else if (!apiKey) {
    console.warn('PlaceKit: missing or empty `apiKey` argument.');
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
  function request(method = 'POST', resource = '', opts = {}) {
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
  };

  // Register extensions
  for (const [resource, init] of extensions.entries()) {
    if (resource in client) {
      throw Error(`PlaceKit extend: \`client.${resource}\` already exists.`);
    }
    client[resource] = init(request, client);
  }

  // Save global parameters and return client
  client.configure(options);
  return client;
}

// Extend client helper
placekit.extend = function(resource, init) {
  if (!init?.call) {
    throw Error('PlaceKit extend: `init` argument is invalid, expected a function.');
  }
  extensions.set(resource, init);
};

// Extend with Search method
placekit.extend('search', (request, client) => (query, opts = {}) => {
  if (!['string', 'undefined'].includes(typeof query)) {
    throw Error('PlaceKit `client.search`: `query` argument is invalid, expected a string.');
  }
  if (!['object', 'undefined'].includes(typeof opts) || Array.isArray(opts) || opts === null) {
    throw Error('PlaceKit.search: `opts` argument is invalid, expected an object.');
  }
  return request('POST', 'search', {
    ...client.options,
    ...opts,
    query,
  });
});

// Extend with Reverse geocoding method
placekit.extend('reverse', (request, client) => (opts = {}) => {
  if (!['object', 'undefined'].includes(typeof opts) || Array.isArray(opts) || opts === null) {
    throw Error('PlaceKit.reverse: `opts` argument is invalid, expected an object.');
  }
  return request('POST', 'reverse', {
    ...client.options,
    ...opts,
  });
});
