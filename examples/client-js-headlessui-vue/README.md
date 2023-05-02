# PlaceKit Client JS x Headless UI Vue Combobox

[![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://githubbox.com/placekit/client-js/tree/main/examples/client-js-headlessui-vue)

[Headless UI](https://headlessui.com) is an open source library of completely unstyled, fully accessible UI components, designed to integrate beautifully with Tailwind CSS. Using icons from [heroicons](https://github.com/tailwindlabs/heroicons).

This example shows how to connect the Combobox Vue component with PlaceKit to create a beautiful autocomplete experience.

**NOTE**: It is meant as an custom implementation example for advanced development needs.
For a full autocomplete experience, we recommend using [PlaceKit Autocomplete](https://github.com/placekit/autocomplete-js).

Only using [TailwindCSS](https://tailwindcss.com) as a convenience for the basic styling of the example.

## Run

```sh
# clone project and access this example
git clone git@github.com:placekit/client-js.git
cd client-js/examples/client-js-headlessui-vue

# install dependencies
npm install

# create .env file
cp .env.sample .env
```

Open the `.env` file and replace `<your-api-key>` with your PlaceKit API key.

Then run:

```sh
npm run dev
```

And your project will be served at http://localhost:5173.