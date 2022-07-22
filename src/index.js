const fetchWithTimeout = async (resource, options = {}) => {
  const controller = new AbortController();
  const id = setTimeout(
    () => controller.abort(),
    options.timeout || 8000
  );
  const res = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);
  return res;
};

const init = ({
  appId,
  apiKey,
  options
}) => {
  const hosts = [
    ''
  ];
  let config = options;

  const instance = (query, params) => {
    const host = hosts[0];
    return fetchWithTimeout(host, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'AppId': appId,
      },
      body: JSON.stringify({
        ...config,
        ...params,
        query,
      }),
    });
  };

  instance.configure = (opts) => {
    config = opts;
  };

  return instance;
};

module.exports = init;
