import algosdk from "algosdk";
import {sealMessageIntoNote} from "./crypto";
import {client, accRcpt, accSender, ALGOSMSV0_MESSAGE, ALGOSMSV0_TYPE_NOTE, ALGOSMSV0_TYPE_MSG} from "./common";


const makeSMSTxn = async (rcpt: string, sender: string, amount: number, sms: ALGOSMSV0_MESSAGE) => {  
  const suggestedParams = await client.getTransactionParams().do();
  
    //Ensure Txn fee meets the specs
  if (amount < suggestedParams.fee * 10) {
    amount = suggestedParams.fee * 10;
  }

  const note = sealMessageIntoNote(sms, rcpt, sender);

  // const clearText2 = decryptFrom(b64ej, sender.addr, accRcpt);
  // console.log(clearText == clearText2);

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: sender,
    to: rcpt,    
    amount,
    note,
    suggestedParams: {...suggestedParams}
  });

  return txn;
}

(async () => {
  
  const txn = await makeSMSTxn(accRcpt.addr, accSender.addr, 0, {
    _t: ALGOSMSV0_TYPE_MSG,
    msg:"A new standard definition is waiting for your comment.",
    from:"ChainSMS ARCs department",
    uri:"chainsms.xyz/arcs",
    meta:JSON.stringify({Algorand:"rocks!"}),
    ref:"ARC-0015"
  });
 
  const signedTxn = await txn.signTxn(accSender.sk);
  const cTxn = await client.sendRawTransaction(signedTxn).do();
  console.dir(cTxn);

})().catch((e) => {
  console.log(e);
});

