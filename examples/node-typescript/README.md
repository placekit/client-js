# TypeScript

This example simply performs a search server-side with TypeScript, and outputs the response with `console.log`. 
It uses [dotenv](https://www.npmjs.com/package/dotenv) package to safely set credentials in an non-versioned file.

The purpose of this example is simply to showcase the available types, even though most of the time you won't need them as they are [inferred](https://www.typescriptlang.org/docs/handbook/type-inference.html).

## Run

```sh
# clone project and access this example
git clone git@github.com:placekit/placekit-js.git
cd placekit-js/examples/node

# install dependencies
npm install

# create .env file
cp .env.sample .env
```

Open the `.env` file and replace `<your-api-key>` with your PlaceKit API key.

Then run, replacing `<yourQuery>` with whatever city or address you want:

```sh
npx ts-node index.ts "<yourQuery>"
```