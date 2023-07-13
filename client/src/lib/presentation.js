// import { CredentialInterface, DataSignatureInterface } from './vc';
// import { SchemaInterface } from './schema';

// export interface VCPresentationInterface {
//   id: string;
//   holder: string;
//   credentials: CredentialInterface[];
//   schema: SchemaInterface;
//   requestedRawValues?: any[];
//   encryptedData: string;
//   proof: DataSignatureInterface;
// }

// export function getPublicPresentation(
//   pres: VCPresentationInterface,
// ): VCPresentationInterface {
//   delete pres.requestedRawValues;
//   return pres;
// }