import {decryptFromBin} from "./crypto";
import {indexerClient, accRcpt, ALGOSMS_V0_PREFIX} from "./common";

// Example TXN with Base64 encoded payload
// const testTxn = 'OU5H5NABFICMKFKSF7HX2GC7OMMKQALWTTSJBZBPUPRFHLWMF5KA';

// Example TXN with binary payload
const testTxn = 'ZIWDULW25VYT64RWGY273QWULJ27F42LPQ6O44PKXR5EXSM2YQIQ';

(async () => {
  
  const txn = await indexerClient.lookupTransactionByID(testTxn).do();
  const note = Buffer.from(txn.transaction.note,'base64');
    
  const prefix = Buffer.from(note.slice(0, ALGOSMS_V0_PREFIX.length));

  if (prefix.equals(Buffer.from(ALGOSMS_V0_PREFIX))) {    
    const payload = note.slice(ALGOSMS_V0_PREFIX.length);
    //no error checking :(
    const msg = decryptFromBin(
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

