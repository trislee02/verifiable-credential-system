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

export function getPublicCredential(cred) {
  delete cred.credentialSubject;
  return cred;
}

export const NativeOperator = {
  EQ: "$EQ",
  NE: "$NE",
  LT: "$LT",
  LTE: "$LTE",
  GT: "$GT",
  GTE: "$GTE",
  INVALID_OP: "",
};

export function getOp(opStr) {
  switch (opStr) {
    case "$EQ":
      return NativeOperator.EQ;
    case "$GT":
      return NativeOperator.GT;
    case "$GTE":
      return NativeOperator.GTE;
    case "$NE":
      return NativeOperator.NE;
    case "$LT":
      return NativeOperator.LT;
    case "$LTE":
      return NativeOperator.LTE;
    default:
      return NativeOperator.INVALID_OP;
  }
}

export function getOperatorText(operator) {
  switch (operator) {
    case NativeOperator.EQ:
      return "Equal";
    case NativeOperator.NE:
      return "Not Equal";
    case NativeOperator.LT:
      return "Less Than";
    case NativeOperator.LTE:
      return "Less Than or Equal";
    case NativeOperator.GT:
      return "Greater Than";
    case NativeOperator.GTE:
      return "Greater Than or Equal";
    default:
      return "Invalid Operator";
  }
}

export function mapOperatorToSymbol(operator) {
  switch (operator) {
    case NativeOperator.EQ:
      return "=";
    case NativeOperator.GT:
      return ">";
    case NativeOperator.GTE:
      return "≥";
    case NativeOperator.NE:
      return "≠";
    case NativeOperator.LT:
      return "<";
    case NativeOperator.LTE:
      return "≤";
    default:
      return "";
  }
}
