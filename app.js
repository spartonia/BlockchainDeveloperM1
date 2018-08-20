var express = require('express');
var bodyParser = require('body-parser');

const { Block, Blockchain } = require('./simpleChain');

var app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

// Create Blockchain instance
let blockchain = new Blockchain();


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

app.post('/block', async (req, res) => {
  const { body } = req.body;
  if (!body) return res.status(400).send('"body" is required.')

  blockchain
    .addBlock(new Block(body))
    .then(key => {
      blockchain.getBlock(key)
        .then(block => res.send(block))
        .catch((err) => res.status(404).send(err))
  })
  .catch((err) => res.status(500).send(e));
});

const PORT = 8000;
app.listen(PORT);
console.log(`Server is running on http://localhost:${PORT}/`);
