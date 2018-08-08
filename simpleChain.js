/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');

const db = require('./database');

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
  constructor() {
    this.getBlockHeight().then(height => {
      if (height === 0) {
        this.addBlock(new Block("First block in the chain - Genesis block"))
          .then(() => console.log('Blockchain initialized with Genesis block!'))
      }
    })
  }

  // Add new block
  async addBlock(newBlock) {
    let chainLength = await db.getChainLength()

    // Block height
    newBlock.height = chainLength;

    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0,-3);

    // previous block hash
    let previousBlockHash;
    if(chainLength>0){
      let previousBlock = await this.getBlock(chainLength-1);
      newBlock.previousBlockHash = previousBlock.hash
    }

    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

    // Adding block object to chain
    await db.addBlock(chainLength, JSON.stringify(newBlock))
    console.log('Added Block # ' + chainLength)
  }

  // Get block height
  async getBlockHeight() {
    return JSON.parse(await db.getChainLength());
  }

  // get block
  async getBlock(blockHeight) {
    // return object as a single string
    return JSON.parse(await db.getBlock(blockHeight));
  }

  // validate block
  async validateBlock(blockHeight){
    // get block object
    let block = await this.getBlock(blockHeight);

    // get block hash
    let blockHash = block.hash;

    // remove block hash to test block integrity
    block.hash = '';

    // generate block hash
    let validBlockHash = SHA256(JSON.stringify(block)).toString();

    // Compare
    if (blockHash===validBlockHash) {
      return true;
    } else {
      console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
      return false;
    }
  }

 // Validate blockchain
  async validateChain() {
    let errorLog = [];
    let chainLength = await db.getChainLength()
    for (var i = 0; i < chainLength-1; i++) {
      // validate block
      if (!this.validateBlock(i))errorLog.push(i);

      // compare blocks hash link
      let block = await this.getBlock(i);
      let blockHash = block.hash;

      let nextBlock = await this.getBlock(i+1);
      let previousHash = nextBlock.previousBlockHash;

      if (blockHash!==previousHash) {
        errorLog.push(i);
      }
    }

    if (errorLog.length>0) {
      console.log('Block errors = ' + errorLog.length);
      console.log('Blocks: '+errorLog);
    } else {
      console.log('No errors detected');
    }
  }
}

// Create Blockchain instance
let blockchain = new Blockchain();

//Add 10 blocks
(function theLoop(i) {
  setTimeout(function () {
      blockchain.addBlock(new Block("Block " + i)).then(() =>{
          if (--i) theLoop(i);
          return
      })
  }, 100);
})(10);

console.log('Done adding!')

// Validate chain
setTimeout(function () {
    console.log("Validating blockchain...");
    blockchain.validateChain();
}, 3000)
