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

import placekit from './placekit-lite.js';

afterEach(() => {
  warnMock.mock.resetCalls();
  geolocationMock.mock.resetCalls();
  fetchMock.mock.resetCalls();
});

describe('PlaceKit/Lite: Initialize', () => {
  it('warns when apiKey is missing or empty', () => {
    placekit();
    assert.equal(warnMock.mock.calls.length, 1);
    assert.match(warnMock.mock.calls[0].arguments[0], /apiKey/i);
    placekit('');
    assert.equal(warnMock.mock.calls.length, 2);
    assert.match(warnMock.mock.calls[1].arguments[0], /apiKey/i);
  });

  it('throws when apiKey is invalid', () => {
    assert.throws(() => {
      placekit(null);
    }, /apiKey/i);
  });

  it('returns lite client when parameters are valid', () => {
    const pk = placekit('your-api-key');
    assert.equal(warnMock.mock.calls.length, 0);
    assert.equal(typeof pk.search, 'function');
    assert.equal(typeof pk.reverse, 'function');
    assert.equal(typeof pk.configure, 'function');
    assert.equal(typeof pk.requestGeolocation, 'function');
    assert.equal(typeof pk.clearGeolocation, 'function');
    assert.throws(() => {
      pk.options = 'invalid'; // should be read-only
    });
    assert.throws(() => {
      pk.hasGeolocation = true; // should be read-only
    });
    assert.equal(typeof pk.options, 'object');
    assert.equal(pk.hasGeolocation, false);
    assert.equal(typeof pk.patch, 'undefined');
  });
});

describe('PlaceKit/Lite: Configure', () => {
  it('throws when args are invalid', () => {
    assert.throws(() => {
      const pk = placekit('your-api-key');
      pk.configure('invalid');
    }, /opts/i);
  });

  it('updates global options', () => {
    const pk = placekit('your-api-key');
    const options = {
      timeout: -100,
      language: 'FR',
      countries: ['FR'],
      maxResults: -100,
      coordinates: '48.86,2.29',
    };
    pk.configure(options);
    assert.deepEqual(pk.options, options);
  });
});

describe('PlaceKit/Lite: Request Geolocation', () => {
  it('throws when args are invalid', async () => {
    const pk = placekit('your-api-key');
    assert.throws(() => {
      pk.requestGeolocation('invalid');
    }, /opts/i);
    assert.equal(geolocationMock.mock.calls.length, 0);
    assert.equal(pk.hasGeolocation, false);
  });

  it('denies geolocation', async () => {
    geolocationMock.mock.mockImplementationOnce((_success, error) => Promise.resolve(error({
      code: 1,
      message: '',
    })));
    const pk = placekit('your-api-key');
    assert.rejects(async () => {
      await pk.requestGeolocation();
    });
    assert.equal(geolocationMock.mock.calls.length, 1)
    assert.equal(pk.hasGeolocation, false);
  });

  it('provides geolocation', async () => {
    const coords = {
      latitude: 48.86,
      longitude: 2.29,
    };
    geolocationMock.mock.mockImplementationOnce((success) => Promise.resolve(success({ coords })));
    const pk = placekit('your-api-key');
    const res = await pk.requestGeolocation();
    assert.equal(geolocationMock.mock.calls.length, 1);
    assert.deepEqual(res, { coords });
    assert.ok(pk.hasGeolocation);
  });

  it('clears geolocation', async () => {
    const coords = {
      latitude: 48.86,
      longitude: 2.29,
    };
    geolocationMock.mock.mockImplementationOnce((success) => Promise.resolve(success({ coords })));
    const pk = placekit('your-api-key');
    const res = await pk.requestGeolocation();
    assert.equal(geolocationMock.mock.calls.length, 1);
    assert.deepEqual(res, { coords });
    assert.ok(pk.hasGeolocation);
    assert.equal(pk.options.coordinates, '48.86,2.29');
    pk.clearGeolocation();
    assert.equal(typeof pk.options.coordinates, 'undefined');
    assert.equal(pk.hasGeolocation, false);
  });
});

