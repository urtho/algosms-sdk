import algosdk from 'algosdk';

const token = JSON.parse(process.env.ALGONODE_TOKEN!);
const server = process.env.ALGONODE_SERVER;
const port = process.env.ALGONODE_PORT;

const idx_token = JSON.parse(process.env.ALGOIDX_TOKEN!);
const idx_server = process.env.ALGOIDX_SERVER;
const idx_port = process.env.ALGOIDX_PORT;

export const client = new algosdk.Algodv2(token!, server, port);
export const indexerClient = new algosdk.Indexer(idx_token!, idx_server, idx_port);

export const accSender = algosdk.mnemonicToSecretKey(process.env.ACCOUNT_SRC!);
export const accRcpt = algosdk.mnemonicToSecretKey(process.env.ACCOUNT_DST!);

// ARC-0015 V0-DRAFT 
// https://github.com/algorandfoundation/ARCs/pull/49/files
export const ALGOSMS_V0_PREFIX = 'algosms/v0:ej';

export interface ALGOSMSV0 {
	/** Short message contents **/
	msg: string,

	/** Random padding/nonce to hide original message length. **/
	pad?: string,

	/** Optional display name chosen by the sender **/
	from?: string,

	/** Optional reference (e.g. threadID, invoiceID, txnID) **/
	ref?: string
}

