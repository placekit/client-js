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
    const pkClient = placekit({
      appId: 'your-app-id',
      apiKey: 'your-api-key',
    });
    expect(typeof pkClient.search).toBe('function');
    expect(typeof pkClient.configure).toBe('function');
    expect(typeof pkClient.requestGeolocation).toBe('function');
    expect(typeof pkClient.requestGeolocation).toBe('function');
    pkClient.options = 'invalid'; // should be read-only
    expect(typeof pkClient.options).toBe('object');
    pkClient.hasGeolocation = true; // should be read-only
    expect(pkClient.hasGeolocation).toBeFalsy();
    expect(warnSpy).not.toHaveBeenCalled();
  });
});

describe('Configure', () => {
  it('throws when args are invalid', () => {
    expect(() => {
      const pkClient = placekit({
        appId: 'your-app-id',
        apiKey: 'your-api-key',
      });
      pkClient.configure('invalid');
    }).toThrow(/opts/i);
  });

  it('updates and sanitizes global options', () => {
    const pkClient = placekit({
      appId: 'your-app-id',
      apiKey: 'your-api-key',
    });
    pkClient.configure({
      retryTimeout: -100,
      language: 'FR',
      hitsPerPage: -100,
    });
    expect(pkClient.options).toMatchObject({
      retryTimeout: 0,
      language: 'fr',
      hitsPerPage: 0,
    });
  });
});

describe('Request Geolocation', () => {
  it('throws when args are invalid', () => {
    expect(() => {
      const pkClient = placekit({
        appId: 'your-app-id',
        apiKey: 'your-api-key',
      });
      pkClient.requestGeolocation('invalid');
    }).toThrow(/timeout/i);
  });

  it('denies geolocation', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation(
      (_success, error) => Promise.resolve(error({
        code: 1,
        message: '',
      }))
    );
    const pkClient = placekit({
      appId: 'your-app-id',
      apiKey: 'your-api-key',
    });
    const err = await pkClient.requestGeolocation().catch((err) => err);
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    expect(err).toBeInstanceOf(Error);
    expect(pkClient.hasGeolocation).toBeFalsy();
  });

  it('provides geolocation', async () => {
    const coords = {
      latitude: 48.86,
      longitude: 2.29,
    };
    mockGeolocation.getCurrentPosition.mockImplementation(
      (success) => Promise.resolve(success({ coords }))
    );
    const pkClient = placekit({
      appId: 'your-app-id',
      apiKey: 'your-api-key',
    });
    const res = await pkClient.requestGeolocation().catch((err) => err);
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    expect(res).toMatchObject({ coords });
    expect(pkClient.hasGeolocation).toBeTruthy();
  });
});

describe('Search', () => {
  it('throws when args are invalid', () => {
    expect(() => {
      const pkClient = placekit({
        appId: 'your-app-id',
        apiKey: 'your-api-key',
      });
      pkClient.search(null);
    }).toThrow(/query/i);

    expect(() => {
      const pkClient = placekit({
        appId: 'your-app-id',
        apiKey: 'your-api-key',
      });
      pkClient.search('', null);
    }).toThrow(/opts/i);
  });

  it('sends proper request', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => ({ hits: [] })
    });
    const pkClient = placekit({
      appId: 'your-app-id',
      apiKey: 'your-api-key',
    });
    const res = await pkClient.search('');
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        signal: expect.anything(),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Algolia-Application-Id': 'your-app-id',
          'X-Algolia-API-Key': 'your-api-key',
        },
      })
    );
    expect(res.hits).toHaveLength(0);
  });

  it('retries with next host on timeout', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => ({ hits: [] })
    });
    fetch.mockRejectedValueOnce({ name: 'AbortError' });
    const pkClient = placekit({
      appId: 'your-app-id',
      apiKey: 'your-api-key',
    });
    await pkClient.search('');
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      'https://your-app-id.algolia.net/1/indexes/flowable-open-source/query',
      expect.anything()
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      'https://your-app-id-dsn.algolia.net/1/indexes/flowable-open-source/query',
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
      json: () => ({ hits: [] })
    });
    const pkClient = placekit({
      appId: 'your-app-id',
      apiKey: 'your-api-key',
    });
    await pkClient.search('');
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      'https://your-app-id.algolia.net/1/indexes/flowable-open-source/query',
      expect.anything()
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      'https://your-app-id-dsn.algolia.net/1/indexes/flowable-open-source/query',
      expect.anything()
    );
  });

  it('rejects on 40x', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 403,
      statusText: '',
    });
    const pkClient = placekit({
      appId: 'your-app-id',
      apiKey: 'your-api-key',
    });
    const err = await pkClient.search('').catch((err) => err);
    expect(fetch).toHaveBeenCalled();
    expect(err).toMatchObject({
      status: 403,
      statusText: expect.any(String),
    });
  });
});
