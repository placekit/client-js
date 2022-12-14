<h1 align="center">
  PlaceKit JS Client
</h1>

<p align="center">
  <b>Location data, search and autocomplete for your apps</b>
</p>

<div align="center">

  [![NPM](https://img.shields.io/npm/v/@placekit/client-js?style=flat-square)](https://www.npmjs.com/package/@placekit/client-js?activeTab=readme)
  [![LICENSE](https://img.shields.io/github/license/placekit/client-js?style=flat-square)](./LICENSE)
  
</div>

<p align="center">
  <a href="#-features">Features</a> • 
  <a href="#-quick-start">Quick start</a> • 
  <a href="#-reference">Reference</a> • 
  <a href="./examples">Examples</a> • 
  <a href="https://placekit.io/developers">Documentation</a> • 
  <a href="#%EF%B8%8F-license">License</a>
</p>

---

PlaceKit JavaScript Client abstracts interactions with our API, making your life easier. We **highly recommend** to use it instead of accessing our API directly.

👉 If you're looking for a full Autocomplete experience, have a look at our standalone [PlaceKit Autocomplete JS library](https://github.com/placekit/autocomplete-js), or check out our [examples](./examples) to learn how to integrate with an existing components library.

## ✨ Features

- **Featherweight**, **zero-dependency** HTTP client
- Works both on the **browser** and **node.js**
- Integrates with **your preferred stack** and autocomplete components (see [examples](./examples))
- **TypeScript** compatible

## 🎯 Quick start

### NPM

First, install PlaceKit JavaScript Client using [npm](https://docs.npmjs.com/getting-started) package manager:

```sh
npm install --save @placekit/client-js
```

Then import the package and perform your first address search:

```js
// CommonJS syntax:
const placekit = require('@placekit/client-js');

// ES6 Modules syntax:
import placekit from '@placekit/client-js';

const pk = placekit('<your-api-key>', {
  //...
});

pk.search('Paris').then((res) => {
  console.log(res.results);
});
```

👉 For advanced usages, check out our [examples](./examples).

### CDN

First, add this line before the closing `</body>` tag in your HTML to import PlaceKit JavaScript Client:

```html
<script src="https://cdn.jsdelivr.net/npm/@placekit/client-js"></script>
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
  import placekit from 'https://cdn.jsdelivr.net/npm/@placekit/client-js@1.0.0-alpha.2/dist/placekit.esm.js';
  const pk = placekit(/* ... */);
  // ...
</script>
```

👉 For advanced usages, check out our [examples](./examples).

## 🧰 Reference

- [`placekit()`](#placekit)
- [`pk.search()`](#pksearch)
- [`pk.options`](#pkoptions)
- [`pk.configure()`](#pkconfigure)
- [`pk.requestGeolocation()`](#pkrequestGeolocation)
- [`pk.hasGeolocation`](#pkhasGeolocation)

### `placekit()`

PlaceKit initialization function returns a PlaceKit client, named `pk` in all examples.

```js
const pk = placekit('<your-api-key>', {
  language: 'en',
  maxResults: 10,
});
```

| Parameter | Type | Description |
| --- | --- | --- |
| `apiKey` | `string` | API key |
| `options` | `key-value mapping` (optional) | Global parameters (see [options](#pkoptions)) |

### `pk.search()`

Performs a search and returns a Promise, which response is a list of results alongside some request metadata.
The options passed as second parameter override the global parameters only for the current query.

```js
pk.search('Paris', { maxResults: 5 }).then((res) => {
  console.log(res.results);
});
```

| Parameter | Type | Description |
| --- | --- | --- |
| `query` | `string` | Search terms |
| `opts` | `key-value mapping` (optional) | Search-specific parameters (see [options](#pkoptions)) |

### `pk.options`

Read-only to access global options persistent across all API calls that are set at initialization and with `pk.configure()`.
Options passed at query time in `pk.search()` override global parameters only for that specific query.

```js
console.log(pk.options); // { "language": "en", "maxResults": 10, ... }
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `maxResults` | `integer?` | `5` | Number of results per page. |
| `language` | `string?` | `undefined` | Language of the results, [two-letter ISO](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) language code. |
| `types` | `string[]?` | `undefined` | Type of results to show. Array of accepted values: `street`, `city`, `country`, `airport`, `bus`, `train`, `townhall`, `tourism`. Prepend `-` to omit a type like `['-bus']`. Unset to return all. |
| `countries` | `string[]?` | `undefined` | Limit results to given countries. Array of [two-letter ISO](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) country codes. |
| `coordinates` | `string?` | `undefined` | Coordinates to search around. Automatically set when calling [`pk.requestGeolocation()`](#pkrequestGeolocation). |

### `pk.configure()`

Updates global parameters. Returns `void`.

```js
pk.configure({
  language: 'fr',
  maxResults: 5,
});
```

| Parameter | Type | Description |
| --- | --- | --- |
| `opts` | `key-value mapping` (optional) | Global parameters (see [options](#pkoptions)) |

### `pk.requestGeolocation()`

Requests device's geolocation (browser-only). Returns a Promise with a [`GeolocationPosition`](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition) object.

```js
pk.requestGeolocation({ timeout: 10000 }).then((pos) => console.log(pos.coords));
```

| Parameter | Type | Description |
| --- | --- | --- |
| `opts` | `key-value mapping` (optional) | `navigator.geolocation.getCurrentPosition` [options](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition) |

The location will be store in the `coordinates` global options, you can still manually override it.

### `pk.hasGeolocation`

Reads if device geolocation is activated or not (read-only).

```js
console.log(pk.hasGeolocation); // true or false
```

## ⚖️ License

PlaceKit JavaScript Client is an open-sourced software licensed under the [MIT license](./LICENSE).
