var express = require('express');
var bodyParser = require('body-parser');

const { Block, Blockchain } = require('./simpleChain');

var app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

// Create Blockchain instance
let blockchain = new Blockchain();


app.get('/height', async (req, res) => {
	blockchain
		.getBlockHeight()
		.then(h=>res.send('h:' + h))
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
	const { data } = req.body
	if (!data) return res.status(400).send('"data" is required.')

	blockchain
		.addBlock(new Block(data))
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
