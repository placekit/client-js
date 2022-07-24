const placekit = ({
  appId,
  apiKey,
  options = {}
}) => {
  // declare hosts cascade for the retry strategy
  const hosts = [
    `https://${appId}.algolia.net/1/indexes/flowable-open-source/query`,
    `https://${appId}-dsn.algolia.net/1/indexes/flowable-open-source/query`,
    `https://${appId}-1.algolianet.com/1/indexes/flowable-open-source/query`,
    `https://${appId}-2.algolianet.com/1/indexes/flowable-open-source/query`,
    `https://${appId}-3.algolianet.com/1/indexes/flowable-open-source/query`,
  ];
  let currentHost = 0;
  let config = {};

  // TODO: remove this helper, should happen server-side
  const getLangAttr = (value, lang) => {
    return value[lang] || value.default;
  };

  const instance = (query, params) => {
    // TODO: keep action and language in globalParams to forward to server
    const { language, timeout, ...globalParams } = config;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout || 2000);
    return fetch(hosts[currentHost], {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Algolia-Application-Id': appId,
        'X-Algolia-API-Key': apiKey,
      },
      body: JSON.stringify({
        ...globalParams,
        ...params,
        query,
      }),
    }).then((res) => {
      clearTimeout(id);
      if (!res.ok) {
        throw ({
          status: res.status,
          statusText: res.statusText,
        });
      }
      return res.json();
    }).then((res) => {
      // TODO: move records remapping server-side
      return {
        ...res,
        hits: res.hits.map((item) => ({
          name: getLangAttr(item.name, language)[0],
          zipcode: item.zipcode[0],
          county: getLangAttr(item.county, language)[0],
          country: getLangAttr(item.country, language)[0],
        })),
      };
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

  instance.configure = (opts = {}) => {
    config = opts;

    // set language from user perference
    if (!config.language) {
      config.language = typeof window !== 'undefined' && window.navigator.language ?
        window.navigator.language.replace(/-\w+$/, '') :
        'default';
    }

    // TODO: type-check all options
  };

  // set global configuration
  instance.configure(options);
  return instance;
};

module.exports = placekit;
