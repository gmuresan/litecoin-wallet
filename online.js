var litecore = require('litecore');
var shell = require('shelljs');
var Script = litecore.Script;
var Output = litecore.Transaction.Output;
var TransactionSignature = litecore.Transaction.Signature;
var Signature = litecore.crypto.Signature;
var PublicKeyHash = litecore.Transaction.Input.PublicKeyHash;
var LitecoreNode = require('litecore-node');
var Bitcoin = LitecoreNode.services.Bitcoin;
var Web = LitecoreNode.services.Web;
var util = require('util');
var fs = require('fs');

function sendTransaction(serializedTx, cb) {
  debugger;
  node.services.bitcoind.sendTransaction(serializedTx, (err, txId) => {
    debugger;
    if(err) {
      console.log(err);
    }
    setTimeout(() => {
    cb(txId);
    }, 5000);
  });
}

function generateTransaction(fromAddress, amount, toAddress, cb) {
  debugger;
  node.services.bitcoind.getAddressUnspentOutputs('mycby3ridcoFtxijf9ADdpPTXazAF89Jnm', 1, (err, utxos) => {

    var remainingAmount = amount;
    var inputTransactions = [];
    for(var i=0; i<utxos.length && remainingAmount > 0; i++) {
      var tx = utxos[i];
      remainingAmount -= tx.satoshis;
      inputTransactions.push(tx);
      if(remainingAmount <= 0) {
        break;
      }
    }

    var tx = new litecore.Transaction()
      .to(toAddress, amount)
      .from(inputTransactions)
      .fee(10000000)
      .change(fromAddress)

    var obj = tx.toObject();
    cb(JSON.stringify(obj));

  });
}

// MAIN
var command;
var outfile;
console.log(process.argv.join(' '));

if(process.argv.length === 5 && process.argv[2] === 'send') {
  var serializedTx = process.argv[3];
  var outfile = process.argv[4];
  command = sendTransaction.bind(this, serializedTx);

} else if(process.argv.length === 6) {
  var fromAddress = process.argv[2];
  var amount = Math.floor(parseFloat(process.argv[3])* 1e8);
  var toAddress = process.argv[4];
  var outfile = process.argv[5];

  command = generateTransaction.bind(this, fromAddress, amount, toAddress);

} else {

  console.log('Must have 4 arguments (from address, amount, to address, outfile)');
  process.exit();
}

litecore.Networks.defaultNetwork = litecore.Networks.testnet;

var configuration = {
  datadir: '/Users/gmuresan/.litecoin/data',
  network: 'testnet',
  port: 4001,
  services: [
    {
      name: 'bitcoind',
      module: Bitcoin,
      config: {
        spawn: {
          datadir: '/Users/gmuresan/.litecoin/data',
          exec: '/Users/gmuresan/.nvm/versions/node/v7.10.1/lib/node_modules/litecore/node_modules/litecore-node/bin/litecoind',
        }
      }
    },
    {
      name: 'web',
      module: Web,
    }
  ]
};

var loop = setInterval(function() {
}, 1000);

var node = new LitecoreNode.Node(configuration);

node.on('error', (error) => {
  console.log('node error');
  console.log(error);
});

node.start((error) => {
  console.log('litecore node started');
  if(error) {
    console.log(error);
  }
});

node.on('ready', () => {
  console.log('ready');
  command((result) => {
    fs.writeFileSync(outfile, result);
    console.log(result);
    node.stop((a) => {
      clearInterval(loop);
      process.exit(0);
    });
  });
});

