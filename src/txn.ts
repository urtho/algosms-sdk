import algosdk from 'algosdk';
import { sealMessageIntoNote } from './crypto';
import { ALGOSMSV0_MESSAGE } from './common';

/**
 * sendAlgoSMS takes an AlgoV2 client object, a message object, an Algorand addresses of message recipient
 * and sends the encrypted message to the recipient using pay transaction with ARC-0015 suggested fee.
 *
 * @param client - an algosdk.Algodv2 handle to an Algo node/API.
 * @param message - a ALGOSMSV0_MESSAGE object with a message and other metadata
 * @param addrRcpt - an Algorand address of recipient
 * @param accSender - a full algosdk.Account of sender (with secret key for signing)
 * @returns encypted result of sendRawTransaction
 */
export const sendAlgoSMS = async (
  client: algosdk.Algodv2,
  sms: ALGOSMSV0_MESSAGE,
  addrRcpt: string,
  accSender: algosdk.Account
) => {
  /* encrypt the note */
  const note = sealMessageIntoNote(sms, addrRcpt, accSender.addr);

  /* get current TXN suggestedParams */
  const suggestedParams = await client.getTransactionParams().do();

  /* create transaction object */
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: accSender.addr,
    to: addrRcpt,
    amount: suggestedParams.fee * 10,
    note,
    suggestedParams: { ...suggestedParams },
  });

  /* sign transaction with senders' secret key */
  const signedTxn = txn.signTxn(accSender.sk);

  /* send the signedTxn over the network */
  const cTxn = await client.sendRawTransaction(signedTxn).do();
  return cTxn;
};
