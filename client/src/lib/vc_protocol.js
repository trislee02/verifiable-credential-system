import _ from 'lodash';
import assert from "assert";
import {
  rsaDecrypt,
  rsaEncrypt,
  rsaSign,
  rsaVerify,
  convertPrivateKeyToRSAKey,
  convertPublicKeyToRSAKey,
  verifyKeyPair,
} from "./crypto_lib";
import { getPublicCredential } from "./vc";
const sha256 = require("crypto-js/sha256");
export const InvalidSchema = "VCSynthesisError: InvalidSchema";
export const InvalidCredential = "VCSynthesisError: InvalidCredential";
export const Unsatisfiable = "VCSynthesisError: Unsatisfiable";
export const BadAssignment = "VCSynthesisError: BadAssignment";
export const InvalidVCPresentation = "VCSynthesisError: InvalidVCPresentation";

export function ignoreFields(x, fields) {
  // x: any, fields: Array<string>
  const newX = { ...x };
  Object.assign(newX, x);
  for (let i = 0; i < fields.length; i++) {
    if (Object.prototype.hasOwnProperty.call(newX, fields[i])) {
      delete newX[fields[i]];
    }
  }
  return newX;
}
// export function flattenJson(obj: any, prefix = ''): [string, any][] {
export function flattenJson(obj, prefix = "") {
  const result = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const field = prefix ? `${prefix}.${key}` : key;

      if (value instanceof Array || typeof value !== "object") {
        result.push([field, value]);
      } else if (value !== null) {
        const nestedPrefix = prefix ? `${prefix}.${key}` : key;
        result.push(...flattenJson(value, nestedPrefix));
      }
    }
  }

  result.sort();

  return result;
}

export async function issueVC({
  issuer,
  holder,
  issuerPublicKey,
  issuerPrivateKey,
  holderPublicKey,
  types,
  expirationDate,
  credentialSubject,
}) {
  const curDate = new Date().toISOString();
  const tempCred = {
    issuer,
    holder,
    issuerPublicKey,
    holderPublicKey,
    types,
    issuanceDate: curDate,
    ...(expirationDate && { expirationDate }),
    encryptedData: "",
    credentialSubject,
  };

  const standardPublicCred = ignoreFields(tempCred, [
    "id",
    "encryptedData",
    "proof",
  ]);

  delete tempCred.credentialSubject;
  tempCred.encryptedData = rsaEncrypt(
    holderPublicKey,
    JSON.stringify(credentialSubject)
  );

  const signature = rsaSign(issuerPrivateKey, JSON.stringify(tempCred));
  const id = sha256(signature).toString();

  const cred = {
    ...tempCred,
    id,
    credentialSubject,
    proof: {
      type: "RSASignature",
      created: curDate,
      proofPurpose: "ASSERTION",
      value: signature,
      verificationMethod: issuerPublicKey,
    },
  };

  return cred;
}
export function verifyValidVC(credential) {
  const { proof, credentialSubject, id, ...publicFields } = credential;

  const signature = proof.value;

  try {
    const result =
      rsaVerify(
        publicFields.issuerPublicKey,
        JSON.stringify(publicFields),
        signature
      ) && id == sha256(signature).toString();

    return result;
  } catch (err) {
    console.log(err);
    return false;
  }
}

export async function decryptVC({ credential, holderPrivateKey }) {
  if (!verifyValidVC(credential)) throw InvalidCredential;

  let res = _.merge({credentialSubject: JSON.parse(
    rsaDecrypt(holderPrivateKey, credential.encryptedData)
  )}, credential);

  return res;
}

export async function createSchema({
  name,
  verifier,
  verifierPublicKey,
  verifierPrivateKey,
  checks,
  requests,
}) {
  const curDate = new Date().toISOString();

  const tempSchema = {
    name,
    verifier,
    verifierPublicKey,
    issuanceDate: curDate,
    checks,
    requests,
  };

  const signature = rsaSign(verifierPrivateKey, JSON.stringify(tempSchema));

  const id = sha256(signature).toString();

  const schema = {
    ...tempSchema,
    id,
    proof: {
      type: "RSASignature",
      created: curDate,
      proofPurpose: "ASSERTION",
      value: signature,
      verificationMethod: verifierPublicKey,
    },
  };

  return schema;
}

