// export enum ProofPurpose {
//   ASSERTION = 'ASSERTION',
//   AUTHENTICATION = 'AUTHENTICATION',
// }

// export interface DataSignatureInterface {
//   type: string;
//   created: string;
//   proofPurpose: ProofPurpose;
//   value: string;
//   verificationMethod: string;
// }

// export interface FieldIndexInterface {
//   fieldName: string;
//   fieldIndex: number;
// }

// export interface CredentialInterface {
//   id: string;
//   types: string[];
//   issuer: string;
//   issuerPublicKey: string;
//   holderPublicKey: string;
//   holder: string;
//   issuanceDate: string;
//   fieldIndexes: Array<FieldIndexInterface>;
//   fieldMerkleRoot: string;
//   expirationDate?: string;
//   credentialSubject?: any;
//   encryptedData: string;
//   encryptedDataForIssuer: string;
//   proof: DataSignatureInterface;
// }

export function getPublicCredential(
  cred,
) {
  delete cred.credentialSubject;
  return cred;
}