describe('PlaceKit/Lite: Search', () => {
  it('throws when args are invalid', () => {
    assert.throws(() => {
      const pk = placekit('your-api-key');
      pk.search(null);
    }, /query/i);

    assert.throws(() => {
      const pk = placekit('your-api-key');
      pk.search('', null);
    }, /opts/i);
  });

  it('sends proper request', async () => {
    fetchMock.mock.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      status: 200,
      json: () => ({ results: [] }),
    }));
    const pk = placekit('your-api-key');
    const res = await pk.search('');
    const calls = fetchMock.mock.calls;
    assert.equal(calls.length, 1);
    assert.equal(calls[0].arguments[0]?.pathname, '/search');
    assert.equal(calls[0].arguments[1]?.method, 'POST');
    assert.notEqual(typeof calls[0].arguments[1]?.signal, 'undefined');
    const headers = calls[0].arguments[1]?.headers;
    assert.equal(headers['Content-Type'], 'application/json; charset=UTF-8');
    assert.equal(headers['x-placekit-api-key'], 'your-api-key');
    assert.equal(typeof headers['User-Agent'], 'string');
    assert.equal(res.results.length, 0);
  });

  it('sets `x-forwarded-for` header from forwardIP option', async () => {
    fetchMock.mock.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      status: 200,
      json: () => ({ results: [] }),
    }));
    const pk = placekit('your-api-key');
    const res = await pk.search('', {
      forwardIP: '0.0.0.0',
      countryByIP: true,
    });
    const calls = fetchMock.mock.calls;
    assert.equal(calls.length, 1);
    assert.equal(calls[0].arguments[0]?.pathname, '/search');
    assert.equal(calls[0].arguments[1]?.method, 'POST');
    assert.notEqual(typeof calls[0].arguments[1]?.signal, 'undefined');
    const headers = calls[0].arguments[1]?.headers;
    assert.equal(headers['Content-Type'], 'application/json; charset=UTF-8');
    assert.equal(headers['x-placekit-api-key'], 'your-api-key');
    assert.equal(headers['x-forwarded-for'], '0.0.0.0');
    assert.equal(typeof headers['User-Agent'], 'string');
    assert.equal(res.results.length, 0);
  });

  it('retries with next host on timeout', () => {
    fetchMock.mock.mockImplementation(() => Promise.resolve({
      ok: true,
      status: 200,
      json: () => ({ results: [] }),
    }));
    fetchMock.mock.mockImplementationOnce(() => Promise.reject({ name: 'AbortError' }));
    const pk = placekit('your-api-key');
    assert.rejects(async () => {
      await pk.search('');
    }, { name: 'AbortError' });
    const calls = fetchMock.mock.calls;
    assert.equal(calls.length, 1);
  });

  it('retries with next host on 500', async () => {
    fetchMock.mock.mockImplementation(() => Promise.resolve({
      ok: true,
      status: 200,
      json: () => ({ results: [] }),
    }));
    fetchMock.mock.mockImplementationOnce(() => Promise.resolve({
      ok: false,
      status: 500,
      statusText: '',
      json: () => ({ message: 'An error occured.', errors: [] }),
    }));
    const pk = placekit('your-api-key');
    assert.rejects(async () => {
      await pk.search('');
    }, {
      status: 500,
      statusText: '',
      message: 'An error occured.',
      errors: []
    });
    const calls = fetchMock.mock.calls;
    assert.equal(calls.length, 1);
  });

  it('rejects on 40x', async () => {
    fetchMock.mock.mockImplementation(() => Promise.resolve({
      ok: false,
      status: 403,
      statusText: '',
      json: () => ({ message: 'An error occured.', errors: [] }),
    }));
    const pk = placekit('your-api-key');
    assert.rejects(async () => {
      await pk.search('');
    }, {
      status: 403,
      statusText: '',
      message: 'An error occured.',
      errors: []
    });
    const calls = fetchMock.mock.calls;
    assert.equal(calls.length, 1);
  });
});

describe('PlaceKit/Lite: Reverse', () => {
  it('throws when args are invalid', () => {
    assert.throws(() => {
      const pk = placekit('your-api-key');
      pk.search('', null);
    }, /opts/i);
  });

  it('sends proper request', async () => {
    fetchMock.mock.mockImplementation(() => Promise.resolve({
      ok: true,
      status: 200,
      json: () => ({ results: [] }),
    }));
    const pk = placekit('your-api-key');
    const res = await pk.reverse({
      coordinates: '0,0',
    });
    const calls = fetchMock.mock.calls;
    assert.equal(calls.length, 1);
    assert.equal(calls[0].arguments[0].pathname, '/reverse');
    assert.notEqual(typeof calls[0].arguments[1]?.signal, 'undefined');
    const headers = calls[0].arguments[1]?.headers;
    assert.equal(headers['Content-Type'], 'application/json; charset=UTF-8');
    assert.equal(headers['x-placekit-api-key'], 'your-api-key');
    assert.equal(typeof headers['User-Agent'], 'string');
    assert.equal(res.results.length, 0);
  });

  it('overrides previously set coordinates', async () => {
    fetchMock.mock.mockImplementation(() => Promise.resolve({
      ok: true,
      status: 200,
      json: () => ({ results: [] }),
    }));
    const pk = placekit('your-api-key', {
      coordinates: '1,1',
    });
    const res = await pk.reverse({
      coordinates: '2,2',
    });
    const calls = fetchMock.mock.calls;
    assert.equal(calls.length, 1);
    assert.equal(JSON.parse(calls[0].arguments[1].body)?.coordinates, '2,2');
    assert.equal(res.results.length, 0);
  });
});