export function verifyValidSchema(schema) {
  const { proof, id, ...publicFields } = schema;
  const signature = proof.value;

  // console.log(`Verify singature ${signature} for `)
  // console.log(publicFields)
  // console.log('public key is ', (publicFields as any).issuerPublicKey)
  const result =
    rsaVerify(
      publicFields.verifierPublicKey,
      JSON.stringify(publicFields),
      signature
    ) && id === sha256(signature).toString();

  return result;
}
export function compare(data1, data2, operation) {
  switch (operation) {
    case "$EQ":
      return data1 === data2;
    case "$NE":
      return data1 !== data2;
    case "$LT":
      return data1 < data2;
    case "$LTE":
      return data1 <= data2;
    case "$GT":
      return data1 > data2;
    case "$GTE":
      return data1 >= data2;
    default:
      throw InvalidSchema;
  }
}

export function getRequestedData(credentials, schema) {
  if (schema.checks.length !== credentials.length) throw Unsatisfiable;
  for (let i = 0; i < schema.checks.length; ++i) {
    const tmp = flattenJson(schema.checks[i]);
    for (let j = 0; j < tmp.length; ++j) {
      const key = tmp[j][0];
      const op = tmp[j][1][0];
      const val = tmp[j][1][1];

      if (
        !credentials[i] ||
        !compare(credentials[i].credentialSubject[key], val, op)
      ) {
        throw Unsatisfiable;
      }
    }
  }
  //
  const result = [];
  for (let i = 0; i < schema.requests.length; ++i) {
    const tmp = schema.requests[i].trim().split(".");
    const index = Number(tmp[0]);
    const fieldName = tmp[1];
    result.push(credentials[index].credentialSubject[fieldName]);
  }
  return result;
}
export async function generateVCPresentation({
  holder,
  holderPrivateKey,
  holderPublicKey,
  verifierPublicKey,
  schema,
  credentials,
}) {
  const curDate = new Date().toISOString();

  const tempPresentation = {
    holder,
    schema,
    encryptedData: "",
  };

  tempPresentation.encryptedData = rsaEncrypt(
    verifierPublicKey,
    JSON.stringify(credentials)
  );

  const signature = rsaSign(holderPrivateKey, JSON.stringify(tempPresentation));

  // console.log(`${signature} is the signature when siging on`)
  // console.log(tempCred)
  const id = sha256(signature).toString();

  const presentation = {
    ...tempPresentation,
    id,
    proof: {
      type: "RSASignature",
      created: curDate,
      proofPurpose: "ASSERTION",
      value: signature,
      verificationMethod: holderPublicKey,
    },
  };
  return presentation;
}

export function verifiyVCPresentationSignatures(
  presentation,
  verifierPrivateKey
) {
  const { proof, id, ...publicFields } = presentation;

  const { value: signature, verificationMethod: holderPublicKey } = proof;

  // validate credentials
  const schema = presentation.schema;
  if (
    !(
      rsaVerify(holderPublicKey, JSON.stringify(publicFields), signature) &&
      id === sha256(signature).toString()
    )
  )
    throw InvalidVCPresentation; // validate signature & schema

  if (!verifyValidSchema(schema)) {
    throw InvalidSchema;
  }

  const credentials = JSON.parse(
    rsaDecrypt(verifierPrivateKey, presentation.encryptedData)
  );

  for (let i = 0; i < credentials.length; ++i) {
    if (!verifyValidVC(credentials[i])) {
      throw InvalidCredential;
    }
  }

  return getRequestedData(credentials, schema);
}

export async function verifiyVCPresentation({
  verifierPrivateKey,
  schema,
  presentation,
}) {
  // get raw requested values
  const requestedRawValues = verifiyVCPresentationSignatures(
    presentation,
    verifierPrivateKey
  );

  if (JSON.stringify(presentation.schema) !== JSON.stringify(schema))
    throw InvalidVCPresentation;

  return requestedRawValues;
}

