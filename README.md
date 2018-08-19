# Blockchain Data

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project

- Install project dependencies.
```
npm install
```

## Retrieve an existig block (`GET`)
To get a certail block, open a terminal window and run:
```
curl "http://localhost:8000/block/<block#>"
```
To get the genesis block for instance, run:
```
curl "http://localhost:8000/block/0"
```

### Adding a new block (`POST`)
To add a new block to the chain, use `POST`:
```
curl -X "POST" "http://localhost:8000/block" \
     -H 'Content-Type: application/json' \
     -d $'{
  "body": "Testing block with test string data"
}'
```
