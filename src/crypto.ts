import {TextEncoder, TextDecoder} from "util";

import {ALGOSMS_V0_PREFIX} from "./common";

import ed2curve from "ed2curve";
import algosdk from "algosdk";

import nacl from 'tweetnacl';

const enc = new TextEncoder();
const dec = new TextDecoder();

export const toHex = (buffer: Uint8Array) => {
  return Array.prototype.map.call(buffer, x => x.toString(16).padStart(2, '0')).join('');
}

export const pad = (message: string, limit : number): string|undefined => {
  const encMsg = enc.encode(message);
  const padLength = (limit - ALGOSMS_V0_PREFIX.length) - (1.37 * (encMsg.length + 48) ) - 20;
  if (padLength < 0) return undefined;
  return toHex(nacl.randomBytes(padLength/2/1.37));
}

export const encryptFor = (message:string, recipientAlgoAddress:string, senderAlgoAddress: string):string => {
  const encMsg = enc.encode(message);
 
  //Let's use signing keys for encryption. :)
  const recipientPublicSignKey = algosdk.decodeAddress(recipientAlgoAddress).publicKey;
  
  //The message contains nonce/padding so let's use known nonce here and not send it over the wire. 
  const nonce = algosdk.decodeAddress(senderAlgoAddress).publicKey.subarray(0, nacl.box.nonceLength); //nacl.randomBytes(nacl.box.nonceLength);

  const rcptPubKey = ed2curve.convertPublicKey(recipientPublicSignKey);

  // We should not use our static private signing key for encryption. 
  // Also no need to prove I am the sender - it's done elsewhere. 
  // Let's use random KP and send the public part over the wire  
  const otKeyPair = nacl.box.keyPair();
  const otSecretKey = otKeyPair.secretKey;
  
  // We are doing a verbose version of a sealed box here :D
  const cipherBuffer = nacl.box(encMsg, nonce, rcptPubKey!, otSecretKey );


  const cipherBufferWithOTPubKey = Buffer.from(new Uint8Array([...otKeyPair.publicKey , ...cipherBuffer]));
  
  return cipherBufferWithOTPubKey.toString('base64');
}

export const decryptFrom = (cipherB64:string, senderAlgoAddress:string, recipientAccount: algosdk.Account):string => {
  const cipherBufferWithOTPubKey = Buffer.from(cipherB64,'base64');
  const nonce = algosdk.decodeAddress(senderAlgoAddress).publicKey.subarray(0, nacl.box.nonceLength);
  
  const otPublicKey = cipherBufferWithOTPubKey.subarray(0,nacl.box.publicKeyLength);
  const cipherBuffer = cipherBufferWithOTPubKey.subarray(nacl.box.publicKeyLength);
  const rcptSecretKey = ed2curve.convertSecretKey(recipientAccount.sk);

  const decryptedBuffer = nacl.box.open(cipherBuffer, nonce, otPublicKey!, rcptSecretKey);

  const jsonMsg = dec.decode(decryptedBuffer);
  return jsonMsg;
}

