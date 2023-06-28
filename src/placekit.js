import placekit from './placekit-lite.js';

// Extend with Live Patching methods
placekit.extend('patch', (request) => ({
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
}));

export default placekit;
