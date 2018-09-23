# Private Blockchain Notary Service

This project, provides a Star Registry service that allows users to claim ownership of their favorite star in the night sky through notorizing with the blockchain. This project aims to provide a simple blockchain notary service API based on **ExpressJS**.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the [Node.js® web site](https://nodejs.org/en/).

### Configuring your project

Install project dependencies.
```
npm install
```
and then run:
```
node app.js
```
### How To

Folllowing endpoints are available:
```bash
| method | endpoint                    | description
-----------------------------------------------------------------------------------------
| GET    | /height                     | Blockchain height
| GET    | /block/:id                  | Get a specific block
| POST   | /requestValidation          | Request validation
| POST   | /message-signature/validate | POst credentials to be vlidated
| POST   | /block                      | Add a new block to the chain
| GET    | /stars/hash:[HASH]          | Lookup a star by hash
| GET    | /stars/address:[ADDRESS]    | Lookup stars registered by given address
| GET    | /block/[HEIGHT]             | Lookup a start registered at given block number
```

#### 1. Allow User Request
The Web API will allow users to submit their request using their wallet address.

```bash
curl -X "POST" "http://localhost:8000/requestValidation" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ"
}'
```

After submitting a request, the user will receive a response in JSON format with a message to sign within a time window supplied by the response.

#### 2. User Signs  the Message

After receiving the response, users will prove their blockchain identity by signing a message with their wallet. Once they sign this message, the application will validate their request and grant access to register a star

```bash
curl -X "POST" "http://localhost:8000/message-signature/validate" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "signature": "H6ZrGrF0Y4rMGBMRT2+hHWGbThTIyhBS0dNKQRov9Yg6GgXcHxtO9GJN4nwD2yNXpnXHTWU9i+qdw5vpsooryLU="
}'
```

#### 3. Register a Star

Once the user is verified, they can register a star in the blockchain.

```bash
curl -X "POST" "http://localhost:8000/block" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "star": {
    "dec": "-26° 29'\'' 24.9",
    "ra": "16h 29m 1.0s",
    "story": "Found star using https://www.google.com/sky/"
  }
}'
```

#### 4. Star Lookup

The following endpoints can be used to lookup in the blockchain/

Lookup a star by hash
```bash
http://localhost:8000/stars/hash:[HASH]
```

Lookup all stars registered by given (wallet) address
```bash
http://localhost:8000/stars/address:[ADDRESS]
```

Lookup a star registered at given block number
```bash
http://localhost:8000/stars/hash:[HASH]
```
