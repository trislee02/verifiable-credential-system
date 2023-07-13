import JSEncrypt from 'jsencrypt';
import CryptoJS from 'crypto-js';
import assert from 'assert';
// https://www.devglan.com/online-tools/rsa-encryption-decryption

const MAX_MESSAGE_CHUNK_LENGTH = 117;
const CIPHERTEXT_CHUNK_LENGTH = 172;

// Generate key pair
export function genKeyPair(numBits = 1024) {
  const encrypt = new JSEncrypt({ default_key_size: numBits });
  return {
    privateKey: encrypt.getPrivateKey(),
    publicKey: encrypt.getPublicKey()
  };
}

// // Get public key in hexadecimal format
// export function getPublicKeyHex(keyPair) {
//   const encrypt = new JSEncrypt();
//   encrypt.setPublicKey(keyPair.publicKey);
//   return encrypt.getPublicKeyHex();
// }

// // Get private key in hexadecimal format
// export function getPrivateKeyHex(keyPair) {
//   const encrypt = new JSEncrypt();
//   encrypt.setPrivateKey(keyPair.privateKey);
//   return encrypt.getPrivateKeyHex();
// }


export function convertPrivateKeyToRSAKey(privateKey) {
  if(typeof privateKey !== 'string') return privateKey;

  const privateKeyPrefix = '-----BEGIN PRIVATE KEY-----';
  const privateKeySuffix = '-----END PRIVATE KEY-----';

  let formattedPrivateKey = privateKey.trim();
  if (!formattedPrivateKey.startsWith(privateKeyPrefix)) {
    formattedPrivateKey = `${privateKeyPrefix}\n${formattedPrivateKey}`;
  }
  if (!formattedPrivateKey.endsWith(privateKeySuffix)) {
    formattedPrivateKey = `${formattedPrivateKey}\n${privateKeySuffix}`;
  }

  const encrypt = new JSEncrypt();
  encrypt.setPrivateKey(formattedPrivateKey);

  return encrypt.getKey();
}

export function convertPublicKeyToRSAKey(publicKey) {
  if(typeof publicKey !== 'string') return publicKey;

  const publicKeyPrefix = '-----BEGIN PUBLIC KEY-----';
  const publicKeySuffix = '-----END PUBLIC KEY-----';

  let formattedPublicKey = publicKey.trim();
  if (!formattedPublicKey.startsWith(publicKeyPrefix)) {
    formattedPublicKey = `${publicKeyPrefix}\n${formattedPublicKey}`;
  }
  if (!formattedPublicKey.endsWith(publicKeySuffix)) {
    formattedPublicKey = `${formattedPublicKey}\n${publicKeySuffix}`;
  }

  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(formattedPublicKey);

  return encrypt.getKey();
}

function splitStringIntoChunks(str, chunkLength) {
  const chunks = [];

  for (let i = 0; i < str.length; i += chunkLength) {
    let chunk = str.substr(i, chunkLength);
    chunks.push(chunk);
    while(chunk.length < splitStringIntoChunks) chunk.length += " ";
  }

  return chunks;
}
// RSA encryption
export function rsaEncrypt(key, message) {
  key = convertPrivateKeyToRSAKey(key); /// 
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(key);
  
  const messages = splitStringIntoChunks(message.trim(), MAX_MESSAGE_CHUNK_LENGTH);
  let cipherText = "";
  for(let i = 0; i < messages.length; ++i){
    cipherText += encrypt.encrypt(messages[i]);
  }
  return cipherText;
}

// RSA decryption
export function rsaDecrypt(key, cipherText) {
  key = convertPublicKeyToRSAKey(key); /// 

  const encrypt = new JSEncrypt();
  encrypt.setPrivateKey(key);

  const cipherTexts = splitStringIntoChunks(cipherText, CIPHERTEXT_CHUNK_LENGTH);
  let rawMessage = "";
  for(let i = 0; i < cipherTexts.length; ++i){
    rawMessage += encrypt.decrypt(cipherTexts[i]);
  }

  return rawMessage.trim();
}
// RSA signing
export function rsaSign(privateKey, message) {
  privateKey = convertPrivateKeyToRSAKey(privateKey); /// 

  const encrypt = new JSEncrypt();
  encrypt.setPrivateKey(privateKey);
  return encrypt.sign(message, CryptoJS.SHA256, 'sha256');
}

