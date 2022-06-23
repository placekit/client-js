const init = ({
  appId,
  apiKey,
  options
}) => {
  const host = '';
  let config = options;

  const instance = (query, params) => {
    return fetch(host, {
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
