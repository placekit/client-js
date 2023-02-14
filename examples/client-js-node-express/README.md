# Express

This example integrates PlaceKit with Express to showcase how you could use the same instance to perform different kind of searches.
It also uses [dotenv](https://www.npmjs.com/package/dotenv) package to safely set credentials in an non-versioned file.

## Run

```sh
# clone project and access this example
git clone git@github.com:placekit/client-js.git
cd client-js/examples/client-js-node-express

# install dependencies
npm install

# create .env file
cp .env.sample .env
```

Open the `.env` file and replace `<your-api-key>` with your PlaceKit API key.

Then run:

```sh
node index.js
```

Your server will be up and listenning at http://localhost:3000.

## Try

To search for full addresses, run this in your terminal while your local server is running:

```sh
curl -X POST http://localhost:3000/address \
  -H "Content-Type: application/json" \
  -d '{"query": "Paris"}'
```

To search for city only, run this one instead:

```sh
curl -X POST http://localhost:3000/city \
  -H "Content-Type: application/json" \
  -d '{"query": "Paris"}'
```