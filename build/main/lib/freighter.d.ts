export declare const isFreighterInstalled: () => boolean;
export declare const freighterGetPublicKey: () => Promise<string>;
export declare const freighterSignTransaction: (params: IFreighterSignParams) => Promise<string>;
export interface IFreighterSignParams {
    xdr: string;
    accountToSign?: string;
    networkPassphrase: string;
}
