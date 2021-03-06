var litecore = require('litecore');
var LitecoreNode = require('litecore-node');
var Bitcoin = LitecoreNode.services.Bitcoin;
var Web = LitecoreNode.services.Web;
var util = require('util');
var fs = require('fs');
var resolve = require('path').resolve;

function sendTransaction(serializedTx, cb) {
  console.log("litecore call sendTransaction " + serializedTx);
  node.services.bitcoind.sendTransaction(serializedTx, (err, txId) => {
    if(err) {
      console.log(err);
    }
    setTimeout(() => {
      cb(txId);
    }, 3000);
  });
}

function generateTransaction(fromAddress, amount, toAddress, cb) {
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

    if(remainingAmount > 0) {
      console.error("Not enough funds available");
      return cb(null);
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
  datadir: './.data',

  network: 'testnet',
  port: 4001,
  path: resolve('./.data/data/bitcoin.conf'),
  services: [
    {
      name: 'bitcoind',
      module: Bitcoin,
      config: {
        spawn: {
          datadir: './.data',
          exec: './node_modules/litecore-node/bin/litecoind',
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
  var syncLoop = setInterval(function() {
    node.services.bitcoind.isSynced((err, synced) => {
      console.log("Syncing blockchain...");
      if(synced) {
        clearInterval(syncLoop);
        command((result) => {
          if(result) {
            fs.writeFileSync(outfile, result);
            console.log(result);
          }
          node.stop((a) => {
            clearInterval(loop);
            process.exit(0);
          });
        });
      }
    });
  }, 3000);
});

