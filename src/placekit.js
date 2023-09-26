import placekit from './placekit-lite.js';

// Extend with Live Patching methods
placekit.extend('patch', (request) => ({
  // List/search patch records
  list(opts = {}) {
    if (!['object', 'undefined'].includes(typeof opts) || Array.isArray(opts) || opts === null) {
      throw Error('PlaceKit.patch.list: `opts` argument is invalid, expected an object.');
    }
    return request('POST', `patch/search`, opts);
  },

  // Create patch record
  create(update, opts = {}, origin) {
    if (!['object', 'undefined'].includes(typeof opts) || Array.isArray(opts) || opts === null) {
      throw Error('PlaceKit.patch.create: `opts` argument is invalid, expected an object.');
    }
    const method = typeof origin === 'undefined' ? 'POST' : 'PUT';
    const data = typeof origin === 'undefined' ? { record: update } : {
      origin,
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
  update(id, update, opts = {}) {
    if (typeof id !== 'string' || !id) {
      throw Error('PlaceKit.patch.update: `id` argument is invalid, expected a string.');
    }
    if (!['object', 'undefined'].includes(typeof opts) || Array.isArray(opts) || opts === null) {
      throw Error('PlaceKit.patch.update: `opts` argument is invalid, expected an object.');
    }
    return request('PATCH', `patch/${id}`, {
      update,
      status: opts?.status,
      language: opts?.language,
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
}));

// Extend with API keys methods
placekit.extend('keys', (request) => ({
  // List all API keys
  list() {
    return request('GET', `keys`);
  },

  // Create API key
  create(role, opts = {}) {
    if (!['public', 'private'].includes(role)) {
      throw Error('PlaceKit.keys.create: `role` argument is invalid, expected either "public" or "private".');
    }
    if (!['object', 'undefined'].includes(typeof opts) || Array.isArray(opts) || opts === null) {
      throw Error('PlaceKit.patch.update: `opts` argument is invalid, expected an object.');
    }
    return request('POST', `keys`, {
      role,
      domains: opts.domains,
    });
  },

  // Retrieve API key by ID
  get(id) {
    if (typeof id !== 'string' || !id) {
      throw Error('PlaceKit.keys.get: `id` argument is invalid, expected a string.');
    }
    return request('GET', `keys/${id}`);
  },

  // Update API key
  update(id, opts = {}) {
    if (typeof id !== 'string' || !id) {
      throw Error('PlaceKit.keys.get: `id` argument is invalid, expected a string.');
    }
    if (!['object', 'undefined'].includes(typeof opts) || Array.isArray(opts) || opts === null) {
      throw Error('PlaceKit.patch.update: `opts` argument is invalid, expected an object.');
    }
    return request('PATCH', `keys/${id}`, {
      domains: opts.domains,
    });
  },

  // Delete API key
  delete(id) {
    if (typeof id !== 'string' || !id) {
      throw Error('PlaceKit.keys.get: `id` argument is invalid, expected a string.');
    }
    return request('DELETE', `keys/${id}`);
  },
}));

export default placekit;
