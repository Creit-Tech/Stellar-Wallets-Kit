"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeWalletConnectRequest = exports.parseWalletConnectSession = exports.connectWalletConnect = exports.createWalletConnectClient = exports.WalletConnectAllowedMethods = exports.WalletConnectTargetChain = void 0;
const qrcode_modal_1 = __importDefault(require("@walletconnect/qrcode-modal"));
const sign_client_1 = require("@walletconnect/sign-client");
var WalletConnectTargetChain;
(function (WalletConnectTargetChain) {
    WalletConnectTargetChain["PUBLIC"] = "stellar:pubnet";
    WalletConnectTargetChain["TESTNET"] = "stellar:testnet";
})(WalletConnectTargetChain = exports.WalletConnectTargetChain || (exports.WalletConnectTargetChain = {}));
var WalletConnectAllowedMethods;
(function (WalletConnectAllowedMethods) {
    WalletConnectAllowedMethods["SIGN"] = "stellar_signXDR";
    WalletConnectAllowedMethods["SIGN_AND_SUBMIT"] = "stellar_signAndSubmitXDR";
})(WalletConnectAllowedMethods = exports.WalletConnectAllowedMethods || (exports.WalletConnectAllowedMethods = {}));
const createWalletConnectClient = async (params) => {
    return sign_client_1.SignClient.init({
        projectId: params.projectId,
        metadata: {
            name: params.name,
            url: params.url,
            description: params.description,
            icons: params.icons,
        },
    });
};
exports.createWalletConnectClient = createWalletConnectClient;
const connectWalletConnect = async (params) => {
    try {
        const { uri, approval } = await params.client.connect({
            pairingTopic: params.pairingTopic,
            requiredNamespaces: {
                stellar: {
                    methods: params.methods || Object.values(WalletConnectAllowedMethods),
                    chains: params.chains,
                    events: [],
                },
            },
        });
        return new Promise((resolve, reject) => {
            // Open QRCode modal if a URI was returned (i.e. we're not connecting an existing pairing).
            if (uri) {
                qrcode_modal_1.default.open(uri, () => {
                    reject('QR Code Modal closed');
                });
            }
            // Await session approval from the wallet.
            approval()
                .then((session) => {
                qrcode_modal_1.default.close();
                resolve(session);
            })
                .catch((error) => {
                qrcode_modal_1.default.close();
                reject(error);
            });
        });
    }
    catch (e) {
        qrcode_modal_1.default.close();
        console.error(e);
        throw new Error('There was an error when trying to connect');
    }
};
exports.connectWalletConnect = connectWalletConnect;
const parseWalletConnectSession = (session) => {
    const accounts = session.namespaces.stellar.accounts.map((account) => ({
        network: account.split(':')[1],
        publicKey: account.split(':')[2],
    }));
    return {
        id: session.topic,
        name: session.peer.metadata.name,
        description: session.peer.metadata.description,
        url: session.peer.metadata.url,
        icons: session.peer.metadata.icons[0],
        accounts,
    };
};
exports.parseWalletConnectSession = parseWalletConnectSession;
const makeWalletConnectRequest = (params) => {
    return params.client.request({
        topic: params.topic,
        chainId: params.chain,
        request: {
            method: params.method || WalletConnectAllowedMethods.SIGN,
            params: { xdr: params.xdr },
        },
    });
};
exports.makeWalletConnectRequest = makeWalletConnectRequest;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FsbGV0Y29ubmVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvd2FsbGV0Y29ubmVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSwrRUFBc0Q7QUFDdEQsNERBQXdEO0FBSXhELElBQVksd0JBR1g7QUFIRCxXQUFZLHdCQUF3QjtJQUNsQyxxREFBeUIsQ0FBQTtJQUN6Qix1REFBMkIsQ0FBQTtBQUM3QixDQUFDLEVBSFcsd0JBQXdCLEdBQXhCLGdDQUF3QixLQUF4QixnQ0FBd0IsUUFHbkM7QUFFRCxJQUFZLDJCQUdYO0FBSEQsV0FBWSwyQkFBMkI7SUFDckMsdURBQXdCLENBQUE7SUFDeEIsMkVBQTRDLENBQUE7QUFDOUMsQ0FBQyxFQUhXLDJCQUEyQixHQUEzQixtQ0FBMkIsS0FBM0IsbUNBQTJCLFFBR3RDO0FBRU0sTUFBTSx5QkFBeUIsR0FBRyxLQUFLLEVBQUUsTUFNL0MsRUFBd0IsRUFBRTtJQUN6QixPQUFPLHdCQUFVLENBQUMsSUFBSSxDQUFDO1FBQ3JCLFNBQVMsRUFBRSxNQUFNLENBQUMsU0FBUztRQUMzQixRQUFRLEVBQUU7WUFDUixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7WUFDakIsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHO1lBQ2YsV0FBVyxFQUFFLE1BQU0sQ0FBQyxXQUFXO1lBQy9CLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSztTQUNwQjtLQUNGLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQztBQWhCVyxRQUFBLHlCQUF5Qiw2QkFnQnBDO0FBRUssTUFBTSxvQkFBb0IsR0FBRyxLQUFLLEVBQUUsTUFLMUMsRUFBZ0MsRUFBRTtJQUNqQyxJQUFJO1FBQ0YsTUFBTSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO1lBQ3BELFlBQVksRUFBRSxNQUFNLENBQUMsWUFBWTtZQUNqQyxrQkFBa0IsRUFBRTtnQkFDbEIsT0FBTyxFQUFFO29CQUNQLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsMkJBQTJCLENBQUM7b0JBQ3JFLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTTtvQkFDckIsTUFBTSxFQUFFLEVBQUU7aUJBQ1g7YUFDRjtTQUNGLENBQUMsQ0FBQztRQUVILE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDckMsMkZBQTJGO1lBQzNGLElBQUksR0FBRyxFQUFFO2dCQUNQLHNCQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUU7b0JBQ3pCLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2dCQUNqQyxDQUFDLENBQUMsQ0FBQzthQUNKO1lBRUQsMENBQTBDO1lBQzFDLFFBQVEsRUFBRTtpQkFDUCxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDaEIsc0JBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDcEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ25CLENBQUMsQ0FBQztpQkFDRCxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDZixzQkFBVyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNwQixNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDaEIsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztLQUNKO0lBQUMsT0FBTyxDQUFVLEVBQUU7UUFDbkIsc0JBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNwQixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sSUFBSSxLQUFLLENBQUMsMkNBQTJDLENBQUMsQ0FBQztLQUM5RDtBQUNILENBQUMsQ0FBQztBQTFDVyxRQUFBLG9CQUFvQix3QkEwQy9CO0FBRUssTUFBTSx5QkFBeUIsR0FBRyxDQUN2QyxPQUE0QixFQUNDLEVBQUU7SUFDL0IsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDdEQsQ0FBQyxPQUFlLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDcEIsT0FBTyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUF5QjtRQUN0RCxTQUFTLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakMsQ0FBQyxDQUNILENBQUM7SUFFRixPQUFPO1FBQ0wsRUFBRSxFQUFFLE9BQU8sQ0FBQyxLQUFLO1FBQ2pCLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJO1FBQ2hDLFdBQVcsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXO1FBQzlDLEdBQUcsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHO1FBQzlCLEtBQUssRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLFFBQVE7S0FDVCxDQUFDO0FBQ0osQ0FBQyxDQUFDO0FBbEJXLFFBQUEseUJBQXlCLDZCQWtCcEM7QUFFSyxNQUFNLHdCQUF3QixHQUFHLENBQ3RDLE1BQW1DLEVBQ0gsRUFBRTtJQUNsQyxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQzNCLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSztRQUNuQixPQUFPLEVBQUUsTUFBTSxDQUFDLEtBQUs7UUFDckIsT0FBTyxFQUFFO1lBQ1AsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLElBQUksMkJBQTJCLENBQUMsSUFBSTtZQUN6RCxNQUFNLEVBQUUsRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRTtTQUM1QjtLQUNGLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQztBQVhXLFFBQUEsd0JBQXdCLDRCQVduQyJ9