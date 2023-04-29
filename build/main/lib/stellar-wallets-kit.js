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
                }).then((response) => ({ signedXDR: response.signed_envelope_xdr }));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlbGxhci13YWxsZXRzLWtpdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvc3RlbGxhci13YWxsZXRzLWtpdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxxQ0FJa0I7QUFDbEIsMkNBSXFCO0FBQ3JCLG1DQUtpQjtBQUNqQixtREFReUI7QUFDekIsbUNBQWtFO0FBRWxFLElBQVksVUFNWDtBQU5ELFdBQVksVUFBVTtJQUNwQiw2QkFBZSxDQUFBO0lBQ2YscUNBQXVCLENBQUE7SUFDdkIsK0JBQWlCLENBQUE7SUFDakIsNkJBQWUsQ0FBQTtJQUNmLCtDQUFpQyxDQUFBO0FBQ25DLENBQUMsRUFOVyxVQUFVLEdBQVYsa0JBQVUsS0FBVixrQkFBVSxRQU1yQjtBQUVELElBQVksYUFJWDtBQUpELFdBQVksYUFBYTtJQUN2QiwwRUFBeUQsQ0FBQTtJQUN6RCxxRUFBb0QsQ0FBQTtJQUNwRCw4REFBNkMsQ0FBQTtBQUMvQyxDQUFDLEVBSlcsYUFBYSxHQUFiLHFCQUFhLEtBQWIscUJBQWEsUUFJeEI7QUE0QkQsTUFBYSxpQkFBaUI7SUFJNUIsWUFBWSxNQUE4RDtRQUN4RSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsTUFBTSxDQUFDLG1CQUFtQjtRQUN4QixPQUFPO1lBQ0wsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUU7WUFDNUQ7Z0JBQ0UsSUFBSSxFQUFFLGVBQWU7Z0JBQ3JCLElBQUksRUFBRSxVQUFVLENBQUMsY0FBYztnQkFDL0IsV0FBVyxFQUFFLElBQUk7YUFDbEI7WUFDRCxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRTtZQUM5RDtnQkFDRSxJQUFJLEVBQUUsV0FBVztnQkFDakIsSUFBSSxFQUFFLFVBQVUsQ0FBQyxTQUFTO2dCQUMxQixXQUFXLEVBQUUsSUFBQSxnQ0FBb0IsR0FBRTthQUNwQztZQUNEO2dCQUNFLElBQUksRUFBRSxPQUFPO2dCQUNiLElBQUksRUFBRSxVQUFVLENBQUMsS0FBSztnQkFDdEIsV0FBVyxFQUFFLElBQUEsd0JBQWdCLEdBQUU7YUFDaEM7U0FDRixDQUFDO0lBQ0osQ0FBQztJQUVNLFVBQVUsQ0FBQyxPQUFzQjtRQUN0QyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDbkQsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsT0FBTyxvQkFBb0IsQ0FBQyxDQUFDO1NBQ2pFO1FBRUQsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDekIsQ0FBQztJQUVNLFNBQVMsQ0FBQyxJQUFnQjtRQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDN0MsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsSUFBSSxvQkFBb0IsQ0FBQyxDQUFDO1NBQzNEO1FBRUQsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7SUFDN0IsQ0FBQztJQUVNLEtBQUssQ0FBQyxZQUFZO1FBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ3hCLE1BQU0sSUFBSSxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQztTQUNyRDtRQUVELFFBQVEsSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUMzQixLQUFLLFVBQVUsQ0FBQyxLQUFLO2dCQUNuQixPQUFPLElBQUEseUJBQWlCLEdBQUUsQ0FBQztZQUU3QixLQUFLLFVBQVUsQ0FBQyxTQUFTO2dCQUN2QixPQUFPLElBQUEsaUNBQXFCLEdBQUUsQ0FBQztZQUVqQyxLQUFLLFVBQVUsQ0FBQyxNQUFNO2dCQUNwQixPQUFPLElBQUEsMkJBQWtCLEdBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVsRSxLQUFLLFVBQVUsQ0FBQyxLQUFLO2dCQUNuQixPQUFPLElBQUEseUJBQWlCLEdBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUVwRSxLQUFLLFVBQVUsQ0FBQyxjQUFjO2dCQUM1QixPQUFPLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1lBRTFDO2dCQUNFLE1BQU0sSUFBSSxLQUFLLENBQUMsZUFBZSxJQUFJLENBQUMsY0FBYyxnQkFBZ0IsQ0FBQyxDQUFDO1NBQ3ZFO0lBQ0gsQ0FBQztJQUVNLEtBQUssQ0FBQyxJQUFJLENBQ2YsTUFBb0M7UUFFcEMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDeEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO1NBQ3JEO1FBRUQsUUFBUSxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQzNCLEtBQUssVUFBVSxDQUFDLEtBQUs7Z0JBQ25CLE9BQU8sSUFBQSw0QkFBb0IsRUFBQztvQkFDMUIsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHO29CQUNmLFNBQVMsRUFBRSxNQUFNLENBQUMsU0FBUztvQkFDM0IsaUJBQWlCLEVBQUUsTUFBTSxDQUFDLE9BQU87aUJBQ2xDLENBQUMsQ0FBQztZQUVMLEtBQUssVUFBVSxDQUFDLFNBQVM7Z0JBQ3ZCLE9BQU8sSUFBQSxvQ0FBd0IsRUFBQztvQkFDOUIsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHO29CQUNmLGlCQUFpQixFQUFFLE1BQU0sQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU87b0JBQ2pELGFBQWEsRUFBRSxNQUFNLENBQUMsU0FBUztpQkFDaEMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFbkQsS0FBSyxVQUFVLENBQUMsTUFBTTtnQkFDcEIsT0FBTyxJQUFBLDhCQUFxQixFQUFDO29CQUMzQixHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUc7b0JBQ2YsTUFBTSxFQUFFLE1BQU0sQ0FBQyxTQUFTO29CQUN4QixPQUFPLEVBQ0wsSUFBSSxDQUFDLE9BQU8sS0FBSyxhQUFhLENBQUMsTUFBTTt3QkFDbkMsQ0FBQyxDQUFDLHNCQUFhLENBQUMsTUFBTTt3QkFDdEIsQ0FBQyxDQUFDLHNCQUFhLENBQUMsT0FBTztpQkFDNUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFdkUsS0FBSyxVQUFVLENBQUMsS0FBSztnQkFDbkIsT0FBTyxJQUFBLDRCQUFvQixFQUFDO29CQUMxQixHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUc7b0JBQ2YsT0FBTyxFQUNMLElBQUksQ0FBQyxPQUFPLEtBQUssYUFBYSxDQUFDLE1BQU07d0JBQ25DLENBQUMsQ0FBQyxvQkFBWSxDQUFDLE1BQU07d0JBQ3JCLENBQUMsQ0FBQyxvQkFBWSxDQUFDLE9BQU87aUJBQzNCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUV2RCxLQUFLLFVBQVUsQ0FBQyxjQUFjO2dCQUM1QixPQUFPLElBQUksQ0FBQyw0QkFBNEIsQ0FBQztvQkFDdkMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHO29CQUNmLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTTtvQkFDckIsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLO2lCQUNwQixDQUFDLENBQUM7WUFFTDtnQkFDRSxNQUFNLElBQUksS0FBSyxDQUNiLHFDQUFxQyxJQUFJLENBQUMsY0FBYyxjQUFjLENBQ3ZFLENBQUM7U0FDTDtJQUNILENBQUM7SUFNRDs7OztTQUlLO0lBQ0UsVUFBVSxDQUFDLFNBQWlCO1FBQ2pDLElBQUksQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFDO0lBQ25DLENBQUM7SUFFTSxnQkFBZ0IsQ0FBQyxFQUErQjtRQUNyRCxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUN0QixNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7U0FDckQ7UUFFRCxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFO1lBQzlDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU0sS0FBSyxDQUFDLGtCQUFrQixDQUFDLE1BTS9CO1FBQ0MsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQztTQUNyRDtRQUVELElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxNQUFNLElBQUEseUNBQXlCLEVBQ2xELE1BQU0sQ0FDUCxDQUF3QixDQUFDO0lBQzVCLENBQUM7SUFFTSxLQUFLLENBQUMsb0JBQW9CLENBQy9CLE1BQW9DO1FBRXBDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQztTQUNyRDtRQUVELE9BQU8sSUFBQSxvQ0FBb0IsRUFBQztZQUMxQixNQUFNLEVBQUUsSUFBSSxDQUFDLFlBQVk7WUFDekIsWUFBWSxFQUFFLE1BQU0sYUFBTixNQUFNLHVCQUFOLE1BQU0sQ0FBRSxZQUFZO1lBQ2xDLE1BQU0sRUFBRSxDQUFBLE1BQU0sYUFBTixNQUFNLHVCQUFOLE1BQU0sQ0FBRSxNQUFNLEtBQUk7Z0JBQ3hCLElBQUksQ0FBQyxPQUFPLEtBQUssYUFBYSxDQUFDLE1BQU07b0JBQ25DLENBQUMsQ0FBQyx3Q0FBd0IsQ0FBQyxNQUFNO29CQUNqQyxDQUFDLENBQUMsd0NBQXdCLENBQUMsT0FBTzthQUNyQztZQUNELE9BQU8sRUFBRSxNQUFNLGFBQU4sTUFBTSx1QkFBTixNQUFNLENBQUUsT0FBTztTQUN6QixDQUFDO2FBQ0MsSUFBSSxDQUFDLHlDQUF5QixDQUFDO2FBQy9CLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ2hCLElBQUksQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNsQyxPQUFPLE9BQU8sQ0FBQztRQUNqQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsWUFBWSxDQUFDLFNBQWlCLEVBQUUsTUFBZTtRQUMxRCxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUN0QixNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7U0FDckQ7UUFFRCxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDO1lBQ2pDLEtBQUssRUFBRSxTQUFTO1lBQ2hCLE1BQU0sRUFBRTtnQkFDTixPQUFPLEVBQUUsTUFBTSxJQUFJLGdCQUFnQjtnQkFDbkMsSUFBSSxFQUFFLENBQUMsQ0FBQzthQUNUO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVNLEtBQUssQ0FBQyxXQUFXO1FBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQztTQUNyRDtRQUVELE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx5Q0FBeUIsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFFTyxLQUFLLENBQUMseUJBQXlCO1FBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQztTQUNyRDtRQUVELE1BQU0sY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2hELE1BQU0sYUFBYSxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQ3ZDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxlQUFlLENBQ2pELENBQUM7UUFFRixJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQ2Isb0lBQW9JLENBQ3JJLENBQUM7U0FDSDtRQUVELE9BQU8sYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFDN0MsQ0FBQztJQUVPLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxNQUkxQztRQUNDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQztTQUNyRDtRQUVELE1BQU0sY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2hELE1BQU0sYUFBYSxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQ3ZDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxlQUFlLENBQ2pELENBQUM7UUFFRixJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQ2IsbUhBQW1ILENBQ3BILENBQUM7U0FDSDtRQUVELE9BQU8sSUFBQSx3Q0FBd0IsRUFBQztZQUM5QixLQUFLLEVBQUUsYUFBYSxDQUFDLEVBQUU7WUFDdkIsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHO1lBQ2YsTUFBTSxFQUFFLElBQUksQ0FBQyxZQUFZO1lBQ3pCLEtBQUssRUFDSCxNQUFNLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssYUFBYSxDQUFDLE1BQU07Z0JBQ25ELENBQUMsQ0FBQyx3Q0FBd0IsQ0FBQyxNQUFNO2dCQUNqQyxDQUFDLENBQUMsd0NBQXdCLENBQUMsT0FBTztZQUN0QyxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU07U0FDdEIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUVGO0FBNVFELDhDQTRRQyJ9