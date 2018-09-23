var express = require('express');
var bodyParser = require('body-parser');

const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');
const SHA256 = require('crypto-js/sha256');
const db = require('./database');

const { Block, Blockchain } = require('./simpleChain');

var app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

// Create Blockchain instance
let blockchain = new Blockchain();

// Store address to timestamp
var address_to_ts = {};

// Store a list of validated addresses
var validAddressList = []

const validationWindow = 300;

app.get('/', (req, res) => {
  let msg = '';
  msg += 'Wellcome to SimpleBlockchain API.<br>';
  msg += 'Folllowing endpoints are available:<br>';
  msg += '| method | endpoint   | description <br>';
  msg += '| GET    | /height    | Blockchain height<br>';
  msg += '| GET    | /block/:id | Get a specific block <br>';
  msg += '| POST   | /block     | Add a new block to the chain';
  res.send('<pre>' + msg + '</pre>');
});

app.get('/height', async (req, res) => {
  blockchain
    .getBlockHeight()
    .then(h=>res.send({'height': h}))
    .catch((err) => res.sendStatus(404));
});

app.get('/block/:id', async (req, res) => {
  const { id } = req.params;
  blockchain
    .getBlock(id)
    .then(block => res.send(block))
    .catch((err) => res.status(404).send({message: `Block #${id} not found.`}));
});

app.post('/block', async (req, res) => {
  const { address, star } = req.body;
  if (!address) return res.status(400).send({message: '"address" is required.'});
  if (!validAddressList.includes(address)) {
    return res.status(400).send({message: 'Invalid address.'})
  }
  star.story = Buffer.from(star.story).toString('base64');
  let starBlock = {
    address: address,
    star: star,
  }
  blockchain
    .addBlock(new Block(starBlock))
    .then(key => {
      blockchain.getBlock(key)
        .then(block => res.send(block))
        .catch((err) => res.status(404).send(err))
  })
  .catch((err) => res.status(500).send(e));
});

app.post('/requestValidation', (req, res) => {
  const { address } = req.body;
  const ts = Math.floor(+new Date/1000);
  address_to_ts[address] = ts;
  console.log(ts);
  const messageToSign = `${address}:${ts}:starRegistry`
  res.send({
    address: address,
    requestTimestamp: ts,
    message: messageToSign,
    validationWindow: validationWindow
  });
});

app.post('/message-signature/validate', (req, res) => {
  const { address, signature } = req.body;
  const ts = address_to_ts[address];
  const ts_now = Math.floor(+new Date/1000);
  if (!ts) return res.status(404).send(`address ${address} not found!`);
  t_elapsed = ts_now - ts;
  if (t_elapsed > validationWindow) {
    delete address_to_ts[address];
    return res.status(400).send(`Request time expired! Submit a new request.`)
  }
  const message = `${address}:${ts}:starRegistry`;
  const time_left = validationWindow-t_elapsed;
  //check if signature is valid..
  const isValid = bitcoinMessage.verify(message, address, signature);
  if (isValid) {
    // TODO: register to db as valid
    validAddressList.push(address);
    return res.send({
      registerStar: true,
      status: {
        address: address,
        requestTimestamp: ts,
        message: message,
        validationWindow: time_left,
        messageSignature: 'valid'
      }
    })
  };
  return res.status(400).send({
    registerStar: false,
    status: {
      address: address,
      requestTimestamp: ts,
      message: message,
      validationWindow: time_left,
      messageSignature: 'inValid'
    }
  });
});

app.get('/stars/address::adr', async (req, res) => {
  const { adr } = req.params;
  if (!adr) return res.status(400).send({message: '"address" is required.'})
  let validBlocks = []
  try {
    let height = await blockchain.getBlockHeight();
    for (var i = 0; i < height; i++) {
      let block = await blockchain.getBlock(i);
      if (block.body.address === adr) {
        block.body.star.storyDecoded = Buffer.from(block.body.star.story, 'base64').toString('ascii');
        validBlocks.push(block);
      }
    }
  } catch (err) {
    console.log(err);
  }
  return res.send(validBlocks);
});

app.get('/stars/hash::hash', async (req, res) => {
  const { hash } = req.params;
  if (!hash) return res.status(400).send({message: '"hash" is required.'})
  try {
    let height = await blockchain.getBlockHeight();
    for (var i = 0; i < height; i++) {
      let block = await blockchain.getBlock(i);
      if (block.hash === hash) {
        return res.send(block);
      }
    }
  } catch (err) {
    console.log(err);
  }
  return res.status(404).send({message: 'Block not found.'});
});

const PORT = 8000;
app.listen(PORT);
console.log(`Server is running on http://localhost:${PORT}/`);
