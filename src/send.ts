import algosdk from "algosdk";
import {TextEncoder} from "util";
import {pad, encryptFor} from "./crypto";
import {client, accRcpt, accSender, ALGOSMS_V0_PREFIX, ALGOSMSV0} from "./common";


const makeSMSTxn = async (rcpt: string, sender: string, amount: number, sms: ALGOSMSV0) => {  
  const suggestedParams = await client.getTransactionParams().do();
  
  //This padding is not comfy ;(
  sms.pad = '';
  sms.pad = pad(JSON.stringify(sms), 1000);
  if (!sms.pad) {
    throw new Error("Encrypted message length exceeds 1000 bytes");
  }
  const clearText = JSON.stringify(sms);

  //Ensure Txn fee meets the specs
  if (amount < suggestedParams.fee * 10) {
    amount = suggestedParams.fee * 10;
  }

  const b64ej = encryptFor(clearText, rcpt, sender);

  // const clearText2 = decryptFrom(b64ej, sender.addr, accRcpt);
  // console.log(clearText == clearText2);

  const note = ALGOSMS_V0_PREFIX + b64ej;
  const enc = new TextEncoder();
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: sender,
    to: rcpt,    
    amount,
    note: enc.encode(note),
    suggestedParams: {...suggestedParams}
  });

  return txn;
}

(async () => {
  
  const txn = await makeSMSTxn(accRcpt.addr, accSender.addr, 0, { 
    "msg":"A new prescription is waiting for you in our portal.",
    "from":"MetaHealt Inc",
    "ref":"urologist@11/22/2021"
  });
 
  const signedTxn = await txn.signTxn(accSender.sk);
  const cTxn = await client.sendRawTransaction(signedTxn).do();
  console.dir(cTxn);

})().catch((e) => {
  console.log(e);
});

