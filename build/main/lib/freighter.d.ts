export declare const isFreighterInstalled: () => Promise<boolean>;
export declare const freighterGetPublicKey: () => Promise<string>;
export declare const freighterSignTransaction: (params: IFreighterSignTxParams) => Promise<string>;
export declare const freighterSignBlob: (params: IFreighterSignBlobParams) => Promise<string>;
export interface IFreighterSignTxParams {
    xdr: string;
    accountToSign?: string;
    networkPassphrase: string;
}
export interface IFreighterSignBlobParams {
    b64blob: string;
    accountToSign?: string;
}
//# sourceMappingURL=freighter.d.ts.map