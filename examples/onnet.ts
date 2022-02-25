// TESTNET-NODE
import algosdk from 'algosdk';
import {
  unsealMessageFromNote,
  ALGOSMSV0_MESSAGE,
  ALGOSMSV0_TYPE_MSG,
  sendAlgoSMS,
} from '../';

//A "no API key reqiured" testnet node, feel free to abuse it.
const ALGONODE_TOKEN = 'no token required';
const ALGONODE_SERVER = 'https://testnet-api.algonode.cloud';
const ALGONODE_PORT = '443';

export const client = new algosdk.Algodv2(
  ALGONODE_TOKEN,
  ALGONODE_SERVER,
  ALGONODE_PORT
);

export const accSender = algosdk.generateAccount();
export const accRcpt = algosdk.generateAccount();

export const exampleOnNetSMS = async () => {
  const message: ALGOSMSV0_MESSAGE = {
    t: ALGOSMSV0_TYPE_MSG,
    msg: 'A new standard definition is waiting for your comment.',
    from: 'ChainSMS ARCs department',
    uri: 'chainsms.xyz/arcs',
    meta: JSON.stringify({ Algorand: 'rocks!' }),
    ref: 'ARC-0015',
  };

  console.log('---==[ BEFORE ENCRYPTION ]==---');
  console.dir(message);

  /* this will ALWAYS fail as the new account has insufficiend Algos to commit the transaction */
  const txnId = await sendAlgoSMS(client, message, accRcpt.addr, accSender);

  console.dir(txnId);

  /* wait, then read the transaction */
  const txn = await client.pendingTransactionInformation(txnId).do();
  const note = Buffer.from(txn.transaction.note, 'base64');
  const senderAddr = txn.transaction.sender;

  const msg = unsealMessageFromNote(note, senderAddr, accRcpt);
  console.log('---==[ AFTER DECRYPTION ]==---');
  console.dir(msg);
};

(async () => {
  await exampleOnNetSMS();
})().catch((e) => {
  console.error(e);
});
