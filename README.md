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
  countries: ['fr'],
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
<script src="https://cdn.jsdelivr.net/npm/@placekit/client-js@1.1.1/dist/placekit.umd.js"></script>
```

Then it works the same as the node example above.
After importing the library, `placekit` becomes available as a global:

```html
<script>
  const pk = placekit('<your-api-key>', {
    countries: ['fr'],
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
  import placekit from 'https://cdn.jsdelivr.net/npm/@placekit/client-js@1.1.1/dist/placekit.esm.mjs';
  const pk = placekit(/* ... */);
  // ...
</script>
```

👉 For advanced usages, check out our [examples](./examples).

## 🧰 Reference

- [`placekit()`](#placekit)
- [`pk.search()`](#pksearch)
- [`pk.reverse()`](#pkreverse)
- [`pk.options`](#pkoptions)
- [`pk.configure()`](#pkconfigure)
- [`pk.requestGeolocation()`](#pkrequestGeolocation)
- [`pk.clearGeolocation()`](#pkclearGeolocation)
- [`pk.hasGeolocation`](#pkhasGeolocation)
- [`pk.patch.search()`](#pkpatchsearch)
- [`pk.patch.create()`](#pkpatchcreate)
- [`pk.patch.get()`](#pkpatchget)
- [`pk.patch.update()`](#pkpatchupdate)
- [`pk.patch.delete()`](#pkpatchdelete)

### `placekit()`

PlaceKit initialization function returns a PlaceKit client, named `pk` in all examples.

```js
const pk = placekit('<your-api-key>', {
  countries: ['fr'],
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
pk.search('Paris', {
  countries: ['fr'],
  maxResults: 5, 
}).then((res) => {
  console.log(res.results);
});
```

| Parameter | Type | Description |
| --- | --- | --- |
| `query` | `string` | Search terms |
| `opts` | `key-value mapping` (optional) | Search-specific parameters (see [options](#pkoptions)) |

### `pk.reverse()`

Performs a reverse geocoding search and returns a Promise, which response is a list of results alongside some request metadata.
The options passed as first parameter override the global parameters only for the current query.
Any `coordinates` previously set as option would be overriden by the coordinates passed as first argument.

```js
pk.reverse({
  coordinates: '48.871086,2.3036339',
  countries: ['fr'],
  maxResults: 5,
}).then((res) => {
  console.log(res.results);
});
```

| Parameter | Type | Description |
| --- | --- | --- |
| `opts` | `key-value mapping` (optional) | Search-specific parameters (see [options](#pkoptions)) |

**Notes:**
- If you omit `options.coordinates`, it'll use `coordinates` from global parameters set when instanciating with `placekit()` or with `pk.configure()`.
- If no coordinates are found when calling `pk.reverse()`, then it'll use the user's IP approximate coordinates but relevance will be less accurate.
- When calling `pk.reverse()`, the API automatically sets `countryByIP` to `true`. Explicitely set it to `false` to turn it off.
- Calling `pk.reverse()` is the same as calling `pk.search` with an empty query and `countryByIP: true`:

```js
pk.reverse({
  countries: ['fr'],
});

// is the same as:
pk.search('', {
  countryByIP: true,
  countries: ['fr'],
});
```

### `pk.options`

Read-only to access global options persistent across all API calls that are set at initialization and with `pk.configure()`.
Options passed at query time in `pk.search()` override global parameters only for that specific query.

```js
console.log(pk.options); // { "language": "en", "maxResults": 10, ... }
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `maxResults` | `integer?` | `5` | Number of results per page. |
| `language` | `string?` | `undefined` | Preferred language for the results<sup>[(1)](#ft1)</sup>, [two-letter ISO](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) language code. Supported languages are `en` and `fr`. By default the results are displayed in their country's language. |
| `types` | `string[]?` | `undefined` | Type of results to show. Array of accepted values: `street`, `city`, `country`, `airport`, `bus`, `train`, `townhall`, `tourism`. Prepend `-` to omit a type like `['-bus']`. Unset to return all. |
| [`countries`](#%EF%B8%8F-countries-option-is-required) | `string[]?` | `undefined` | Countries to search in, or fallback to if `countryByIP` is `true`. Array of [two-letter ISO](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) country codes<sup>[(1)](#ft1)</sup>. |
| [`countryByIP`](#countryByIP-option) | `boolean?` | `undefined` | Use IP to find user's country (turned off). |
| `forwardIP` | `string?` | `undefined` | Set `x-forwarded-for` header to forward the provided IP for back-end usages (otherwise it'll use the server IP). |
| `coordinates` | `string?` | `undefined` | Coordinates to search around. Automatically set when calling [`pk.requestGeolocation()`](#pkrequestGeolocation). |

<a id="ft1"><b>[1]</b></a>: See [Scope and Limitations](https://placekit.io/terms/scope) for more details.

#### ⚠️ `countries` option is required

The `countries` option is **required** at search time, but we like to keep it optional across all methods so developers remain free on when and how to define it: 
- either when instanciating with `placekit()`,
- with `pk.configure()`,
- or at search time with `pk.search()`.

If `countries` is missing or invalid, you'll get a `422` error, excepted when`types` option is set to `['country']` only.

#### `countryByIP` option

Set `countryByIP` to `true` when you don't know which country users will search addresses in. In that case, the option `countries` will be used as a fallback if the user's country is not supported:

```js
pk.search('123 ave', {
  countryByIP: true, // use user's country, based on their IP
  countries: ['fr', 'be'], // returning results from France and Belgium if user's country is not supported
});
```

### `pk.configure()`

Updates global parameters. Returns `void`.

```js
pk.configure({
  language: 'fr',
  maxResults: 5,
  countries: ['fr'],
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

### `pk.clearGeolocation()`

Clear device's geolocation stored with [`pk.requestGeolocation`](#pkrequestGeolocation).

```js
pk.clearGeolocation();
```

The global option `coordinates` will be deleted and `pk.hasGeolocation` will be set to `false`.

### `pk.hasGeolocation`

Reads if device geolocation is activated or not (read-only).

```js
console.log(pk.hasGeolocation); // true or false
```

### `pk.patch.search()`

List, filter and paginate patches.

```js
// get all patches, paginated
pk.patch.search().then((res) => {
  console.log(res.results);
});

// filter and paginate patches
pk.patch.search('angeles', {
  countries: ['us'],
  types: ['street'],
  status: 'approved',
  maxResults: 10,
  offset: 0,
}).then((res) => {
  console.log(res.results);
});
```

| Parameter | Type | Description |
| --- | --- | --- |
| `query` | `string?` | Search query terms. |
| `opts` | `key-value mapping` (optional) | Search options. |
| `opts.status` | `('all' | 'pending' | 'approved')?` | Publication status. |
| `opts.countries` | `string[]?` | Countries filter, array of [two-letter ISO](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) country codes. |
| `opts.types` | `string[]?` | Types filter, array of accepted values: `street`, `city`, `airport`, `bus`, `train`, `townhall`, `tourism`. Prepend `-` to omit a type like `['-bus']`. Unset to return all. |
| `opts.maxResults` | `number?` | Maximum number of results to return. |
| `opts.offset` | `number?` | Paginate results starting from the offset. |

### `pk.patch.create()`

Add a missing record or fix an existing one.

```js
// Adding a missing record
const record = {
  type: 'street',
  name: 'Example street',
  city: 'Los Angeles',
  county: 'Los Angeles',
  administrative: 'California',
  country: 'United States of America',
  countrycode: 'us',
  coordinates: '33.9955095,-118.472482',
  zipcode: [90291],
  population: 3849000, // optional
};
pk.patch.create(record, { status: 'approved' }).then((record) => {
  console.log(record);
});

// Fixing an existing record
pk.patch.create(
  { population: 3849000 },
  originalRecord, // original record from `pk.search` or `pk.reverse`
  { status: 'approved' }
).then((record) => {
  console.log(record);
});
```

| Parameter | Type | Description |
| --- | --- | --- |
| `update` | `key-value mapping` | Full record if adding, only updated fields if fixing. |
| `update.type` | `string` | One of `airport`, `bus`, `city`, `street`, `tourism`, `townhall`, `train`. |
| `update.name` | `string` | Record display name (street name, city name, station name...). |
| `update.city` | `string` | Record city name. |
| `update.county` | `string` | Record county/province/department. |
| `update.administrative` | `string` | Record administrative/region/state. |
| `update.country` | `string` | Record country name. |
| `update.countrycode` | `string` | Record [two-letter ISO](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) country code. |
| `update.coordinates` | `string` | Record coordinates in format `lat,lng`. |
| `update.zipcode` | `string[]` | Record postal/zip code(s). |
| `update.population` | `number?` | Record population of its city. |
| `origin` | `key-value mapping` (optional) | Original (and complete) record to fix, from `pk.search()` or `pk.reverse()`. |
| `opts` | `key-value mapping` (optional) | Patch options. |
| `opts.status` | `('pending' | 'approved')?` | Publication status. |
| `opts.language` | `string?` | Target language, [two-letter ISO](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) language code. |

### `pk.patch.get()`

Retrieve a patch record by ID.

```js
pk.patch.get('<patch-id>').then((record) => {
  console.log(record);
});
```

| Parameter | Type | Description |
| --- | --- | --- |
| `id` | `string` | Record ID. |

### `pk.patch.update()`

Update a patch record.

```js
// update and publish
pk.patch.update(
  '<patch-id>',
  { coordinates: '33.9955095,-118.472482' },
  { status: 'approved' }
).then((record) => {
  console.log(record);
});

// update translation
pk.patch.update(
  '<patch-id>',
  { name: 'Rue exemple' }, 
  { language: 'fr' }
).then((record) => {
  console.log(record);
});

// unpublish
pk.patch.update(
  '<patch-id>',
  undefined,
  { status: "pending" }
).then((record) => {
  console.log(record);
});
```

| Parameter | Type | Description |
| --- | --- | --- |
| `id` | `string` | Record ID. |
| `update` | `key-value mapping` (optional) | Updated fields. |
| `update.type` | `string` | One of `airport`, `bus`, `city`, `street`, `tourism`, `townhall`, `train`. |
| `update.name` | `string` | Record display name (street name, city name, station name...). |
| `update.city` | `string` | Record city name. |
| `update.county` | `string` | Record county/province/department. |
| `update.administrative` | `string` | Record administrative/region/state. |
| `update.country` | `string` | Record country name. |
| `update.countrycode` | `string` | Record [two-letter ISO](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) country code. |
| `update.coordinates` | `string` | Record coordinates in format `lat,lng`. |
| `update.zipcode` | `string[]` | Record postal/zip code(s). |
| `update.population` | `number?` | Record population of its city. |
| `opts` | `key-value mapping` (optional) | Patch options. |
| `opts.status` | `('pending' | 'approved')?` | Publication status. |
| `opts.language` | `string?` | Target language, [two-letter ISO](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) language code. |

### `pk.patch.delete()`

Delete a patch record or a patch translation.

```js
// delete patch translation
await pk.patch.delete('<patch-id>', 'fr');

// delete whole patch
await pk.patch.delete('<patch-id>');
```

| Parameter | Type | Description |
| --- | --- | --- |
| `id` | `string` | Record ID. |
| `language` | `string?` | Language to unset, [two-letter ISO](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) language code. |

## ⚖️ License

PlaceKit JavaScript Client is an open-sourced software licensed under the [MIT license](./LICENSE).
