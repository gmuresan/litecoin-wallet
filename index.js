const execSync = require('child_process').execSync;
const fs = require('fs');

if(process.argv.length != 7) {
  console.log('Must have 4 arguments (fromAddress, privateKey, amount (ltc), toAddress, outfile)');
  process.exit();
}

const fromAddress = process.argv[2];
const privateKey = process.argv[3];
const amount = process.argv[4];
const toAddress = process.argv[5];
const outfile = process.argv[6];

console.log("********");
console.log("May take a few minutes to sync the blockchain the first time");
const generateTransaction = execSync(`node online.js ${fromAddress} ${amount} ${toAddress} ${outfile}`);
console.log(generateTransaction.toString());

const tx = fs.readFileSync(outfile).toString();

console.log();
console.log("*************");
console.log("Sending Transaction to be signed: " + tx);
console.log("*************");

const signTransaction = execSync(`node offline.js ${outfile} ${privateKey} ${outfile}`);
console.log(signTransaction.toString());

const serializedSignedTx = fs.readFileSync(outfile).toString();

console.log();
console.log("*********");
console.log("Broadcasting: " + serializedSignedTx);
console.log("*************");


setTimeout(() => {
  console.log("Sending...");
  const broadcastTransaction = execSync(`node online.js send ${serializedSignedTx} ${outfile}`);
  console.log(broadcastTransaction.toString());
  const transactionId = fs.readFileSync(outfile).toString();

  console.log();
  console.log("********");
  console.log("Transaction ID: " + transactionId);
  console.log("See http://explorer.litecointools.com/tx/" + transactionId);
  console.log("*************");
}, 2000);


