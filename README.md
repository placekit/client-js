<h1 align="center">
  PlaceKit JS Client
</h1>

<p align="center">
  <b>Location data, search and autocomplete for your apps</b>
</p>

<p align="center">
  ✨ <a href="#-features">Features</a> • 
  🎯 <a href="#-quick-start">Quick start</a> • 
  🏗 <a href="./examples">Examples</a> • 
  📚 <a href="https://placekit.io/docs">Documentation</a> • 
  ⚖️ <a href="#-license">License</a>
</p>

---

PlaceKit JavaScript Client abstracts interactions with our API, making your life easier. We **highly recommend** to use it instead of accessing our API directly.

## ✨ Features

- **Featherweight**, **zero-dependency** HTTP client
- **Retry strategy** to increase service availability
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

const pkSearch = placekit({
  appId: '<your-app-id>',
  apiKey: '<your-api-key>',
  options: {
    //...
  },
});

pkSearch('Paris').then((res) => {
  console.log(res.hits);
});
```

For advanced usages, visit our [online documentation](https://placekit.io/docs).

### CDN

First, add this line before the closing `</body>` tag in your HTML to import PlaceKit JavaScript Client:

```html
<script src="https://cdn.jsdelivr.net/npm/placekit-js@1.0.0/dist/placekit.umd.js"></script>
```

Then it works the same as the node example above.
After importing the library, `PlaceKit` beomces available as a global:

```html
<script>
  const pkSearch = placekit({
    appId: '<your-app-id>',
    apiKey: '<your-api-key>',
    options: {
      //...
    },
  });

  pkSearch('Paris').then((res) => {
    console.log(res.hits);
  });
</script>
```

Or if you are using native ES Modules:

```html
<script type="module">
  import placekit from 'https://cdn.jsdelivr.net/npm/placekit-js@1.0.0/dist/placekit.esm.js';
  const pkSearch = placekit(/* ... */);
  // ...
</script>
```

For the full autocomplete experience, check out our [examples](./examples).

## ⚖️ License

PlaceKit JavaScript Client is an open-sourced software licensed under the [MIT license](./LICENSE).