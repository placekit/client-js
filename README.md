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
  <a href="#%EF%B8%8F-license">License</a> • 
  <a href="https://github.com/placekit/examples">Examples</a>
</p>

---

PlaceKit JavaScript Client abstracts interactions with our API, making your life easier. We **highly recommend** to use it instead of accessing our API directly.

👉 If you're looking for a full Autocomplete experience, have a look at our standalone [PlaceKit Autocomplete JS library](https://github.com/placekit/autocomplete-js), or check out our [examples](https://github.com/placekit/examples) to learn how to integrate with an existing components library.

## ✨ Features

- **Featherweight**, **zero-dependency** HTTP client
- Works both on the **browser** and **node.js**
- Integrates with **your preferred stack** and autocomplete components (see [examples](https://github.com/placekit/examples))
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
const placekit = require("@placekit/client-js/lite");

// ES6 Modules syntax:
import placekit from "@placekit/client-js/lite";

const pk = placekit("<your-api-key>", {
  //...
});

pk.search("Paris").then((res) => {
  console.log(res.results);
});
```

👉 **Check out our [examples](https://github.com/placekit/examples) for different use cases and advance usages!**

### CDN

First, add this line before the closing `</body>` tag in your HTML to import PlaceKit JavaScript Client:

```html
<script src="https://cdn.jsdelivr.net/npm/@placekit/client-js@2.3.0/dist/placekit-lite.umd.js"></script>
```

Then it works the same as the node example above.
After importing the library, `placekit` becomes available as a global:

```html
<script>
  const pk = placekit("<your-api-key>", {
    //...
  });

  pk.search("Paris").then((res) => {
    console.log(res.results);
  });
</script>
```

Or if you are using native ES Modules:

```html
<script type="module">
  import placekit from "https://cdn.jsdelivr.net/npm/@placekit/client-js@2.3.0/dist/placekit-lite.js";
  const pk = placekit(/* ... */);
  // ...
</script>
```

## 🧰 Reference

PlaceKit Client JS exports two versions of the client:

| Version      | Path                       | Methods        | Modules       |
| ------------ | -------------------------- | -------------- | ------------- |
| **Lite**     | `@placekit/client-js/lite` | Search methods | ESM, CJS, UMD |
| **Extended** | `@placekit/client-js`      | All methods    | ESM, CJS      |

- Lite version has an optimized bundle size for the browser, but works also in the back-end.
- Extended version methods require a **private** API key that you should never expose to the browser–it is intended for the back-end only.

---

- [`placekit()`](#placekit)

Lite and Extended:

- [`pk.search()`](#pksearch)
- [`pk.reverse()`](#pkreverse)
- [`pk.options`](#pkoptions)
- [`pk.configure()`](#pkconfigure)
- [`pk.requestGeolocation()`](#pkrequestGeolocation)
- [`pk.clearGeolocation()`](#pkclearGeolocation)
- [`pk.hasGeolocation`](#pkhasGeolocation)

Extended-only:

- [`pk.patch.list()`](#pkpatchlist)
- [`pk.patch.create()`](#pkpatchcreate)
- [`pk.patch.get()`](#pkpatchget)
- [`pk.patch.update()`](#pkpatchupdate)
- [`pk.patch.delete()`](#pkpatchdelete)
- [`pk.patch.deleteLang()`](#pkpatchdeleteLang)
- [`pk.keys.list()`](#pkkeyslist)
- [`pk.keys.create()`](#pkkeyscreate)
- [`pk.keys.get()`](#pkkeysget)
- [`pk.keys.update()`](#pkkeysupdate)
- [`pk.keys.delete()`](#pkkeysdelete)

---

### `placekit()`

PlaceKit initialization function returns a PlaceKit client, named `pk` in all snippets below.

```js
// Lite version, CommonJS syntax:
const placekit = require("@placekit/client-js/lite");

// Lite version, ES6 Modules syntax:
import placekit from "@placekit/client-js/lite";

// Extended version, CommonJS syntax:
const placekit = require("@placekit/client-js");

// Extended version, ES6 Modules syntax:
import placekit from "@placekit/client-js";

// Initialize PlaceKit client
const pk = placekit("<your-api-key>", {
  countries: ["fr"],
  language: "en",
  maxResults: 10,
});
```

| Parameter | Type                           | Description                                    |
| --------- | ------------------------------ | ---------------------------------------------- |
| `apiKey`  | `string`                       | API key                                        |
| `options` | `key-value mapping` (optional) | Global parameters (see [options](#pkoptions)). |

### `pk.search()`

Performs a search and returns a Promise, which response is a list of results alongside some request metadata.
The options passed as second parameter override the global parameters only for the current query.

```js
pk.search("Paris", {
  countries: ["fr"],
  maxResults: 5,
}).then((res) => {
  console.log(res.results);
});
```

| Parameter | Type                           | Description                                             |
| --------- | ------------------------------ | ------------------------------------------------------- |
| `query`   | `string`                       | Search terms                                            |
| `opts`    | `key-value mapping` (optional) | Search-specific parameters (see [options](#pkoptions)). |

### `pk.reverse()`

Performs a reverse geocoding search and returns a Promise, which response is a list of results alongside some request metadata.
The options passed as first parameter override the global parameters only for the current query.
Any `coordinates` previously set as option would be overriden by the coordinates passed as first argument.

```js
pk.reverse({
  coordinates: "48.871086,2.3036339",
  countries: ["fr"],
  maxResults: 5,
}).then((res) => {
  console.log(res.results);
});
```

| Parameter | Type                           | Description                                             |
| --------- | ------------------------------ | ------------------------------------------------------- |
| `opts`    | `key-value mapping` (optional) | Search-specific parameters (see [options](#pkoptions)). |

**Notes:**

- If you omit `options.coordinates`, it'll use `coordinates` from global parameters set when instanciating with `placekit()` or with `pk.configure()`.

### `pk.options`

Read-only to access global options persistent across all API calls that are set at initialization and with `pk.configure()`.
Options passed at query time in `pk.search()` override global parameters only for that specific query.

```js
console.log(pk.options); // { "language": "en", "maxResults": 10, ... }
```

| Option        | Type        | Default     | Description                                                                                                                                                                                                                                               |
| ------------- | ----------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `countries`   | `string[]?` | `undefined` | Countries to search in, default to current IP country. Array of [two-letter ISO](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) country codes<sup>[(1)](#ft1)</sup>.                                                                                   |
| `language`    | `string?`   | `undefined` | Preferred language for the results<sup>[(1)](#ft1)</sup>, [two-letter ISO](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) language code. Supported languages are `en` and `fr`. By default the results are displayed in their country's language. |
| `types`       | `string[]?` | `undefined` | Type of results to show. Array of accepted values: `street`, `city`, `country`, `administrative`, `airport`, `bus`, `county`, `train`, `townhall`, `tourism`. Prepend `-` to omit a type like `['-bus']`. Unset to return all.                                                        |
| `maxResults`  | `integer?`  | `5`         | Number of results per page.                                                                                                                                                                                                                               |
| `coordinates` | `string?`   | `undefined` | Coordinates to search around. Automatically set when calling [`pk.requestGeolocation()`](#pkrequestGeolocation).                                                                                                                                          |
| `forwardIP`   | `string?`   | `undefined` | Set `x-forwarded-for` header to forward the provided IP for back-end usages (otherwise it'll use the server IP).                                                                                                                                          |

<a id="ft1"><b>[1]</b></a>: See [Coverage](https://placekit.io/terms/coverage) for more details.

### `pk.configure()`

Updates global parameters. Returns `void`.

```js
pk.configure({
  language: "fr",
  maxResults: 5,
});
```

| Parameter | Type                           | Description                                   |
| --------- | ------------------------------ | --------------------------------------------- |
| `opts`    | `key-value mapping` (optional) | Global parameters (see [options](#pkoptions)) |

### `pk.requestGeolocation()`

Requests device's geolocation (browser-only). Returns a Promise with a [`GeolocationPosition`](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition) object.

```js
pk.requestGeolocation({ timeout: 10000 }).then((pos) =>
  console.log(pos.coords)
);
```

| Parameter | Type                           | Description                                                                                                                            |
| --------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `opts`    | `key-value mapping` (optional) | `navigator.geolocation.getCurrentPosition` [options](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition). |

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

### `pk.patch.list()`

⚠️ Restricted to **private** API keys, **do NOT expose the private key to the browser**.

List, filter and paginate patch records.

```js
// get all patches, paginated
pk.patch.list().then((res) => {
  console.log(res.results);
});

// filter and paginate patches
pk.patch
  .list({
    status: "approved",
    maxResults: 10,
    offset: 10,
  })
  .then((res) => {
    console.log(res.results);
  });
```

| Parameter         | Type                                | Description                                                                                                                                                        |
| ----------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `opts`            | `key-value mapping` (optional) | Search options.                                                                                                                                                              |
| `opts.status`     | `('pending' \| 'approved')?`   | Publication status.                                                                                                                                                          |
| `opts.query`      | `string?`                      | Terms filter.                                                                                                                                                                |
| `opts.countries`  | `string[]?`                    | Countries filter, array of [two-letter ISO](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) country codes.                                                                 |
| `opts.types`      | `string[]?`                    | Types filter, array of accepted values: `street`, `city`, `administrative`, `airport`, `bus`, `county`, `train`, `townhall`, `tourism`. Prepend `-` to omit a type like `['-bus']`. Unset to return all. |
| `opts.language`   | `string?`                      | `undefined`                                                                                                                                                                  | Preferred language for the results, [two-letter ISO](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) language code. |
| `opts.maxResults` | `number?`                      | Maximum number of results to return.                                                                                                                                         |
| `opts.offset`     | `number?`                      | Paginate results starting from the offset.                                                                                                                                   |

#### Patch Record `status` explained

- `pending`: only available through Live Patching endpoints,
- `approved`: available to end-users through Search endpoints.

### `pk.patch.create()`

⚠️ Restricted to **private** API keys, **do NOT expose the private key to the browser**.

Add a missing location or fix an existing one.

```js
// Adding a missing location
const record = {
  type: 'street',
  name: 'New street',
  city: 'Los Angeles',
  county: 'Los Angeles',
  administrative: 'California',
  country: 'United States of America',
  countrycode: 'us',
  coordinates: '33.9955095,-118.472482',
  zipcode: ['90291'],
  population: 3849000,
};
pk.patch.create(record, { status: 'approved' }).then((record) => {
  console.log(record);
});

// Fixing an existing location
pk.patch.create(
  { population: 3849000 },
  { status: 'approved' }
  originalRecord, // original record from `pk.search` or `pk.reverse`
).then((record) => {
  console.log(record);
});
```

| Parameter               | Type                           | Description                                                                                                                     |
| ----------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `update`                | `key-value mapping`            | Full patch record if adding, at least one property if fixing.                                                                   |
| `update.type`           | `string`                       | Record type, one of `administrative`, `airport`, `bus`, `city`, `county`, `street`, `tourism`, `townhall`, `train`.                                         |
| `update.name`           | `string`                       | Record display name (street name, city name, station name...).                                                                  |
| `update.city`           | `string`                       | Record city name.                                                                                                               |
| `update.county`         | `string` (optional)            | Record county/province/department.                                                                                              |
| `update.administrative` | `string` (optional)            | Record administrative/region/state.                                                                                             |
| `update.country`        | `string`                       | Record country name.                                                                                                            |
| `update.countrycode`    | `string`                       | Record [two-letter ISO](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) country code.                                         |
| `update.coordinates`    | `string`                       | Record coordinates in format `lat,lng`.                                                                                         |
| `update.zipcode`        | `string[]`                     | Record postal/zip code(s).                                                                                                      |
| `update.population`     | `number`                       | Record population of its city.                                                                                                  |
| `opts`                  | `key-value mapping` (optional) | Patch record options.                                                                                                           |
| `opts.status`           | `('pending' \| 'approved')?`   | Record status.                                                                                                                  |
| `opts.language`         | `string?`                      | Language in which the record is written, [two-letter ISO](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) language code. |
| `origin`                | `key-value mapping` (optional) | Original (and complete) record to fix, from `pk.search()` or `pk.reverse()`.                                                    |

#### Patch Record `language` explained

Language is always considered as "preferred display language", which means:

- If you omit `opts.language`, then details will be set in the `default` language.
- If the patch record has a translation but no `default`, then the first available translation will be used as default.
- If the patch record misses some translation, it will show the default value for non-translated properties.

### `pk.patch.get()`

⚠️ Restricted to **private** API keys, **do NOT expose the private key to the browser**.

Retrieve a patch record by ID.

```js
// get record default language
pk.patch.get("<patch-id>").then((record) => {
  console.log(record);
});

// get record FR translation
pk.patch.get("<patch-id>", "fr").then((record) => {
  console.log(record);
});
```

| Parameter  | Type      | Description                                                                                             |
| ---------- | --------- | ------------------------------------------------------------------------------------------------------- |
| `id`       | `string`  | Record ID.                                                                                              |
| `language` | `string?` | Language to get, [two-letter ISO](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) language code. |

### `pk.patch.update()`

⚠️ Restricted to **private** API keys, **do NOT expose the private key to the browser**.

Update a patch record.

```js
// update and publish
pk.patch
  .update(
    "<patch-id>",
    { coordinates: "33.9955095,-118.472482" },
    { status: "approved" }
  )
  .then((record) => {
    console.log(record);
  });

// update translation
pk.patch
  .update("<patch-id>", { name: "Rue Nouvelle" }, { language: "fr" })
  .then((record) => {
    console.log(record);
  });

// unpublish
pk.patch
  .update("<patch-id>", undefined, { status: "pending" })
  .then((record) => {
    console.log(record);
  });
```

| Parameter               | Type                           | Description                                                                                             |
| ----------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `id`                    | `string`                       | Record ID.                                                                                              |
| `update`                | `key-value mapping` (optional) | Updated fields, at least one property must be set if defined.                                           |
| `update.type`           | `string`                       | One of `administrative`, `airport`, `bus`, `city`, `county`, `street`, `tourism`, `townhall`, `train`.                              |
| `update.name`           | `string`                       | Record display name (street name, city name, station name...).                                          |
| `update.city`           | `string`                       | Record city name.                                                                                       |
| `update.county`         | `string` (optional)            | Record county/province/department.                                                                      |
| `update.administrative` | `string` (optional)            | Record administrative/region/state.                                                                     |
| `update.country`        | `string`                       | Record country name.                                                                                    |
| `update.countrycode`    | `string`                       | Record [two-letter ISO](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) country code.                 |
| `update.coordinates`    | `string`                       | Record coordinates in format `lat,lng`.                                                                 |
| `update.zipcode`        | `string[]`                     | Record postal/zip code(s).                                                                              |
| `update.population`     | `number`                       | Record population of its city.                                                                          |
| `opts`                  | `key-value mapping` (optional) | Patch options.                                                                                          |
| `opts.status`           | `('pending' \| 'approved')?`   | Publication status.                                                                                     |
| `opts.language`         | `string?`                      | Target language, [two-letter ISO](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) language code. |

### `pk.patch.delete()`

⚠️ Restricted to **private** API keys, **do NOT expose the private key to the browser**.

Delete a patch record.

```js
pk.patch.delete("<patch-id>");
```

| Parameter | Type     | Description |
| --------- | -------- | ----------- |
| `id`      | `string` | Record ID.  |

### `pk.patch.deleteLang()`

⚠️ Restricted to **private** API keys, **do NOT expose the private key to the browser**.

Delete a patch translation.

```js
pk.patch.deleteLang("<patch-id>", "fr");
```

| Parameter  | Type     | Description                                                                                               |
| ---------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `id`       | `string` | Record ID.                                                                                                |
| `language` | `string` | Language to unset, [two-letter ISO](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) language code. |

NOTES:

- Deleting a translation will return a `409` error if there is no default language and no other translation available.

### `pk.keys.list()`

⚠️ Restricted to **private** API keys, **do NOT expose the private key to the browser**.

Retrieve all application API keys.

```js
pk.keys.list();
```

### `pk.keys.create()`

⚠️ Restricted to **private** API keys, **do NOT expose the private key to the browser**.

Create an application API key.

```js
pk.keys.create("<role>", { domains: [] });
```

| Parameter         | Type                      | Description         |
| ----------------- | ------------------------- | ------------------- |
| `role`            | `('public' \| 'private')` | API key role.       |
| `options`         | `object?`                 | API key options.    |
| `options.domains` | `string[]?`               | Domain restriction. |

### `pk.keys.get()`

⚠️ Restricted to **private** API keys, **do NOT expose the private key to the browser**.

Retrieve an API key by ID.

```js
pk.keys.get("<key-id>");
```

| Parameter | Type     | Description |
| --------- | -------- | ----------- |
| `id`      | `string` | API key ID. |

### `pk.keys.update()`

⚠️ Restricted to **private** API keys, **do NOT expose the private key to the browser**.

Update an API key.

```js
pk.keys.update("<key-id>", { domains: [] });
```

| Parameter         | Type        | Description                                      |
| ----------------- | ----------- | ------------------------------------------------ |
| `id`              | `string`    | API key ID.                                      |
| `options`         | `object?`   | API key options.                                 |
| `options.domains` | `string[]?` | Domain or IP restriction (for public keys only). |

### `pk.keys.delete()`

⚠️ Restricted to **private** API keys, **do NOT expose the private key to the browser**.

Delete an API key.

```js
pk.keys.delete("<key-id>");
```

| Parameter | Type     | Description |
| --------- | -------- | ----------- |
| `id`      | `string` | API key ID. |

## ⚖️ License

PlaceKit JavaScript Client is an open-sourced software licensed under the [MIT license](./LICENSE).
