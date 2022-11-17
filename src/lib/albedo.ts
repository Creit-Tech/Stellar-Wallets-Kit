import albedo, {
  PublicKeyIntentResult,
  TxIntentResult,
} from '@albedo-link/intent';

export const albedoGetPublicKey = async (): Promise<PublicKeyIntentResult> => {
  return albedo.publicKey({});
};

export const albedoSignTransaction = async (
  params: IAlbedoSignParams
): Promise<TxIntentResult> => {
  return albedo.tx({
    xdr: params.xdr,
    pubkey: params.pubKey,
    network: params.network,
  });
};

export enum AlbedoNetwork {
  PUBLIC = 'public',
  TESTNET = 'testnet',
}

export interface IAlbedoSignParams {
  xdr: string;
  pubKey?: string;
  network: AlbedoNetwork;
}