export async function runVCProtocolTest() {
  const privateKeyText = `MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAIi1I+BwFbbzbaS0ZjzhqUGjUTEbFURlE8fnmFWLNFjyODFJqe78nqmkPAcDPUHCs2BnKQgOdLp/ECBq1U6qff2jZM85napT8h0ymX6wPT3J92Sg/OB9A2HjpNEyYCa/dgPOoLFidI9+MhwXyQyoUJI3nXHmkee+NWy6auWV6RfLAgMBAAECgYAvCuZFnUxboHjibJGh8aVkyOZvl3pCBuY/rBpnlXd2BCQCEe9AJf4TMkjVwO+baXyAd/9OnmrcokzSWvD8GP8xfAkHplmpZihOwY4zmGgvqTLNtJJdPC8gK8ynZWyORP3KTtteA+/7xkM9nvuzy4M3ZWHUH9gib/zoKqmey6YewQJBAO+fgUvqgh28GQKB0M3ePds0Q0u46vkErCVqg6y8hEfskYtcZkDxbJFCmYAinAuUOgta9I+OYbh5/ElVznEgZG0CQQCSDQEbug/JCQIrOSFp0fenLJNmhN6Oes0MdAXwNUF2OC1fzuibfvZbSKTNqyFuy7/fsOZ7SlTM+16OfDyW4RoXAkBjmt/6GI7hoVCcFC4hhSIdPkpC7ajuvhx4qR/2653o79NIJK50jGZes1pvQvOudHz0P2itS7gfIMXYDgz0RUy5AkEAhtrNGC3v31+bChABYzVFp63IGJQ873BCHuqOhSKXZDIw61Mggltz3AuyaFlIUIZ/j2tHFbYnoPHFeGkMhQAqVwJBANV1S4fyHUVZ2CYA3REDhuVarw5/JCe9eYYhpRLiXoUt0kc47xPe/FxpfXhrPHRPL380pvFUYkJWTUVBdbV924Q=`;
  const publicKeyText = `MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCItSPgcBW2822ktGY84alBo1ExGxVEZRPH55hVizRY8jgxSanu/J6ppDwHAz1BwrNgZykIDnS6fxAgatVOqn39o2TPOZ2qU/IdMpl+sD09yfdkoPzgfQNh46TRMmAmv3YDzqCxYnSPfjIcF8kMqFCSN51x5pHnvjVsumrllekXywIDAQAB`;

  // const privateKey = convertPrivateKeyToRSAKey(privateKeyText);
  // const publicKey = convertPublicKeyToRSAKey(publicKeyText);

  const issuerKeys = {
    private_key: privateKeyText,
    public_key: publicKeyText,
  };
  const holderKeys = issuerKeys;
  const verifierKeys = issuerKeys;
  const issuer = "A";
  const holder = "B";
  const verifier = "C";

  // assert correct key pairs
  assert(
    verifyKeyPair(issuerKeys.private_key, issuerKeys.public_key) &&
      verifyKeyPair(holderKeys.private_key, holderKeys.public_key) &&
      verifyKeyPair(verifierKeys.private_key, verifierKeys.public_key)
  );

  //////////////////////////////////////////////////////////////////////////////////////////////////////
  //// STEP 1: Holder create credential
  let fullCredential = await issueVC({
    issuer: issuer,
    holder: holder,
    issuerPublicKey: issuerKeys.public_key,
    issuerPrivateKey: issuerKeys.private_key,
    holderPublicKey: holderKeys.public_key,
    expirationDate: new Date("2024-05-20").toISOString(),
    credentialSubject: {
      types: "UniversityDegreeCredential",
      degree_type: "BachelorDegree",
      degree_name: "Bachelor of Science and Arts",
      class: 2025,
      year: 2024,
      school_name: "HCMUS",
    },
  });

  console.log("Credential created is ");
  console.log(fullCredential);
  assert.equal(verifyValidVC(fullCredential), true);

  // issuer send PUBLIC VERSION of the credential to holder
  const publicCredential = getPublicCredential(fullCredential);
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  //// STEP 2: Holder decrypt the credential to get the raw content
  const rawFullCredential = await decryptVC({
    holderPrivateKey: holderKeys.private_key,
    credential: publicCredential,
  });
  assert(rawFullCredential.credentialSubject !== undefined);

  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  //// STEP 3: Verifier creates schema/form
  const schema = await createSchema({
    verifier: verifier,
    verifierPrivateKey: verifierKeys.private_key,
    verifierPublicKey: verifierKeys.public_key,
    checks: [
      {
        types: ["$EQ", "UniversityDegreeCredential"],
        degree_type: ["$EQ", "BachelorDegree"],
        year: ["$LT", 2025],
      },
      {
        types: ["$EQ", "UniversityDegreeCredential"],
      },
    ],
    requests: ["0.school_name", "1.degree_name"],
    // request school_name from the first credential, degree_name from the second supplied credential
  });

  console.log("Created schema");
  console.log(JSON.stringify(schema));

  assert.equal(verifyValidSchema(schema), true);
  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  //// STEP 4: Prover creates submission
  const presentation = await generateVCPresentation({
    holder: holder,
    holderPrivateKey: holderKeys.private_key,
    holderPublicKey: holderKeys.public_key,
    verifierPublicKey: verifierKeys.public_key,
    schema: schema,
    credentials: [rawFullCredential, rawFullCredential],
  });

  console.log("Holder creates presentation/submission ...");
  console.log(JSON.stringify(presentation));

  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  //// STEP 5: Verifier verify submission/presentation and get the data

  const result = await verifiyVCPresentation({
    verifierPrivateKey: verifierKeys.private_key,
    schema,
    presentation,
  });

  assert(result); // not throw

  console.log("Requested data is ",result);
}
