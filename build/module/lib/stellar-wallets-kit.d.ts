import { IParsedWalletConnectSession, WalletConnectAllowedMethods, WalletConnectTargetChain } from './walletconnect';
export declare enum WalletType {
    XBULL = "XBULL",
    FREIGHTER = "FREIGHTER",
    ALBEDO = "ALBEDO",
    RABET = "RABET",
    WALLET_CONNECT = "WALLET_CONNECT"
}
export declare enum WalletNetwork {
    PUBLIC = "Public Global Stellar Network ; September 2015",
    FUTURENET = "Test SDF Future Network ; October 2022",
    TESTNET = "Test SDF Network ; September 2015"
}
export interface IStellarWalletsKitSignParams {
    xdr: string;
    publicKey?: string;
    network?: WalletNetwork;
    method?: WalletConnectAllowedMethods;
    chain?: WalletConnectTargetChain;
}
export interface IConnectWalletConnectParams {
    chains?: WalletConnectTargetChain[];
    methods?: WalletConnectAllowedMethods[];
    pairingTopic?: string;
}
export declare class StellarWalletsKit {
    private selectedWallet;
    private network;
    constructor(params: {
        selectedWallet: WalletType;
        network: WalletNetwork;
    });
    setNetwork(network: WalletNetwork): void;
    setWallet(type: WalletType): void;
    getPublicKey(): Promise<string>;
    sign(params: IStellarWalletsKitSignParams): Promise<{
        signedXDR: string;
    }>;
    private WCSignClient?;
    private WCActiveSession?;
    /**
     * Allows manually setting the current active session to be used in the kit when doing WalletConnect requests
     *
     * @param sessionId The session ID is a placeholder for the session "topic", term used in WalletConnect
     * */
    setSession(sessionId: string): void;
    onSessionDeleted(cb: (sessionId: string) => void): void;
    startWalletConnect(params: {
        projectId: string;
        name: string;
        description: string;
        url: string;
        icons: string[];
    }): Promise<void>;
    connectWalletConnect(params?: IConnectWalletConnectParams): Promise<IParsedWalletConnectSession>;
    getSessions(): Promise<IParsedWalletConnectSession[]>;
    private getWalletConnectPublicKey;
    private signWalletConnectTransaction;
}