// RSA verification
export function rsaVerify(publicKey, message, signature) {
  publicKey = convertPublicKeyToRSAKey(publicKey); /// 

  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(publicKey);
  return encrypt.verify(message, signature, CryptoJS.SHA256);
}

export function verifyKeyPair(privateKey, publicKey) { 
  privateKey = convertPrivateKeyToRSAKey(privateKey); /// 
  publicKey = convertPublicKeyToRSAKey(publicKey); /// 

  // const randomMessage = Math.random().toString();
  // const signature = rsaSign(privateKey, randomMessage);
  // return rsaVerify(publicKey, randomMessage, signature) && 
  return privateKey.getPublicBaseKeyB64() === publicKey.getPublicBaseKeyB64(); // getPrivateBaseKeyB64
}

// Test RSA export functions
export function testRSA() {
  const privateKeyText = `MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAIi1I+BwFbbzbaS0ZjzhqUGjUTEbFURlE8fnmFWLNFjyODFJqe78nqmkPAcDPUHCs2BnKQgOdLp/ECBq1U6qff2jZM85napT8h0ymX6wPT3J92Sg/OB9A2HjpNEyYCa/dgPOoLFidI9+MhwXyQyoUJI3nXHmkee+NWy6auWV6RfLAgMBAAECgYAvCuZFnUxboHjibJGh8aVkyOZvl3pCBuY/rBpnlXd2BCQCEe9AJf4TMkjVwO+baXyAd/9OnmrcokzSWvD8GP8xfAkHplmpZihOwY4zmGgvqTLNtJJdPC8gK8ynZWyORP3KTtteA+/7xkM9nvuzy4M3ZWHUH9gib/zoKqmey6YewQJBAO+fgUvqgh28GQKB0M3ePds0Q0u46vkErCVqg6y8hEfskYtcZkDxbJFCmYAinAuUOgta9I+OYbh5/ElVznEgZG0CQQCSDQEbug/JCQIrOSFp0fenLJNmhN6Oes0MdAXwNUF2OC1fzuibfvZbSKTNqyFuy7/fsOZ7SlTM+16OfDyW4RoXAkBjmt/6GI7hoVCcFC4hhSIdPkpC7ajuvhx4qR/2653o79NIJK50jGZes1pvQvOudHz0P2itS7gfIMXYDgz0RUy5AkEAhtrNGC3v31+bChABYzVFp63IGJQ873BCHuqOhSKXZDIw61Mggltz3AuyaFlIUIZ/j2tHFbYnoPHFeGkMhQAqVwJBANV1S4fyHUVZ2CYA3REDhuVarw5/JCe9eYYhpRLiXoUt0kc47xPe/FxpfXhrPHRPL380pvFUYkJWTUVBdbV924Q=`;
  
  const publicKeyText = `MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCItSPgcBW2822ktGY84alBo1ExGxVEZRPH55hVizRY8jgxSanu/J6ppDwHAz1BwrNgZykIDnS6fxAgatVOqn39o2TPOZ2qU/IdMpl+sD09yfdkoPzgfQNh46TRMmAmv3YDzqCxYnSPfjIcF8kMqFCSN51x5pHnvjVsumrllekXywIDAQAB`;
  
  const privateKey = convertPrivateKeyToRSAKey(privateKeyText);
  
  const publicKey = convertPublicKeyToRSAKey(publicKeyText);
  // console.log(privateKey);
  // console.log(publicKey);

  assert(verifyKeyPair(privateKeyText, publicKeyText)); // Private key must match public key

  // console.log(getPrivateKeyHex(keyPair));
  // console.log(getPublicKeyHex(keyPair));

  let tmp = "Hello World";
  const encrypted = rsaEncrypt(publicKey, tmp);
  // console.log(encrypted);

  const decrypted = rsaDecrypt(privateKey, encrypted);
  assert(decrypted.trim() === tmp.trim()); // decrypted message === raw messaege
  // console.log(decrypted);
  // console.log(encrypted.length);

  const signature = rsaSign(privateKey, 'Hello, world!');
  // console.log(signature);
  const verified = rsaVerify(publicKey, 'Hello, world!', signature); // signature must be correct
  assert(verified === true);
}
