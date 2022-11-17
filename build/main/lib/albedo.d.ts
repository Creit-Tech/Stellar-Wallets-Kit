import { PublicKeyIntentResult, TxIntentResult } from '@albedo-link/intent';
export declare const albedoGetPublicKey: () => Promise<PublicKeyIntentResult>;
export declare const albedoSignTransaction: (params: IAlbedoSignParams) => Promise<TxIntentResult>;
export declare enum AlbedoNetwork {
    PUBLIC = "public",
    TESTNET = "testnet"
}
export interface IAlbedoSignParams {
    xdr: string;
    pubKey?: string;
    network: AlbedoNetwork;
}
