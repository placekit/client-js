/**
 * @jest-environment jsdom
 */

require('jest-fetch-mock').enableMocks();

const mockGeolocation = {
  getCurrentPosition: jest.fn(),
};
global.navigator.geolocation = mockGeolocation;

const placekit = require('./index.js');

beforeEach(() => {
  jest.restoreAllMocks();
  mockGeolocation.getCurrentPosition.mockReset();
  fetch.resetMocks();
});

describe('Initialize', () => {
  it('warns when appId or apiKey is missing', () => {
    const warnSpy = jest.spyOn(console, 'warn');
    placekit();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/appId/i));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/apiKey/i));
  });

  it('warns when appId or apiKey is empty', () => {
    const warnSpy = jest.spyOn(console, 'warn');
    placekit({
      appId: '',
      apiKey: '',
    });
    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/appId/i));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/apiKey/i));
  });

  it('throws when appId or apiKey is invalid', () => {
    expect(() => {
      placekit({
        appId: null,
      });
    }).toThrow(/appId/i);

    expect(() => {
      placekit({
        appId: 'your-app-id',
        apiKey: null,
      });
    }).toThrow(/apiKey/i);
  });

  test('returns client when parameters are valid', () => {
    const warnSpy = jest.spyOn(console, 'warn');
    const pk = placekit({
      appId: 'your-app-id',
      apiKey: 'your-api-key',
    });
    expect(typeof pk.search).toBe('function');
    expect(typeof pk.configure).toBe('function');
    expect(typeof pk.requestGeolocation).toBe('function');
    expect(typeof pk.requestGeolocation).toBe('function');
    pk.options = 'invalid'; // should be read-only
    expect(typeof pk.options).toBe('object');
    pk.hasGeolocation = true; // should be read-only
    expect(pk.hasGeolocation).toBeFalsy();
    expect(warnSpy).not.toHaveBeenCalled();
  });
});

describe('Configure', () => {
  it('throws when args are invalid', () => {
    expect(() => {
      const pk = placekit({
        appId: 'your-app-id',
        apiKey: 'your-api-key',
      });
      pk.configure('invalid');
    }).toThrow(/opts/i);
  });

  it('updates and sanitizes global options', () => {
    const pk = placekit({
      appId: 'your-app-id',
      apiKey: 'your-api-key',
    });
    pk.configure({
      retryTimeout: -100,
      language: 'FR',
      resultsPerPage: -100,
    });
    expect(pk.options).toMatchObject({
      retryTimeout: 0,
      language: 'fr',
      resultsPerPage: 0,
    });
  });
});

describe('Request Geolocation', () => {
  it('throws when args are invalid', () => {
    expect(() => {
      const pk = placekit({
        appId: 'your-app-id',
        apiKey: 'your-api-key',
      });
      pk.requestGeolocation('invalid');
    }).toThrow(/timeout/i);
  });

  it('denies geolocation', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation(
      (_success, error) => Promise.resolve(error({
        code: 1,
        message: '',
      }))
    );
    const pk = placekit({
      appId: 'your-app-id',
      apiKey: 'your-api-key',
    });
    const err = await pk.requestGeolocation().catch((err) => err);
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    expect(err).toBeInstanceOf(Error);
    expect(pk.hasGeolocation).toBeFalsy();
  });

  it('provides geolocation', async () => {
    const coords = {
      latitude: 48.86,
      longitude: 2.29,
    };
    mockGeolocation.getCurrentPosition.mockImplementation(
      (success) => Promise.resolve(success({ coords }))
    );
    const pk = placekit({
      appId: 'your-app-id',
      apiKey: 'your-api-key',
    });
    const res = await pk.requestGeolocation().catch((err) => err);
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    expect(res).toMatchObject({ coords });
    expect(pk.hasGeolocation).toBeTruthy();
  });
});

describe('Search', () => {
  it('throws when args are invalid', () => {
    expect(() => {
      const pk = placekit({
        appId: 'your-app-id',
        apiKey: 'your-api-key',
      });
      pk.search(null);
    }).toThrow(/query/i);

    expect(() => {
      const pk = placekit({
        appId: 'your-app-id',
        apiKey: 'your-api-key',
      });
      pk.search('', null);
    }).toThrow(/opts/i);
  });

  it('sends proper request', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => ({ results: [] })
    });
    const pk = placekit({
      appId: 'your-app-id',
      apiKey: 'your-api-key',
    });
    const res = await pk.search('');
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        signal: expect.anything(),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'x-app-id': 'your-app-id',
          'x-api-key': 'your-api-key',
        },
      })
    );
    expect(res.results).toHaveLength(0);
  });

  it('retries with next host on timeout', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => ({ results: [] })
    });
    fetch.mockRejectedValueOnce({ name: 'AbortError' });
    const pk = placekit({
      appId: 'your-app-id',
      apiKey: 'your-api-key',
    });
    await pk.search('').catch(() => null);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      'https://placekitgateway-7j80cxkd.ew.gateway.dev/search',
      expect.anything()
    );
  });

  it('retries with next host on 500', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => ({ results: [] })
    });
    const pk = placekit({
      appId: 'your-app-id',
      apiKey: 'your-api-key',
    });
    await pk.search('').catch(() => null);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      'https://placekitgateway-7j80cxkd.ew.gateway.dev/search',
      expect.anything()
    );
  });

  it('rejects on 40x', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 403,
      statusText: '',
    });
    const pk = placekit({
      appId: 'your-app-id',
      apiKey: 'your-api-key',
    });
    const err = await pk.search('').catch((err) => err);
    expect(fetch).toHaveBeenCalled();
    expect(err).toMatchObject({
      status: 403,
      statusText: expect.any(String),
    });
  });
});
