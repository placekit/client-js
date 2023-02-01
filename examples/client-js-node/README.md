# Node.js

This example simply performs a search server-side with Node.js, and outputs the response with `console.log`. 
It uses [dotenv](https://www.npmjs.com/package/dotenv) package to safely set credentials in an non-versioned file.

## Run

```sh
# clone project and access this example
git clone git@github.com:placekit/client-js.git
cd client-js/examples/node

# install dependencies
npm install

# create .env file
cp .env.sample .env
```

Open the `.env` file and replace `<your-api-key>` with your PlaceKit API key.

Then run, replacing `<yourQuery>` with whatever city or address you want:

```sh
node index.js "<yourQuery>"
```