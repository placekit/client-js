const placekit = ({
  appId,
  apiKey,
  options
}) => {
  const hosts = [
    `https://${appId}.algolia.net/1/indexes/flowable-open-source/query`,
    `https://${appId}-dsn.algolia.net/1/indexes/flowable-open-source/query`,
    `https://${appId}-1.algolianet.com/1/indexes/flowable-open-source/query`,
    `https://${appId}-2.algolianet.com/1/indexes/flowable-open-source/query`,
    `https://${appId}-3.algolianet.com/1/indexes/flowable-open-source/query`,
  ];
  let currentHost = 0;
  let config = options || {};

  const request = (query, params) => {
    const controller = new AbortController();
    const id = setTimeout(
      () => controller.abort(),
      config.timeout || 2000
    );
    return fetch(hosts[currentHost], {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Algolia-Application-Id': appId,
        'X-Algolia-API-Key': apiKey,
      },
      body: JSON.stringify({
        ...config,
        ...params,
        query,
      }),
    }).then((res) => {
      clearTimeout(id);
      if (!res.ok) {
        throw({
          status: res.status,
          statusText: res.statusText,
        });
      }
      return res.json();
    }).then((res) => {
      return res.hits.map((item) => {
        return item;
      });
    }).catch((err) => {
      if (err.name === 'AbortError' || (err.status && err.status >= 500)) {
        // change host and retry if timeout or 50x
        currentHost++;
        if (currentHost < hosts.length-1) {
          return request(query, params);
        }
      }
      throw err;
    });
  };

  const instance = {};
  
  instance.search = (query, params) => {
    return request(query, params);
  };

  instance.configure = (opts) => {
    config = opts;
  };

  return instance;
};

module.exports = placekit;
