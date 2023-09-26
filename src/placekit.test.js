import assert from 'node:assert';
import { mock, describe, it, afterEach } from 'node:test';

if (typeof window !== 'object') {
  global.window = global;
  global.window.navigator = {
    geolocation: {
      getCurrentPosition: () => {},
    },
  };
}

const warnMock = mock.method(console, 'warn');
const geolocationMock = mock.method(global.window.navigator.geolocation, 'getCurrentPosition');
const fetchMock = mock.method(global, 'fetch', () => {});

import placekit from './placekit.js';

afterEach(() => {
  warnMock.mock.resetCalls();
  geolocationMock.mock.resetCalls();
  fetchMock.mock.resetCalls();
});

describe('PlceKit/Extended: Initialize', () => {
  it('returns extended client when parameters are valid', () => {
    const pk = placekit('your-api-key');
    assert.equal(warnMock.mock.calls.length, 0);
    assert.equal(typeof pk.search, 'function');
    assert.equal(typeof pk.reverse, 'function');
    assert.equal(typeof pk.configure, 'function');
    assert.equal(typeof pk.requestGeolocation, 'function');
    assert.equal(typeof pk.clearGeolocation, 'function');
    assert.equal(typeof pk.options, 'object');
    assert.equal(pk.hasGeolocation, false);
    assert.equal(typeof pk.patch, 'object');
    assert.equal(typeof pk.patch.list, 'function');
    assert.equal(typeof pk.patch.create, 'function');
    assert.equal(typeof pk.patch.get, 'function');
    assert.equal(typeof pk.patch.update, 'function');
    assert.equal(typeof pk.patch.delete, 'function');
    assert.equal(typeof pk.patch.deleteLang, 'function');
  });
});

describe('PlaceKit/Extended: Patch.list', () => {
  it('throws when args are invalid', () => {
    assert.throws(() => {
      const pk = placekit('your-api-key');
      pk.patch.list(null);
    }, /opts/i);
  });

  it('sends proper request', async () => {
    fetchMock.mock.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      status: 200,
      json: () => ({ results: [] }),
    }));
    const pk = placekit('your-api-key');
    const res = await pk.patch.list({
      status: 'approved',
    });
    const calls = fetchMock.mock.calls;
    const body = JSON.parse(calls[0].arguments[1]?.body || {});
    assert.equal(calls.length, 1);
    assert.equal(calls[0].arguments[0]?.pathname, '/patch/search');
    assert.equal(calls[0].arguments[1]?.method, 'POST');
    assert.equal(body.status, 'approved');
    assert.equal(res.results.length, 0);
  });
});

describe('PlaceKit/Extended: Patch.create', () => {
  it('throws when args are invalid', () => {
    assert.throws(() => {
      const pk = placekit('your-api-key');
      pk.patch.create({}, null, {});
    }, /opts/i);
  });

  it('sends proper POST request', async () => {
    fetchMock.mock.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      status: 200,
      json: () => ({}),
    }));
    const pk = placekit('your-api-key');
    await pk.patch.create({ name: 'test' }, { status: 'approved' });
    const calls = fetchMock.mock.calls;
    const body = JSON.parse(calls[0].arguments[1]?.body || {});
    assert.equal(calls.length, 1);
    assert.equal(calls[0].arguments[0]?.pathname, '/patch');
    assert.equal(calls[0].arguments[1]?.method, 'POST');
    assert.equal(typeof body.record, 'object');
    assert.equal(body.record?.name, 'test');
    assert.equal(body.status, 'approved');
  });

  it('sends proper PUT request', async () => {
    fetchMock.mock.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      status: 200,
      json: () => ({}),
    }));
    const pk = placekit('your-api-key');
    await pk.patch.create({ name: 'test' }, { status: 'approved' }, { name: 'previous'});
    const calls = fetchMock.mock.calls;
    const body = JSON.parse(calls[0].arguments[1]?.body || {});
    assert.equal(calls.length, 1);
    assert.equal(calls[0].arguments[0]?.pathname, '/patch');
    assert.equal(calls[0].arguments[1]?.method, 'PUT');
    assert.equal(typeof body.update, 'object');
    assert.equal(typeof body.origin, 'object');
    assert.equal(body.update?.name, 'test');
    assert.equal(body.origin?.name, 'previous');
    assert.equal(body.status, 'approved');
  });
});

