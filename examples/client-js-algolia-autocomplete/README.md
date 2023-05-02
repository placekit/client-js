# PlaceKit Client JS x Algolia Autocomplete

[![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://githubbox.com/placekit/client-js/tree/main/examples/client-js-algolia-autocomplete)

[Algolia Autocomplete](https://github.com/algolia/autocomplete) is an open source, production-ready JavaScript library for building autocomplete experiences.

This example shows how to connect it with PlaceKit to suggest addresses in real time as the user type.

**NOTE**: It is meant as an custom implementation example for advanced development needs.
For a full autocomplete experience, we recommend using [PlaceKit Autocomplete JS](https://github.com/placekit/autocomplete-js).

Only using [TailwindCSS](https://tailwindcss.com) as a convenience for the basic styling of the example.

## Run

```sh
# clone project and access this example
git clone git@github.com:placekit/client-js.git
cd client-js/examples/client-js-algolia-autocomplete

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