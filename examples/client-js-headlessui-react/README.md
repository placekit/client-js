# Headless UI React Combobox

[Headless UI](https://headlessui.com) is an open source library of completely unstyled, fully accessible UI components, designed to integrate beautifully with Tailwind CSS.

This example shows how to connect the Combobox React component with PlaceKit to create a beautiful autocomplete experience.
It uses [Parcel](https://parceljs.org) as a bundler, and [Tailwind CSS](http://tailwindcss.com) as CSS framework with [heroicons](https://github.com/tailwindlabs/heroicons).

**NOTE**: It is meant as an custom implementation example for advanced development needs.
For a full autocomplete experience, we recommend using [PlaceKit Autocomplete](https://github.com/placekit/autocomplete-js).

## Run

```sh
# clone project and access this example
git clone git@github.com:placekit/client-js.git
cd client-js/examples/headlessui-react

# install dependencies
npm install

# create .env file
cp .env.sample .env
```

Open the `.env` file and replace `<your-api-key>` with your PlaceKit API key.

Then run:

```sh
npm start
```

And your project will be served at http://localhost:1234.

## Docs

You can customize almost everything from style to result sources and processing:

[Headless UI Combobox documentation](https://headlessui.com/react/combobox)