describe('PlaceKit/Extended: Patch.get', () => {
  it('throws when args are invalid', () => {
    assert.throws(() => {
      const pk = placekit('your-api-key');
      pk.patch.get();
    }, /id/i);

    assert.throws(() => {
      const pk = placekit('your-api-key');
      pk.patch.get(null);
    }, /id/i);

    assert.throws(() => {
      const pk = placekit('your-api-key');
      pk.patch.get('abc', null);
    }, /language/i);
  });

  it('sends proper request', async () => {
    fetchMock.mock.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      status: 200,
      json: () => ({}),
    }));
    const pk = placekit('your-api-key');
    await pk.patch.get('abc', 'fr');
    const calls = fetchMock.mock.calls;
    const body = JSON.parse(calls[0].arguments[1]?.body || {});
    assert.equal(calls.length, 1);
    assert.equal(calls[0].arguments[0]?.pathname, '/patch/abc');
    assert.equal(calls[0].arguments[1]?.method, 'GET');
    assert.equal(body.params?.language, 'fr');
  });
});

describe('PlaceKit/Extended: Patch.update', () => {
  it('throws when args are invalid', () => {
    assert.throws(() => {
      const pk = placekit('your-api-key');
      pk.patch.update(null);
    }, /id/i);

    assert.throws(() => {
      const pk = placekit('your-api-key');
      pk.patch.update('abc', {}, null);
    }, /opts/i);
  });

  it('sends proper request', async () => {
    fetchMock.mock.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      status: 200,
      json: () => ({}),
    }));
    const pk = placekit('your-api-key');
    await pk.patch.update('abc', { name: 'test' }, { status: 'approved' });
    const calls = fetchMock.mock.calls;
    const body = JSON.parse(calls[0].arguments[1]?.body || {});
    assert.equal(calls.length, 1);
    assert.equal(calls[0].arguments[0]?.pathname, '/patch/abc');
    assert.equal(calls[0].arguments[1]?.method, 'PATCH');
    assert.equal(typeof body.update, 'object');
    assert.equal(body.update?.name, 'test');
    assert.equal(body.status, 'approved');
  });
});

describe('PlaceKit/Extended: Patch.delete', () => {
  it('throws when args are invalid', () => {
    assert.throws(() => {
      const pk = placekit('your-api-key');
      pk.patch.delete();
    }, /id/i);

    assert.throws(() => {
      const pk = placekit('your-api-key');
      pk.patch.delete(null);
    }, /id/i);
  });

  it('sends proper request', async () => {
    fetchMock.mock.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      status: 200,
      json: () => ({}),
    }));
    const pk = placekit('your-api-key');
    await pk.patch.delete('abc');
    const calls = fetchMock.mock.calls;
    assert.equal(calls.length, 1);
    assert.equal(calls[0].arguments[0]?.pathname, '/patch/abc');
    assert.equal(calls[0].arguments[1]?.method, 'DELETE');
  });
});

describe('PlaceKit/Extended: Patch.deleteLang', () => {
  it('throws when args are invalid', () => {
    assert.throws(() => {
      const pk = placekit('your-api-key');
      pk.patch.deleteLang();
    }, /id/i);

    assert.throws(() => {
      const pk = placekit('your-api-key');
      pk.patch.deleteLang(null);
    }, /id/i);

    assert.throws(() => {
      const pk = placekit('your-api-key');
      pk.patch.deleteLang('abc');
    }, /language/i);

    assert.throws(() => {
      const pk = placekit('your-api-key');
      pk.patch.deleteLang('abc', null);
    }, /language/i);
  });

  it('sends proper request', async () => {
    fetchMock.mock.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      status: 200,
      json: () => ({}),
    }));
    const pk = placekit('your-api-key');
    await pk.patch.deleteLang('abc', 'fr');
    const calls = fetchMock.mock.calls;
    assert.equal(calls.length, 1);
    assert.equal(calls[0].arguments[0]?.pathname, '/patch/abc/language/fr');
    assert.equal(calls[0].arguments[1]?.method, 'DELETE');
  });
});

