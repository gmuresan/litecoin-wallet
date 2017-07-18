var litecore = require('litecore');
var jsonic = require('jsonic');
var fs = require('fs');

if(process.argv.length != 5) {
  console.log('Must have 3 arguments (txFile, privateKey, outfile)');
  process.exit();
}

var transactionJson = fs.readFileSync(process.argv[2]).toString();
var inputKey = process.argv[3];
var outfile = process.argv[4];

console.log(transactionJson);
var transactionObject = jsonic(transactionJson);

console.log(transactionJson);
console.log(transactionObject);
console.log(inputKey);

litecore.Networks.defaultNetwork = litecore.Networks.testnet;

var privateKey = new litecore.PrivateKey(inputKey);

var tx = new litecore.Transaction();
tx = tx.fromObject(transactionObject).sign(privateKey);
const serializedTx = tx.serialize();
console.log(serializedTx);

fs.writeFileSync(outfile, serializedTx);

