/*
	Helper functions
 */

const level = require('level');
const chainDB = './chainData';
const db = level(chainDB);

// var exports = module.exports = {};

// Add block to DB
exports.addBlock = (key, value) => {
	return new Promise((resolve, reject) => {
		db.put(key, value, (err) => {
			if (err) reject('Block ' + key + ' submission failed', err);
			resolve('Added block ' + key + ' to the chain.');
		})
	});
}

// chain length
exports.getChainLength = () => {
  return new Promise((resolve, reject) => {
    let height = 0
    db.createReadStream().on('data', (data) => {
      height ++
    }).on('error', (err) => {
      reject(err)
    }).on('close', () => {
      resolve(height)
    })
  })
}

// Get Block
exports.getBlock = (key) => {
	return new Promise((resolve, reject) => {
		db.get(key, (err, value) => {
			if (err) reject('Block ' + key + ' not found');
			resolve(value)
		})
	})
}