describe('PlaceKit/Extended: Keys.list', () => {
  it('sends proper request', async () => {
    fetchMock.mock.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      status: 200,
      json: () => ({ results: [] }),
    }));
    const pk = placekit('your-api-key');
    const res = await pk.keys.list();
    const calls = fetchMock.mock.calls;
    assert.equal(calls.length, 1);
    assert.equal(calls[0].arguments[0]?.pathname, '/keys');
    assert.equal(calls[0].arguments[1]?.method, 'GET');
    assert.equal(res.results.length, 0);
  });
});

describe('PlaceKit/Extended: Keys.create', () => {
  it('throws when args are invalid', () => {
    assert.throws(() => {
      const pk = placekit('your-api-key');
      pk.keys.create(null);
    }, /role/i);
    assert.throws(() => {
      const pk = placekit('your-api-key');
      pk.keys.create('invalid');
    }, /role/i);
    assert.throws(() => {
      const pk = placekit('your-api-key');
      pk.keys.create('public', 'invalid');
    }, /opts/i);
  });

  it('sends proper request', async () => {
    fetchMock.mock.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      status: 200,
      json: () => ({}),
    }));
    const pk = placekit('your-api-key');
    await pk.keys.create('public', { domains: ['example.com'] });
    const calls = fetchMock.mock.calls;
    const body = JSON.parse(calls[0].arguments[1]?.body || {});
    assert.equal(calls.length, 1);
    assert.equal(calls[0].arguments[0]?.pathname, '/keys');
    assert.equal(calls[0].arguments[1]?.method, 'POST');
    assert.equal(body.domains.length, 1);
  });
});

describe('PlaceKit/Extended: Keys.get', () => {
  it('throws when args are invalid', () => {
    assert.throws(() => {
      const pk = placekit('your-api-key');
      pk.keys.get();
    }, /id/i);

    assert.throws(() => {
      const pk = placekit('your-api-key');
      pk.keys.get(null);
    }, /id/i);
  });

  it('sends proper request', async () => {
    fetchMock.mock.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      status: 200,
      json: () => ({}),
    }));
    const pk = placekit('your-api-key');
    await pk.keys.get('abc');
    const calls = fetchMock.mock.calls;
    assert.equal(calls.length, 1);
    assert.equal(calls[0].arguments[0]?.pathname, '/keys/abc');
    assert.equal(calls[0].arguments[1]?.method, 'GET');
  });
});

describe('PlaceKit/Extended: Keys.update', () => {
  it('throws when args are invalid', () => {
    assert.throws(() => {
      const pk = placekit('your-api-key');
      pk.keys.update(null);
    }, /id/i);
    assert.throws(() => {
      const pk = placekit('your-api-key');
      pk.keys.update('abc', 'invalid');
    }, /opts/i);
  });

  it('sends proper request', async () => {
    fetchMock.mock.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      status: 200,
      json: () => ({}),
    }));
    const pk = placekit('your-api-key');
    await pk.keys.update('abc', { domains: ['example.com'] });
    const calls = fetchMock.mock.calls;
    const body = JSON.parse(calls[0].arguments[1]?.body || {});
    assert.equal(calls.length, 1);
    assert.equal(calls[0].arguments[0]?.pathname, '/keys/abc');
    assert.equal(calls[0].arguments[1]?.method, 'PATCH');
    assert.equal(body.domains.length, 1);
  });
});

describe('PlaceKit/Extended: Keys.delete', () => {
  it('throws when args are invalid', () => {
    assert.throws(() => {
      const pk = placekit('your-api-key');
      pk.keys.delete();
    }, /id/i);

    assert.throws(() => {
      const pk = placekit('your-api-key');
      pk.keys.delete(null);
    }, /id/i);
  });

  it('sends proper request', async () => {
    fetchMock.mock.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      status: 200,
      json: () => ({}),
    }));
    const pk = placekit('your-api-key');
    await pk.keys.delete('abc');
    const calls = fetchMock.mock.calls;
    assert.equal(calls.length, 1);
    assert.equal(calls[0].arguments[0]?.pathname, '/keys/abc');
    assert.equal(calls[0].arguments[1]?.method, 'DELETE');
  });
});