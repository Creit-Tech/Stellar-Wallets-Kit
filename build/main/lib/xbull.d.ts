export declare const xBullGetPublicKey: () => Promise<string>;
export declare const xBullSignTransaction: (params: IxBullSignParams) => Promise<{
    signedXDR: string;
}>;
export interface IxBullSignParams {
    xdr: string;
    publicKey?: string;
    networkPassphrase?: string;
}
//# sourceMappingURL=xbull.d.ts.map