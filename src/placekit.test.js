import assert from 'node:assert';
import { describe, it } from 'node:test';

import placekit from './placekit.js';

if (typeof window !== 'object') {
  global.window = global;
  global.window.navigator = {
    geolocation: {
      getCurrentPosition: () => {},
    },
  };
}

describe('Initialize', () => {
  it('warns when apiKey is missing or empty', (t) => {
    t.mock.method(console, 'warn');
    placekit();
    assert.equal(console.warn.mock.calls.length, 1);
    assert.match(console.warn.mock.calls[0].arguments[0], /apiKey/i);
    placekit('');
    assert.equal(console.warn.mock.calls.length, 2);
    assert.match(console.warn.mock.calls[1].arguments[0], /apiKey/i);
  });

  it('throws when apiKey is invalid', () => {
    assert.throws(() => {
      placekit(null);
    }, /apiKey/i);
  });

  it('returns client when parameters are valid', (t) => {
    t.mock.method(console, 'warn');
    const pk = placekit('your-api-key');
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
    assert.equal(console.warn.mock.calls.length, 0);
  });
});

describe('Configure', () => {
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

describe('Request Geolocation', () => {
  it('denies geolocation', async (t) => {
    const spy = t.mock.method(global.window.navigator.geolocation, 'getCurrentPosition');
    spy.mock.mockImplementationOnce((_success, error) => Promise.resolve(error({
      code: 1,
      message: '',
    })));
    const pk = placekit('your-api-key');
    assert.rejects(async () => {
      await pk.requestGeolocation();
    });
    assert.equal(spy.mock.calls.length, 1)
    assert.equal(pk.hasGeolocation, false);
  });

  it('provides geolocation', async (t) => {
    const coords = {
      latitude: 48.86,
      longitude: 2.29,
    };
    const spy = t.mock.method(global.window.navigator.geolocation, 'getCurrentPosition');
    spy.mock.mockImplementationOnce((success) => Promise.resolve(success({ coords })));
    const pk = placekit('your-api-key');
    const res = await pk.requestGeolocation();
    assert.equal(spy.mock.calls.length, 1);
    assert.deepEqual(res, { coords });
    assert.ok(pk.hasGeolocation);
  });

  it('clears geolocation', async (t) => {
    const coords = {
      latitude: 48.86,
      longitude: 2.29,
    };
    const spy = t.mock.method(global.window.navigator.geolocation, 'getCurrentPosition');
    spy.mock.mockImplementationOnce((success) => Promise.resolve(success({ coords })));
    const pk = placekit('your-api-key');
    const res = await pk.requestGeolocation();
    assert.equal(spy.mock.calls.length, 1);
    assert.deepEqual(res, { coords });
    assert.ok(pk.hasGeolocation);
    assert.equal(pk.options.coordinates, '48.86,2.29');
    pk.clearGeolocation();
    assert.equal(typeof pk.options.coordinates, 'undefined');
    assert.equal(pk.hasGeolocation, false);
  });
});

// describe('Search', () => {
//   it('throws when args are invalid', () => {
//     expect(() => {
//       const pk = placekit('your-api-key');
//       pk.search(null);
//     }).toThrow(/query/i);

//     expect(() => {
//       const pk = placekit('your-api-key');
//       pk.search('', null);
//     }).toThrow(/opts/i);
//   });

//   it('sends proper request', async () => {
//     fetch.mockResolvedValue({
//       ok: true,
//       status: 200,
//       json: () => ({ results: [] })
//     });
//     const pk = placekit('your-api-key');
//     const res = await pk.search('');
//     expect(fetch).toHaveBeenCalledWith(
//       expect.any(String),
//       expect.objectContaining({
//         method: 'POST',
//         signal: expect.anything(),
//         headers: {
//           'Content-Type': 'application/json; charset=UTF-8',
//           'x-placekit-api-key': 'your-api-key',
//         },
//       })
//     );
//     expect(res.results).toHaveLength(0);
//   });

//   it('sets `x-forwarded-for` header from forwardIP option', async () => {
//     fetch.mockResolvedValue({
//       ok: true,
//       status: 200,
//       json: () => ({ results: [] })
//     });
//     const pk = placekit('your-api-key');
//     const res = await pk.search('', {
//       forwardIP: '0.0.0.0',
//       countryByIP: true,
//     });
//     expect(fetch).toHaveBeenCalledWith(
//       expect.any(String),
//       expect.objectContaining({
//         method: 'POST',
//         signal: expect.anything(),
//         headers: {
//           'Content-Type': 'application/json; charset=UTF-8',
//           'x-placekit-api-key': 'your-api-key',
//           'x-forwarded-for': '0.0.0.0',
//         },
//       })
//     );
//     expect(res.results).toHaveLength(0);
//   });

//   it('retries with next host on timeout', async () => {
//     fetch.mockResolvedValue({
//       ok: true,
//       status: 200,
//       json: () => ({ results: [] })
//     });
//     fetch.mockRejectedValueOnce({ name: 'AbortError' });
//     const pk = placekit('your-api-key');
//     await pk.search('').catch(() => null);
//     expect(fetch).toHaveBeenCalledTimes(1);
//     expect(fetch).toHaveBeenNthCalledWith(
//       1,
//       'https://api.placekit.co/search',
//       expect.anything()
//     );
//   });

//   it('retries with next host on 500', async () => {
//     fetch.mockResolvedValueOnce({
//       ok: false,
//       status: 500,
//     });
//     fetch.mockResolvedValueOnce({
//       ok: true,
//       status: 200,
//       json: () => ({ results: [] }),
//     });
//     const pk = placekit('your-api-key');
//     await pk.search('').catch(() => null);
//     expect(fetch).toHaveBeenCalledTimes(1);
//     expect(fetch).toHaveBeenNthCalledWith(
//       1,
//       'https://api.placekit.co/search',
//       expect.anything()
//     );
//   });

//   it('rejects on 40x', async () => {
//     fetch.mockResolvedValue({
//       ok: false,
//       status: 403,
//       statusText: '',
//       json: () => ({ message: 'An error occured.', errors: [] }),
//     });
//     const pk = placekit('your-api-key');
//     const err = await pk.search('').catch((err) => err);
//     expect(fetch).toHaveBeenCalled();
//     expect(err).toMatchObject({
//       status: 403,
//       statusText: expect.any(String),
//       message: expect.any(String),
//       errors: expect.any(Array),
//     });
//   });
// });

// describe('Reverse', () => {
//   it('throws when args are invalid', () => {
//     expect(() => {
//       const pk = placekit('your-api-key');
//       pk.reverse(null);
//     }).toThrow(/opts/i);
//   });

//   it('sends proper request', async () => {
//     fetch.mockResolvedValue({
//       ok: true,
//       status: 200,
//       json: () => ({ results: [] })
//     });
//     const pk = placekit('your-api-key');
//     const res = await pk.reverse({
//       coordinates: '0,0',
//     });
//     expect(fetch).toHaveBeenCalledWith(
//       expect.any(String),
//       expect.objectContaining({
//         method: 'POST',
//         signal: expect.anything(),
//         headers: {
//           'Content-Type': 'application/json; charset=UTF-8',
//           'x-placekit-api-key': 'your-api-key',
//         },
//       })
//     );
//     expect(res.results).toHaveLength(0);
//   });

//   it('overrides previously set coordinates', async () => {
//     fetch.mockResolvedValue({
//       ok: true,
//       status: 200,
//       json: () => ({ results: [] })
//     });
//     const pk = placekit('your-api-key', {
//       coordinates: '1,1',
//     });
//     const res = await pk.reverse({
//       coordinates: '2,2',
//     });
//     expect(fetch).toHaveBeenCalledWith(
//       expect.any(String),
//       expect.objectContaining({
//         method: 'POST',
//         signal: expect.anything(),
//         headers: {
//           'Content-Type': 'application/json; charset=UTF-8',
//           'x-placekit-api-key': 'your-api-key',
//         },
//         body: expect.stringMatching("\"coordinates\":\"2,2\""),
//       })
//     );
//     expect(res.results).toHaveLength(0);
//   });
// });
