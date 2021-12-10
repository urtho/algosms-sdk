import algosdk from 'algosdk';
import nacl from 'tweetnacl';
import ed2curve from 'ed2curve';

import {
  ALGOSMSV0_MESSAGE,
  ALGOSMSV0_NOTE,
  ALGOSMSV0_TYPE_MSG,
  ALGOSMSV0_TYPE_NOTE,
} from './common';

export const UNSUPPORETD_MSG_SCHEMA_ERROR_MSG: string =
  'Unsupported message schema';
export const NOTE_LENGTH_ABOVE_1000_ERROR_MSG: string =
  'Encoded note length exceeds 1000 bytes';
export const UNKNOWN_ENCYPTED_PAYLOAD_SCHEMA_ERROR_MSG: string =
  'Unknown encrypted payload schema';
export const INVALID_CIPHERTEXT_ERROR_MSG: string =
  "Ciphertext is invalid or does not match recipient's secret key";
export const UNSUPPORTED_MSG_SCHEMA_VER_ERROR_MSG: string =
  'Unsupported message schema version';

/**
 * sealMessageIntoNote takes a message object, an Algorand addresses of message recipient and sender and returns PKI encrypted message.
 * Encrypted message is an UINT8Array as retured from algosdk.encodeObject() and should be used directly as transaction's note field.
 *
 * @param message - a ALGOSMSV0_MESSAGE object with a message and other metadata
 * @param recipientAlgoAddress - an Algorand address of recipient
 * @param senderAlgoAddress - an Algorand address of sender
 * @returns encypted message object in the form of MsgPack encoded UINT8Array
 */
export const sealMessageIntoNote = (
  message: ALGOSMSV0_MESSAGE,
  recipientAlgoAddress: string,
  senderAlgoAddress: string
): Uint8Array => {
  // Enforce object type
  if (!message || !message.t || message.t !== ALGOSMSV0_TYPE_MSG) {
    throw new Error(UNSUPPORETD_MSG_SCHEMA_ERROR_MSG);
  }

  const paddedMessage = { ...message };

  // Add a random length pad of up to 16 bytes if one is missing
  if (!message.pad || message.pad.length === 0) {
    paddedMessage.pad = nacl.randomBytes(Math.floor(Math.random() * 16));
  }

  // Encode message with algosdk's MessagePack
  const encMsg = algosdk.encodeObj(paddedMessage);

  // Let's use signing keys for encryption. :)
  const recipientPublicSignKey = algosdk.decodeAddress(recipientAlgoAddress)
    .publicKey;

  // Convert recipient's public signing key to crypto key
  const rcptPubKey = ed2curve.convertPublicKey(recipientPublicSignKey);

  // We should not use our static private signing key for encryption.
  // Also no need to prove I am the sender - it's done elsewhere.
  // Let's use random KP and send the public part over the wire
  const otKeyPair = nacl.box.keyPair();

  // Let's agree on static nonce as we have ephemeral keys anyway
  const nonce = algosdk
    .decodeAddress(senderAlgoAddress)
    .publicKey.subarray(0, nacl.box.nonceLength);

  // We are doing a verbose version of a sealed box here :D
  const cipherText = nacl.box(encMsg, nonce, rcptPubKey!, otKeyPair.secretKey);

  const notePayload: ALGOSMSV0_NOTE = {
    t: ALGOSMSV0_TYPE_NOTE,
    otPK: otKeyPair.publicKey,
    cT: cipherText,
  };

  // Encode note with algosdk's MessagePack
  const msgPackPayload = algosdk.encodeObj(notePayload);

  // TODO: check real max length
  if (msgPackPayload.length > 1000) {
    throw new Error(NOTE_LENGTH_ABOVE_1000_ERROR_MSG);
  }

  return msgPackPayload;
};

/**
 * unsealMessageFromNote takes a binary note, an Algorand addresses of message sender and full recipier Account and returns decrypted message.
 * Dectypted message is ALGOSMSV0_MESSAGE object.
 *
 * @param note - a binary (not base64 encoded) transaction's note field to be decrypted
 * @param senderAlgoAddress - an Algorand address of sender
 * @param recipientAlgoAccount - an Algorand account (address and secret key) of recipient
 * @returns decrypted message and metadata as ALGOSMSV0_MESSAGE object.
 */
export const unsealMessageFromNote = (
  note: Uint8Array,
  senderAlgoAddress: string,
  recipientAlgoAccount: algosdk.Account
): ALGOSMSV0_MESSAGE => {
  const nonce = algosdk
    .decodeAddress(senderAlgoAddress)
    .publicKey.subarray(0, nacl.box.nonceLength);
  const notePayload = algosdk.decodeObj(note) as ALGOSMSV0_NOTE;

  if (!notePayload || !notePayload.t || notePayload.t !== ALGOSMSV0_TYPE_NOTE) {
    throw new Error(UNKNOWN_ENCYPTED_PAYLOAD_SCHEMA_ERROR_MSG);
  }

  // Convert recipient's private signing key into a cipher key
  const rcptSecretKey = ed2curve.convertSecretKey(recipientAlgoAccount.sk);

  // Unseal the box
  const decryptedBuffer = nacl.box.open(
    notePayload.cT,
    nonce,
    notePayload.otPK,
    rcptSecretKey
  );

  // Check if decryption is OK
  if (!decryptedBuffer || decryptedBuffer.length === 0) {
    throw new Error(INVALID_CIPHERTEXT_ERROR_MSG);
  }

  // Decode MsgPacked structure into ALGOSMS format;
  const message = algosdk.decodeObj(decryptedBuffer) as any;
  if (!message || !message.t) {
    throw new Error(UNSUPPORETD_MSG_SCHEMA_ERROR_MSG);
  }

  switch (message.t) {
    case ALGOSMSV0_TYPE_MSG:
      return message as ALGOSMSV0_MESSAGE;
    default:
      throw new Error(UNSUPPORTED_MSG_SCHEMA_VER_ERROR_MSG);
  }
};
