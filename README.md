# algosms

[![npm version](https://badge.fury.io/js/algosms.svg)](https://www.npmjs.com/package/algosms)

AlgoSMS SDK is the official JavaScript implementation of ARC-0015 - Algorand Standard for Encrypted Short Messages.

## Installation

### [Node.js](https://nodejs.org/en/download/)

```
$ npm install algosms
```

> This package provides TypeScript types, but you will need [TypeScript](https://www.typescriptlang.org/) version 4.2 or higher to use them properly.

## Quick Start

### sending encrypted message to an Algo Address

```typescript

  import algosdk from 'algosdk';
  import {
    ALGOSMSV0_MESSAGE,
    ALGOSMSV0_TYPE_MSG,
    sendAlgoSMS,
  } from 'algosms';

  const addrRcpt = 'FCN6PO...6ACYXM';
  const accSender = algosdk.mnemonicToSecretKey('empty ... logic');

  const msg:ALGOSMSV0_MESSAGE = {
    t: ALGOSMSV0_TYPE_MSG,
    msg: 'A new standard definition is waiting for your comment.',
    from: 'ChainSMS ARCs department',
    uri: 'chainsms.xyz/arcs',
    meta: JSON.stringify({ Algorand: 'rocks!' }),
    ref: 'ARC-0015',
  };
  
  (async () => {
    /* encrypt the msg, sign and send it over the network */ 
    /* keep in mind the account has to have at least (10+1) times the network fee worth of Algos */
    const txnId = await sendAlgoSMS(client, msg, accRcpt.addr, accSender);
  })().catch(e => {
    console.error(e);
  });

  
```

### decrypting a message from a transaction 
```typescript
  import algosdk from 'algosdk';
  import { unsealMessageFromNote } from 'algosms';

  //instantiate the account of recipient 
  const accRcpt = algosdk.mnemonicToSecretKey('flash ... today');;

  /* get the TXN with encrypted note from indexer */
  const txn = await indexerClient.lookupTransactionByID(SmsTXID).do();

  /* convert base64 to bytes */
  const note = Buffer.from(txn.transaction.note, 'base64');
  const senderAddr = txn.transaction.sender;
 
  /* decrypt the note with recipient secret key */
  const msg = unsealMessageFromNote(note, senderAddr, accRcpt);
```

## Examples

SDK contains offnet.ts and onnet.ts examples.

### Building

To build a new version of the library, run:

```bash
yarn build
```

## License

algosms is licensed under an MIT license. 
