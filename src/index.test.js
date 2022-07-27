const placekit = require('./index.js');

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Initialize', () => {
  test('should warn if appId or apiKey is missing', () => {
    const warnSpy = jest.spyOn(console, 'warn');
    placekit();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/appId/i));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/apiKey/i));
  });

  test('should warn if appId or apiKey is empty', () => {
    const warnSpy = jest.spyOn(console, 'warn');
    placekit({
      appId: '',
      apiKey: '',
    });
    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/appId/i));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/apiKey/i));
  });

  it('should throw if appId is invalid', () => {
    expect(() => {
      placekit({
        appId: 3,
      });
    }).toThrow(/appId/i);
  });

  it('should throw if apiKey is invalid', () => {
    expect(() => {
      placekit({
        appId: 'your-app-id',
        apiKey: [],
      });
    }).toThrow(/apiKey/i);
  });

  test('should return instance if parameters are valid', () => {
    const warnSpy = jest.spyOn(console, 'warn');
    const pkSearch = placekit({
      appId: 'your-app-id',
      apiKey: 'your-api-key',
    });
    expect(typeof pkSearch).toBe('function');
    expect(typeof pkSearch.configure).toBe('function');
    expect(typeof pkSearch.requestGeolocation).toBe('function');
    expect(warnSpy).not.toHaveBeenCalled();
  });
});

describe('Configure', () => {
});

describe('Request Geolocation', () => {
});

describe('Search', () => {
});
