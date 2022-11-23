import { albedoGetPublicKey, AlbedoNetwork, albedoSignTransaction, } from './albedo';
import { freighterGetPublicKey, freighterSignTransaction, isFreighterInstalled, } from './freighter';
import { isRabetAvailable, rabetGetPublicKey, RabetNetwork, rabetSignTransaction, } from './rabet';
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
    /**
     * This method will return an array with all wallets supported by this kit but will let you know those the user have already installed/has access to
     * There are wallets that are by default available since they either don't need to be installed or have a fallback
     */
    getSupportedWallets() {
        return [
            { name: 'xBull', type: WalletType.XBULL, isAvailable: true },
            {
                name: 'WalletConnect',
                type: WalletType.WALLET_CONNECT,
                isAvailable: true,
            },
            { name: 'Albedo', type: WalletType.ALBEDO, isAvailable: true },
            {
                name: 'Freighter',
                type: WalletType.FREIGHTER,
                isAvailable: isFreighterInstalled(),
            },
            {
                name: 'Rabet',
                type: WalletType.RABET,
                isAvailable: isRabetAvailable(),
            },
        ];
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
    async closeSession(sessionId, reason) {
        if (!this.WCSignClient) {
            throw new Error('WalletConnect is not running yet');
        }
        await this.WCSignClient.disconnect({
            topic: sessionId,
            reason: {
                message: reason || 'Session closed',
                code: -1
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlbGxhci13YWxsZXRzLWtpdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvc3RlbGxhci13YWxsZXRzLWtpdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQ0wsa0JBQWtCLEVBQ2xCLGFBQWEsRUFDYixxQkFBcUIsR0FDdEIsTUFBTSxVQUFVLENBQUM7QUFDbEIsT0FBTyxFQUNMLHFCQUFxQixFQUNyQix3QkFBd0IsRUFDeEIsb0JBQW9CLEdBQ3JCLE1BQU0sYUFBYSxDQUFDO0FBQ3JCLE9BQU8sRUFDTCxnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ2pCLFlBQVksRUFDWixvQkFBb0IsR0FDckIsTUFBTSxTQUFTLENBQUM7QUFDakIsT0FBTyxFQUNMLG9CQUFvQixFQUNwQix5QkFBeUIsRUFFekIsd0JBQXdCLEVBQ3hCLHlCQUF5QixFQUV6Qix3QkFBd0IsR0FDekIsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFFbEUsTUFBTSxDQUFOLElBQVksVUFNWDtBQU5ELFdBQVksVUFBVTtJQUNwQiw2QkFBZSxDQUFBO0lBQ2YscUNBQXVCLENBQUE7SUFDdkIsK0JBQWlCLENBQUE7SUFDakIsNkJBQWUsQ0FBQTtJQUNmLCtDQUFpQyxDQUFBO0FBQ25DLENBQUMsRUFOVyxVQUFVLEtBQVYsVUFBVSxRQU1yQjtBQUVELE1BQU0sQ0FBTixJQUFZLGFBSVg7QUFKRCxXQUFZLGFBQWE7SUFDdkIsMEVBQXlELENBQUE7SUFDekQscUVBQW9ELENBQUE7SUFDcEQsOERBQTZDLENBQUE7QUFDL0MsQ0FBQyxFQUpXLGFBQWEsS0FBYixhQUFhLFFBSXhCO0FBNEJELE1BQU0sT0FBTyxpQkFBaUI7SUFDcEIsY0FBYyxDQUFjO0lBQzVCLE9BQU8sQ0FBaUI7SUFFaEMsWUFBWSxNQUE4RDtRQUN4RSxJQUFJLENBQUMsU0FBUyxDQUFD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