"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StellarWalletsKit = exports.WalletNetwork = exports.WalletType = void 0;
const albedo_1 = require("./albedo");
const freighter_1 = require("./freighter");
const rabet_1 = require("./rabet");
const walletconnect_1 = require("./walletconnect");
const xbull_1 = require("./xbull");
var WalletType;
(function (WalletType) {
    WalletType["XBULL"] = "XBULL";
    WalletType["FREIGHTER"] = "FREIGHTER";
    WalletType["ALBEDO"] = "ALBEDO";
    WalletType["RABET"] = "RABET";
    WalletType["WALLET_CONNECT"] = "WALLET_CONNECT";
})(WalletType = exports.WalletType || (exports.WalletType = {}));
var WalletNetwork;
(function (WalletNetwork) {
    WalletNetwork["PUBLIC"] = "Public Global Stellar Network ; September 2015";
    WalletNetwork["FUTURENET"] = "Test SDF Future Network ; October 2022";
    WalletNetwork["TESTNET"] = "Test SDF Network ; September 2015";
})(WalletNetwork = exports.WalletNetwork || (exports.WalletNetwork = {}));
class StellarWalletsKit {
    constructor(params) {
        this.setWallet(params.selectedWallet);
        this.setNetwork(params.network);
    }
    /**
     * This method will return an array with all wallets supported by this kit but will let you know those the user have already installed/has access to
     * There are wallets that are by default available since they either don't need to be installed or have a fallback
     */
    static getSupportedWallets() {
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
                isAvailable: (0, freighter_1.isFreighterInstalled)(),
            },
            {
                name: 'Rabet',
                type: WalletType.RABET,
                isAvailable: (0, rabet_1.isRabetAvailable)(),
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
                return (0, xbull_1.xBullGetPublicKey)();
            case WalletType.FREIGHTER:
                return (0, freighter_1.freighterGetPublicKey)();
            case WalletType.ALBEDO:
                return (0, albedo_1.albedoGetPublicKey)().then((response) => response.pubkey);
            case WalletType.RABET:
                return (0, rabet_1.rabetGetPublicKey)().then((response) => response.publicKey);
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
                return (0, xbull_1.xBullSignTransaction)({
                    xdr: params.xdr,
                    publicKey: params.publicKey,
                    networkPassphrase: params.network,
                });
            case WalletType.FREIGHTER:
                return (0, freighter_1.freighterSignTransaction)({
                    xdr: params.xdr,
                    networkPassphrase: params.network || this.network,
                    accountToSign: params.publicKey,
                }).then((response) => ({ signedXDR: response }));
            case WalletType.ALBEDO:
                return (0, albedo_1.albedoSignTransaction)({
                    xdr: params.xdr,
                    pubKey: params.publicKey,
                    network: this.network === WalletNetwork.PUBLIC
                        ? albedo_1.AlbedoNetwork.PUBLIC
                        : albedo_1.AlbedoNetwork.TESTNET,
                }).then((response) => ({ signedXDR: response.xdr }));
            case WalletType.RABET:
                return (0, rabet_1.rabetSignTransaction)({
                    xdr: params.xdr,
                    network: this.network === WalletNetwork.PUBLIC
                        ? rabet_1.RabetNetwork.PUBLIC
                        : rabet_1.RabetNetwork.TESTNET,
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
        this.WCSignClient = (await (0, walletconnect_1.createWalletConnectClient)(params));
    }
    async connectWalletConnect(params) {
        if (!this.WCSignClient) {
            throw new Error('WalletConnect is not running yet');
        }
        return (0, walletconnect_1.connectWalletConnect)({
            client: this.WCSignClient,
            pairingTopic: params === null || params === void 0 ? void 0 : params.pairingTopic,
            chains: (params === null || params === void 0 ? void 0 : params.chains) || [
                this.network === WalletNetwork.PUBLIC
                    ? walletconnect_1.WalletConnectTargetChain.PUBLIC
                    : walletconnect_1.WalletConnectTargetChain.TESTNET,
            ],
            methods: params === null || params === void 0 ? void 0 : params.methods,
        })
            .then(walletconnect_1.parseWalletConnectSession)
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
        return this.WCSignClient.session.values.map(walletconnect_1.parseWalletConnectSession);
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
        return (0, walletconnect_1.makeWalletConnectRequest)({
            topic: targetSession.id,
            xdr: params.xdr,
            client: this.WCSignClient,
            chain: params.chain || this.network === WalletNetwork.PUBLIC
                ? walletconnect_1.WalletConnectTargetChain.PUBLIC
                : walletconnect_1.WalletConnectTargetChain.TESTNET,
            method: params.method,
        });
    }
}
exports.StellarWalletsKit = StellarWalletsKit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlbGxhci13YWxsZXRzLWtpdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvc3RlbGxhci13YWxsZXRzLWtpdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxxQ0FJa0I7QUFDbEIsMkNBSXFCO0FBQ3JCLG1DQUtpQjtBQUNqQixtREFReUI7QUFDekIsbUNBQWtFO0FBRWxFLElBQVksVUFNWDtBQU5ELFdBQVksVUFBVTtJQUNwQiw2QkFBZSxDQUFBO0lBQ2YscUNBQXVCLENBQUE7SUFDdkIsK0JBQWlCLENBQUE7SUFDakIsNkJBQWUsQ0FBQTtJQUNmLCtDQUFpQyxDQUFBO0FBQ25DLENBQUMsRUFOVyxVQUFVLEdBQVYsa0JBQVUsS0FBVixrQkFBVSxRQU1yQjtBQUVELElBQVksYUFJWDtBQUpELFdBQVksYUFBYTtJQUN2QiwwRUFBeUQsQ0FBQTtJQUN6RCxxRUFBb0QsQ0FBQTtJQUNwRCw4REFBNkMsQ0FBQTtBQUMvQyxDQUFDLEVBSlcsYUFBYSxHQUFiLHFCQUFhLEtBQWIscUJBQWEsUUFJeEI7QUE0QkQsTUFBYSxpQkFBaUI7SUFJNUIsWUFBWSxNQUE4RDtRQUN4RSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsTUFBTSxDQUFDLG1CQUFtQjtRQUN4QixPQUFPO1lBQ0wsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUU7WUFDNUQ7Z0JBQ0UsSUFBSSxFQUFFLGVBQWU7Z0JBQ3JCLElBQUksRUFBRSxVQUFVLENBQUMsY0FBYztnQkFDL0IsV0FBVyxFQUFFLElBQUk7YUFDbEI7WUFDRCxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxF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