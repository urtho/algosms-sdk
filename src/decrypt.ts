import {unsealMessageFromNote} from "./crypto";
import {indexerClient, accRcpt} from "./common";

// Example TXN with msgpack payload
const testTxn = 'O5TFQPZGOMVO3KEYW3UIGFE7GTG3WMTT5BP4Z53EBQ6IQUBDG4XQ';

(async () => {
  
  const txn = await indexerClient.lookupTransactionByID(testTxn).do();
  const note = Buffer.from(txn.transaction.note,'base64');
    
  const msg = unsealMessageFromNote(
      note,
      txn.transaction.sender,
      accRcpt
  );
  console.dir(msg);

})().catch((e) => {
  console.log(e);
});

