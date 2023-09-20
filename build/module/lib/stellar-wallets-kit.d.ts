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
export interface IStellarWalletsSignBlob {
    blob: string;
    publicKey?: string;
    network?: WalletNetwork;
    method?: WalletConnectAllowedMethods;
    chain?: WalletConnectTargetChain;
}
export interface IStellarWalletsSignAuthEntry {
    entryPreimageXDR: string;
    publicKey?: string;
    network?: WalletNetwork;
    method?: WalletConnectAllowedMethods;
    chain?: WalletConnectTargetChain;
}
export interface IStellarWalletsSignTx {
    xdr: string;
    publicKey?: string;
    network?: WalletNetwork;
    method?: WalletConnectAllowedMethods;
    chain?: WalletConnectTargetChain;
}
export declare type IStellarWalletsKitSignParams = IStellarWalletsSignBlob | IStellarWalletsSignTx | IStellarWalletsSignAuthEntry;
export interface IConnectWalletConnectParams {
    chains?: WalletConnectTargetChain[];
    methods?: WalletConnectAllowedMethods[];
    pairingTopic?: string;
}
export interface ISupportedWallet {
    name: string;
    type: WalletType;
    isAvailable: boolean;
    icon: string;
}
export declare class StellarWalletsKit {
    private selectedWallet;
    private network;
    private modalElement?;
    constructor(params: {
        selectedWallet: WalletType;
        network: WalletNetwork;
    });
    /**
     * This method will return an array with all wallets supported by this kit but will let you know those the user have already installed/has access to
     * There are wallets that are by default available since they either don't need to be installed or have a fallback
     */
    static getSupportedWallets(): Promise<ISupportedWallet[]>;
    setNetwork(network: WalletNetwork): void;
    setWallet(type: WalletType): void;
    getPublicKey(): Promise<string>;
    sign(params: IStellarWalletsKitSignParams): Promise<{
        signedXDR: string;
    }>;
    openModal(params: {
        onWalletSelected: (option: ISupportedWallet) => void;
        onClosed?: (err: Error) => void;
        modalDialogStyles?: {
            [name: string]: string | number | undefined | null;
        };
        allowedWallets?: WalletType[];
        modalTitle?: string;
        notAvailableText?: string;
    }): void;
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
    closeSession(sessionId: string, reason?: string): Promise<void>;
    getSessions(): Promise<IParsedWalletConnectSession[]>;
    private getWalletConnectPublicKey;
    private signWalletConnectTransaction;
}
//# sourceMappingURL=stellar-wallets-kit.d.ts.map