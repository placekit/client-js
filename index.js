const init = (options) => {
  const host = '';
  const config = {
    ...options,
  };

  return (req, options) => {
    const url = new URL(req, host);

    return fetch(url, {
      config,
      ...options,
      method: 'POST',
    });
  };
};