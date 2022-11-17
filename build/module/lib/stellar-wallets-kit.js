import { albedoGetPublicKey, AlbedoNetwork, albedoSignTransaction, } from './albedo';
import { freighterGetPublicKey, freighterSignTransaction } from './freighter';
import { rabetGetPublicKey, RabetNetwork, rabetSignTransaction } from './rabet';
import { connectWalletConnect, createWalletConnectClient, makeWalletConnectRequest, parseWalletConnectSession, WalletConnectTargetChain, } from './walletconnect';
import { xBullGetPublicKey, xBullSignTransaction } from './xbull';
export var WalletType;
(function (WalletType) {
    WalletType["XBULL"] = "XBULL";
    WalletType["FREIGHTER"] = "FREIGHTER";
    WalletType["ALBEDO"] = "ALBEDO";
    WalletType["RABET"] = "RABET";
    WalletType["WALLET_CONNECT"] = "WALLET_CONNECT";
})(WalletType || (WalletType = {}));
export var WalletNetwork;
(function (WalletNetwork) {
    WalletNetwork["PUBLIC"] = "Public Global Stellar Network ; September 2015";
    WalletNetwork["FUTURENET"] = "Test SDF Future Network ; October 2022";
    WalletNetwork["TESTNET"] = "Test SDF Network ; September 2015";
})(WalletNetwork || (WalletNetwork = {}));
export class StellarWalletsKit {
    selectedWallet;
    network;
    constructor(params) {
        this.setWallet(params.selectedWallet);
        this.setNetwork(params.network);
    }
    setNetwork(network) {
        if (!Object.values(WalletNetwork).includes(network)) {
            throw new Error(`Wallet network "${network}" is not supported`);
        }
        this.network = network;
    }
    setWallet(type) {
        if (!Object.values(WalletType).includes(type)) {
            throw new Error(`Wallet type "${type}" is not supported`);
        }
        this.selectedWallet = type;
    }
    async getPublicKey() {
        if (!this.selectedWallet) {
            throw new Error('Please set the wallet type first');
        }
        switch (this.selectedWallet) {
            case WalletType.XBULL:
                return xBullGetPublicKey();
            case WalletType.FREIGHTER:
                return freighterGetPublicKey();
            case WalletType.ALBEDO:
                return albedoGetPublicKey().then((response) => response.pubkey);
            case WalletType.RABET:
                return rabetGetPublicKey().then((response) => response.publicKey);
            case WalletType.WALLET_CONNECT:
                return this.getWalletConnectPublicKey();
            default:
                throw new Error(`Wallet type ${this.selectedWallet} not supported`);
        }
    }
    async sign(params) {
        if (!this.selectedWallet) {
            throw new Error('Please set the wallet type first');
        }
        switch (this.selectedWallet) {
            case WalletType.XBULL:
                return xBullSignTransaction({
                    xdr: params.xdr,
                    publicKey: params.publicKey,
                    networkPassphrase: params.network,
                });
            case WalletType.FREIGHTER:
                return freighterSignTransaction({
                    xdr: params.xdr,
                    networkPassphrase: params.network || this.network,
                    accountToSign: params.publicKey,
                }).then((response) => ({ signedXDR: response }));
            case WalletType.ALBEDO:
                return albedoSignTransaction({
                    xdr: params.xdr,
                    pubKey: params.publicKey,
                    network: this.network === WalletNetwork.PUBLIC
                        ? AlbedoNetwork.PUBLIC
                        : AlbedoNetwork.TESTNET,
                }).then((response) => ({ signedXDR: response.xdr }));
            case WalletType.RABET:
                return rabetSignTransaction({
                    xdr: params.xdr,
                    network: this.network === WalletNetwork.PUBLIC
                        ? RabetNetwork.PUBLIC
                        : RabetNetwork.TESTNET,
                }).then((response) => ({ signedXDR: response.xdr }));
            case WalletType.WALLET_CONNECT:
                return this.signWalletConnectTransaction({
                    xdr: params.xdr,
                    method: params.method,
                    chain: params.chain,
                });
            default:
                throw new Error(`Something went wrong, wallet type ${this.selectedWallet} not handled`);
        }
    }
    // ---- WalletConnect methods
    WCSignClient;
    WCActiveSession;
    /**
     * Allows manually setting the current active session to be used in the kit when doing WalletConnect requests
     *
     * @param sessionId The session ID is a placeholder for the session "topic", term used in WalletConnect
     * */
    setSession(sessionId) {
        this.WCActiveSession = sessionId;
    }
    onSessionDeleted(cb) {
        if (!this.WCSignClient) {
            throw new Error('WalletConnect is not running yet');
        }
        this.WCSignClient.on('session_delete', (data) => {
            cb(data.topic);
        });
    }
    async startWalletConnect(params) {
        if (this.WCSignClient) {
            throw new Error('WalletConnect is already running');
        }
        this.WCSignClient = (await createWalletConnectClient(params));
    }
    async connectWalletConnect(params) {
        if (!this.WCSignClient) {
            throw new Error('WalletConnect is not running yet');
        }
        return connectWalletConnect({
            client: this.WCSignClient,
            pairingTopic: params?.pairingTopic,
            chains: params?.chains || [
                this.network === WalletNetwork.PUBLIC
                    ? WalletConnectTargetChain.PUBLIC
                    : WalletConnectTargetChain.TESTNET,
            ],
            methods: params?.methods,
        })
            .then(parseWalletConnectSession)
            .then((session) => {
            this.WCActiveSession = session.id;
            return session;
        });
    }
    async getSessions() {
        if (!this.WCSignClient) {
            throw new Error('WalletConnect is not running yet');
        }
        return this.WCSignClient.session.values.map(parseWalletConnectSession);
    }
    async getWalletConnectPublicKey() {
        if (!this.WCSignClient) {
            throw new Error('WalletConnect is not running yet');
        }
        const activeSessions = await this.getSessions();
        const targetSession = activeSessions.find((session) => session.id === this.WCActiveSession);
        if (!targetSession) {
            throw new Error('There is no active session handled by Stellar Wallets Kit, please create a new session or connect with an already existing session');
        }
        return targetSession.accounts[0].publicKey;
    }
    async signWalletConnectTransaction(params) {
        if (!this.WCSignClient) {
            throw new Error('WalletConnect is not running yet');
        }
        const activeSessions = await this.getSessions();
        const targetSession = activeSessions.find((session) => session.id === this.WCActiveSession);
        if (!targetSession) {
            throw new Error('There is no active session handled by Stellar Wallets Kit, please create a new session or set an existing session');
        }
        return makeWalletConnectRequest({
            topic: targetSession.id,
            xdr: params.xdr,
            client: this.WCSignClient,
            chain: params.chain || this.network === WalletNetwork.PUBLIC
                ? WalletConnectTargetChain.PUBLIC
                : WalletConnectTargetChain.TESTNET,
            method: params.method,
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlbGxhci13YWxsZXRzLWtpdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvc3RlbGxhci13YWxsZXRzLWtpdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQ0wsa0JBQWtCLEVBQ2xCLGFBQWEsRUFDYixxQkFBcUIsR0FDdEIsTUFBTSxVQUFVLENBQUM7QUFDbEIsT0FBTyxFQUFFLHFCQUFxQixFQUFFLHdCQUF3QixFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQzlFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxZQUFZLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDaEYsT0FBTyxFQUNMLG9CQUFvQixFQUNwQix5QkFBeUIsRUFFekIsd0JBQXdCLEVBQ3hCLHlCQUF5QixFQUV6Qix3QkFBd0IsR0FDekIsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFFbEUsTUFBTSxDQUFOLElBQVksVUFNWDtBQU5ELFdBQVksVUFBVTtJQUNwQiw2QkFBZSxDQUFBO0lBQ2YscUNBQXVCLENBQUE7SUFDdkIsK0JBQWlCLENBQUE7SUFDakIsNkJBQWUsQ0FBQTtJQUNmLCtDQUFpQyxDQUFBO0FBQ25DLENBQUMsRUFOVyxVQUFVLEtBQVYsVUFBVSxRQU1yQjtBQUVELE1BQU0sQ0FBTixJQUFZLGFBSVg7QUFKRCxXQUFZLGFBQWE7SUFDdkIsMEVBQXlELENBQUE7SUFDekQscUVBQW9ELENBQUE7SUFDcEQsOERBQTZDLENBQUE7QUFDL0MsQ0FBQyxFQUpXLGFBQWEsS0FBYixhQUFhLFFBSXhCO0FBc0JELE1BQU0sT0FBTyxpQkFBaUI7SUFDcEIsY0FBYyxDQUFjO0lBQzVCLE9BQU8sQ0FBaUI7SUFFaEMsWUFBWSxNQUE4RDtRQUN4RSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN0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