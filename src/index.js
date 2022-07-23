const init = ({
  appId,
  apiKey,
  options
}) => {
  const hosts = [
    ''
  ];
  let currentHost = 0;
  let config = options;

  const request = (resource, params) => {
    const controller = new AbortController();
    const id = setTimeout(
      () => controller.abort(),
      config.timeout || 2000
    );
    return fetch(hosts[currentHost], {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      credentials: 'include',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'AppId': appId,
      },
      body: JSON.stringify({
        ...config,
        ...params,
        query: resource,
      }),
    }).then((res) => {
      clearTimeout(id);
      return res.json();
    }).catch((err) => {
      if (err.name === 'AbortError') {
        // change host and retry if timeout
        currentHost++;
        if (currentHost < hosts.length-1) {
          return request(query, params);
        }
      }
      throw err;
    });
  };

  const instance = (resource, params) => {
    return request(resource, params);
  };

  instance.configure = (opts) => {
    config = opts;
  };

  return instance;
};

module.exports = init;
