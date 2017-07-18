SAMPLE ADDRESSES:
<PrivateKey: ed1de16a561c50eabd1fa352c98f85a047f83c46304efb17e2ae21bdf1fc4eea, network: testnet>
<Address: mycby3ridcoFtxijf9ADdpPTXazAF89Jnm, type: pubkeyhash, network: testnet>

<PrivateKey: 09b03a52eb6af35668e1f8dc0058afa4b014d3d3e0fc23da674eb7f9fd3834b3, network: testnet>
<Address: n1jLSbqNQFV3sDb3LEFsEkWKqBRBrf9fkF, type: pubkeyhash, network: testnet>

Index.js:
  This simulates a user generating the transaction (online), then taking the transaction to the offline computer to sign it, then back to the online computer to broadcast the transaction

  Usage:
    node index.js <fromAddress> <privateKey> <amount(ltc)> <toAddress>
    node index.js mycby3ridcoFtxijf9ADdpPTXazAF89Jnm ed1de16a561c50eabd1fa352c98f85a047f83c46304efb17e2ae21bdf1fc4eea 0.1 n1jLSbqNQFV3sDb3LEFsEkWKqBRBrf9fkF

Online.js:
  Two uses: generate transaction, send transaction after it's signed

  Usage:
    node online.js <from> <amount> <to> <outfile>
    node online.js mycby3ridcoFtxijf9ADdpPTXazAF89Jnm 0.1 n1jLSbqNQFV3sDb3LEFsEkWKqBRBrf9fkF out.txt

    node online.js send <signedTx> <outfile>

Offline.js:
  Sign the transaction using the private key

  Usage:
    node offline.js <txFile> <privateKey> <outfile>
    node offline.js in.txt f8j298h289fh2893fh28fj28fj out.txt

