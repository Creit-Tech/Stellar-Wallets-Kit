import QRCodeModal from '@walletconnect/qrcode-modal';
import { SignClient } from '@walletconnect/sign-client';
export var WalletConnectTargetChain;
(function (WalletConnectTargetChain) {
    WalletConnectTargetChain["PUBLIC"] = "stellar:pubnet";
    WalletConnectTargetChain["TESTNET"] = "stellar:testnet";
})(WalletConnectTargetChain || (WalletConnectTargetChain = {}));
export var WalletConnectAllowedMethods;
(function (WalletConnectAllowedMethods) {
    WalletConnectAllowedMethods["SIGN"] = "stellar_signXDR";
    WalletConnectAllowedMethods["SIGN_AND_SUBMIT"] = "stellar_signAndSubmitXDR";
})(WalletConnectAllowedMethods || (WalletConnectAllowedMethods = {}));
export const createWalletConnectClient = async (params) => {
    return SignClient.init({
        projectId: params.projectId,
        metadata: {
            name: params.name,
            url: params.url,
            description: params.description,
            icons: params.icons,
        },
    });
};
export const connectWalletConnect = async (params) => {
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
                QRCodeModal.open(uri, () => {
                    reject('QR Code Modal closed');
                });
            }
            // Await session approval from the wallet.
            approval()
                .then((session) => {
                QRCodeModal.close();
                resolve(session);
            })
                .catch((error) => {
                QRCodeModal.close();
                reject(error);
            });
        });
    }
    catch (e) {
        QRCodeModal.close();
        console.error(e);
        throw new Error('There was an error when trying to connect');
    }
};
export const parseWalletConnectSession = (session) => {
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
export const makeWalletConnectRequest = (params) => {
    return params.client.request({
        topic: params.topic,
        chainId: params.chain,
        request: {
            method: params.method || WalletConnectAllowedMethods.SIGN,
            params: { xdr: params.xdr },
        },
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FsbGV0Y29ubmVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvd2FsbGV0Y29ubmVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFdBQVcsTUFBTSw2QkFBNkIsQ0FBQztBQUN0RCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFJeEQsTUFBTSxDQUFOLElBQVksd0JBR1g7QUFIRCxXQUFZLHdCQUF3QjtJQUNsQyxxREFBeUIsQ0FBQTtJQUN6Qix1REFBMkIsQ0FBQTtBQUM3QixDQUFDLEVBSFcsd0JBQXdCLEtBQXhCLHdCQUF3QixRQUduQztBQUVELE1BQU0sQ0FBTixJQUFZLDJCQUdYO0FBSEQsV0FBWSwyQkFBMkI7SUFDckMsdURBQXdCLENBQUE7SUFDeEIsMkVBQTRDLENBQUE7QUFDOUMsQ0FBQyxFQUhXLDJCQUEyQixLQUEzQiwyQkFBMkIsUUFHdEM7QUFFRCxNQUFNLENBQUMsTUFBTSx5QkFBeUIsR0FBRyxLQUFLLEVBQUUsTUFNL0MsRUFBd0IsRUFBRTtJQUN6QixPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUM7UUFDckIsU0FBUyxFQUFFLE1BQU0sQ0FBQyxTQUFTO1FBQzNCLFFBQVEsRUFBRTtZQUNSLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtZQUNqQixHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUc7WUFDZixXQUFXLEVBQUUsTUFBTSxDQUFDLFdBQVc7WUFDL0IsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLO1NBQ3BCO0tBQ0YsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQUcsS0FBSyxFQUFFLE1BSzFDLEVBQWdDLEVBQUU7SUFDakMsSUFBSTtRQUNGLE1BQU0sRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztZQUNwRCxZQUFZLEVBQUUs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