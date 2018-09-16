var express = require('express');
var bodyParser = require('body-parser');

const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');

const { Block, Blockchain } = require('./simpleChain');

var app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

// Create Blockchain instance
let blockchain = new Blockchain();

// Store address to timestamp
var address_to_ts = {};

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
    .catch((err) => res.status(404).send(`Block #${id} not found.`));
});

app.post('/block', (req, res) => {
  // TODO to be completed..
  const { address, star } = req.body;
  if (!address) return res.status(400).send('"address" is required.')
  console.log(star);
  star.story = '49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3';
  const ts = Math.floor(+new Date/1000);
  res.send({
    hash: '49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3',
    height: 1,
    body: {
      address: address,
      star: star,
    },
    time: ts.toString(),
    previousBlockHash: '49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3'
  })
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
  isValid ?
  // TODO: register to db as valid
  res.send({
    registerStar: true,
    status: {
      address: address,
      requestTimestamp: ts,
      message: message,
      validationWindow: time_left,
      messageSignature: 'valid'
    }
  })
  :
  res.status(400).send({
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

const PORT = 8000;
app.listen(PORT);
console.log(`Server is running on http://localhost:${PORT}/`);
