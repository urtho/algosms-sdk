import {decryptFrom} from "./crypto";
import {indexerClient, accRcpt, ALGOSMS_V0_PREFIX} from "./common";

const testTxn = 'OU5H5NABFICMKFKSF7HX2GC7OMMKQALWTTSJBZBPUPRFHLWMF5KA';

(async () => {
  
  const txn = await indexerClient.lookupTransactionByID(testTxn).do();
  const note = Buffer.from(txn.transaction.note,'base64').toString();
  
  if (note.startsWith(ALGOSMS_V0_PREFIX)) {    
    const payload = note.substr(ALGOSMS_V0_PREFIX.length);
    //no error checking :)
    const msg = decryptFrom(
        payload,
        txn.transaction.sender,
        accRcpt
    );
    const msgObj = JSON.parse(msg);
    delete(msgObj['pad']);
    console.dir(msgObj);
  }

})().catch((e) => {
  console.log(e);
});

