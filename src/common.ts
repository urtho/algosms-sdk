// ARC-0015 V0-DRAFT
// https://github.com/algorandfoundation/ARCs/pull/49/files
export const ALGOSMSV0_TYPE_MSG: string = 'algosms/v0:msg';
export const ALGOSMSV0_TYPE_NOTE: string = 'algosms/v0:note';

// Sample note on the Algorand chain
// https://goalseeker.purestake.io/algorand/testnet/transaction/O5TFQPZGOMVO3KEYW3UIGFE7GTG3WMTT5BP4Z53EBQ6IQUBDG4XQ

export interface ALGOSMSV0_NOTE {
  /** Object type eq to ALGOSMSV0_TYPE_NOTE * */
  t: string;

  /** one-time public key of the NACL's sealed box * */
  otPK: Uint8Array;

  /** cipherText of the ALGOSMSV0_MESSAGE structure * */
  cT: Uint8Array;
}

// TODO - calculate max lenght of ALGOSMSV0_MESSAGE
export interface ALGOSMSV0_MESSAGE {
  /** Object Type - eq to ALGOSMSV0_TYPE_MSG * */
  t: string;

  /** Short visible message contents in UTF-8 * */
  msg: string;

  /** Optional display name chosen by the sender, to be displayed along reverse Unstoppable/NF.domains * */
  from?: string;

  /** Optional reference (e.g. threadID, invoiceID, txnID) * */
  ref?: string;

  /** Optional URI (URL/URN/...) * */
  uri?: string;

  /** Optional JSON-encoded metadata * */
  meta?: string;

  /** Optional binary content * */
  bin?: Uint8Array;

  /** Optional random padding to hide original message length. * */
  pad?: Uint8Array;
}
