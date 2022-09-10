<h1 align="center">
  PlaceKit JS Client
</h1>

<p align="center">
  <b>Location data, search and autocomplete for your apps</b>
</p>

<p align="center">
  <a href="#-features">Features</a> • 
  <a href="#-quick-start">Quick start</a> • 
  <a href="#-reference">Reference</a> • 
  <a href="./examples">Examples</a> • 
  <a href="https://placekit.io/docs">Documentation</a> • 
  <a href="#%EF%B8%8F-license">License</a>
</p>

---

PlaceKit JavaScript Client abstracts interactions with our API, making your life easier. We **highly recommend** to use it instead of accessing our API directly.

## ✨ Features

- **Featherweight**, **zero-dependency** HTTP client
- Works both on the **browser** and **node.js**
- Integrates with **your preferred stack** and autocomplete components (see [examples](./examples))
- **TypeScript** compatible

## 🎯 Quick start

### NPM

First, install PlaceKit JavaScript Client using [npm](https://docs.npmjs.com/getting-started) package manager:

```sh
npm install --save @placekit/placekit-js
```

Then import the package and perform your first address search:

```js
// CommonJS syntax:
const placekit = require('@placekit/placekit-js');

// ES6 Modules syntax:
import placekit from '@placekit/placekit-js';

const pk = placekit('<your-api-key>', {
  //...
});

pk.search('Paris').then((res) => {
  console.log(res.results);
});
```

For advanced usages, visit our [online documentation](https://placekit.io/docs).

### CDN

First, add this line before the closing `</body>` tag in your HTML to import PlaceKit JavaScript Client:

```html
<script src="https://cdn.jsdelivr.net/npm/placekit-js@1.0.0/dist/placekit.umd.js"></script>
```

Then it works the same as the node example above.
After importing the library, `placekit` becomes available as a global:

```html
<script>
  const pk = placekit('<your-api-key>', {
    //...
  });

  pk.search('Paris').then((res) => {
    console.log(res.results);
  });
</script>
```

Or if you are using native ES Modules:

```html
<script type="module">
  import placekit from 'https://cdn.jsdelivr.net/npm/placekit-js@1.0.0/dist/placekit.esm.js';
  const pk = placekit(/* ... */);
  // ...
</script>
```

For the full autocomplete experience, check out our [examples](./examples).

## 🧰 Reference

- [`placekit()`](#placekit)
- [`client.search()`](#clientsearch)
- [`client.options`](#clientoptions)
- [`client.configure()`](#clientconfigure)
- [`client.hasGeolocation`](#clienthasGeolocation)
- [`client.requestGeolocation()`](#clientrequestGeolocation)

### `placekit()`

PlaceKit initialization function returns a PlaceKit client, named `pk` in all examples.

```js
const pk = placekit('<your-api-key>', {
  language: 'en',
  resultsPerPage: 10,
});
```

| Parameter | Type | Description |
| --- | --- | --- |
| `apiKey` | `string` | API key |
| `options` | `key-value mapping` (optional) | Global parameters (see [options](#clientoptions)) |

### `client.search()`

Performs a search and returns a Promise, which response is a list of results alongside some request metadata.
The options passed as second parameter override the global parameters only for the current query.

```js
pk.search('Paris', { resultsPerPage: 5 }).then((res) => {
  console.log(res.results);
});
```

| Parameter | Type | Description |
| --- | --- | --- |
| `query` | `string` | Search terms |
| `opts` | `key-value mapping` (optional) | Search-specific parameters (see [options](#clientoptions)) |

### `client.options`

Read-only to access global options persistent across all API calls that are set at initialization and with `client.configure()`.
Options passed at query time in `client()` override global parameters only for that specific query.

```js
console.log(pk.options); // { "language": "en", "resultsPerPage": 10, ... }
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `language` | `string` | `"default"` | Language of the results, two-letter language code ([ISO-639-1](https://www.google.com/search?client=safari&rls=en&q=iso-639-1&ie=UTF-8&oe=UTF-8)) or `default` |
| `resultsPerPage` | `integer` | `10` | Number of restults per page |

### `client.configure()`

Updates global parameters. Returns `void`.

```js
pk.configure({
  language: 'fr',
  resultsPerPage: 5,
});
```

| Parameter | Type | Description |
| --- | --- | --- |
| `opts` | `key-value mapping` (optional) | Global parameters (see [options](#clientoptions)) |

### `client.hasGeolocation`

Reads if device geolocation is activated or not (read-only).

```js
console.log(pk.hasGeolocation); // true or false
```

### `client.requestGeolocation()`

Requests device's geolocation (browser-only). Returns a Promise with a [`GeolocationPosition`](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition) object.

```js
pk.requestGeolocation(Infinity).then((pos) => console.log(pos.coords));
```

| Parameter | Type | Description |
| --- | --- | --- |
| `timeout` | `integer` (optional) | `navigator.geolocation.getCurrentPosition` [timeout option](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition) |

The location will be store in the `aroundLatLng` global options, you can still manually override it.

## ⚖️ License

PlaceKit JavaScript Client is an open-sourced software licensed under the [MIT license](./LICENSE).
