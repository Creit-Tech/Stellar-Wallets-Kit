import { ISignClient } from '@walletconnect/types/dist/types/sign-client/client';
import { SessionTypes } from '@walletconnect/types/dist/types/sign-client/session';
export declare enum WalletConnectTargetChain {
    PUBLIC = "stellar:pubnet",
    TESTNET = "stellar:testnet"
}
export declare enum WalletConnectAllowedMethods {
    SIGN = "stellar_signXDR",
    SIGN_AND_SUBMIT = "stellar_signAndSubmitXDR"
}
export declare const createWalletConnectClient: (params: {
    projectId: string;
    name: string;
    description: string;
    url: string;
    icons: string[];
}) => Promise<ISignClient>;
export declare const connectWalletConnect: (params: {
    client: ISignClient;
    chains: WalletConnectTargetChain[];
    methods?: WalletConnectAllowedMethods[];
    pairingTopic?: string;
}) => Promise<SessionTypes.Struct>;
export declare const parseWalletConnectSession: (session: SessionTypes.Struct) => IParsedWalletConnectSession;
export declare const makeWalletConnectRequest: (params: IWalletConnectRequestParams) => Promise<{
    signedXDR: string;
}>;
export interface IParsedWalletConnectSession {
    id: string;
    name: string;
    description: string;
    url: string;
    icons: string;
    accounts: Array<{
        network: 'pubnet' | 'testnet';
        publicKey: string;
    }>;
}
export interface IWalletConnectRequestParams {
    client: ISignClient;
    xdr: string;
    topic: string;
    method?: WalletConnectAllowedMethods;
    chain: WalletConnectTargetChain;
}
//# sourceMappingURL=walletconnect.d.ts.map