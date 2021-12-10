// TESTNET-NODE
import algosdk from 'algosdk';
import { sealMessageIntoNote, unsealMessageFromNote } from '../';
import { ALGOSMSV0_MESSAGE, ALGOSMSV0_TYPE_MSG } from '../';

//A "no API key reqiured" testnet node, feel free to abuse it.
const ALGONODE_TOKEN = 'no token required';
const ALGONODE_SERVER = 'https://testnet-algo.api.chainsms.network/ps2';
const ALGONODE_PORT = '443';

export const client = new algosdk.Algodv2(
  ALGONODE_TOKEN,
  ALGONODE_SERVER,
  ALGONODE_PORT
);

export const accSender = algosdk.generateAccount();
export const accRcpt = algosdk.generateAccount();

const makeSMSTxn = async (
  rcpt: string,
  sender: string,
  amount: number,
  sms: ALGOSMSV0_MESSAGE
) => {
  const suggestedParams = await client.getTransactionParams().do();

  // Ensure Txn fee meets the specs
  const specAmount =
    amount < suggestedParams.fee * 10 ? suggestedParams.fee * 10 : amount;

  try {
    const note = sealMessageIntoNote(sms, rcpt, sender);

    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: sender,
      to: rcpt,
      amount: specAmount,
      note,
      suggestedParams: { ...suggestedParams },
    });

    return txn;
  } catch (e) {
    console.error(e);
  }
};

export const exampleOffNetSMS = async () => {
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

  const txn = await makeSMSTxn(accRcpt.addr, accSender.addr, 0, message);

  const signedTxn = await txn.signTxn(accSender.sk);

  /* send the signedTxn over the network */
  // const cTxn = await client.sendRawTransaction(signedTxn).do();

  /* wait, then read the transaction from indexer */
  // const txn = await indexerClient.lookupTransactionByID(testTxn).do();
  // const note = Buffer.from(txn.transaction.note, 'base64');
  // const senderAddr = txn.transaction.sender;

  const newTxn = algosdk.decodeSignedTransaction(signedTxn);
  const note = newTxn.txn.note;

  const senderAddr = algosdk.encodeAddress(newTxn.txn.from.publicKey);
  const msg = unsealMessageFromNote(note, senderAddr, accRcpt);
  console.log('---==[ AFTER DECRYPTION ]==---');
  console.dir(msg);
};

(async () => {
  await exampleOffNetSMS();
})().catch((e) => {
  console.error(e);
});
