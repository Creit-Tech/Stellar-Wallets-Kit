"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xBullSignTransaction = exports.xBullGetPublicKey = void 0;
const xbull_wallet_connect_1 = require("@creit-tech/xbull-wallet-connect");
const xBullGetPublicKey = async () => {
    const bridge = new xbull_wallet_connect_1.xBullWalletConnect();
    const publicKey = await bridge.connect();
    bridge.closeConnections();
    return publicKey;
};
exports.xBullGetPublicKey = xBullGetPublicKey;
const xBullSignTransaction = async (params) => {
    const bridge = new xbull_wallet_connect_1.xBullWalletConnect();
    const signedXDR = await bridge.sign({
        xdr: params.xdr,
        publicKey: params.publicKey,
        network: params.networkPassphrase,
    });
    bridge.closeConnections();
    return { signedXDR };
};
exports.xBullSignTransaction = xBullSignTransaction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGJ1bGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL3hidWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJFQUFzRTtBQUUvRCxNQUFNLGlCQUFpQixHQUFHLEtBQUssSUFBcUIsRUFBRTtJQUMzRCxNQUFNLE1BQU0sR0FBRyxJQUFJLHlDQUFrQixFQUFFLENBQUM7SUFDeEMsTUFBTSxTQUFTLEdBQUcsTUFBTSxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDekMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUM7SUFDMUIsT0FBTyxTQUFTLENBQUM7QUFDbkIsQ0FBQyxDQUFDO0FBTFcsUUFBQSxpQkFBaUIscUJBSzVCO0FBRUssTUFBTSxvQkFBb0IsR0FBRyxLQUFLLEVBQ3ZDLE1BQXdCLEVBQ1EsRUFBRTtJQUNsQyxNQUFNLE1BQU0sR0FBRyxJQUFJLHlDQUFrQixFQUFFLENBQUM7SUFDeEMsTUFBTSxTQUFTLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2xDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRztRQUNmLFNBQVMsRUFBRSxNQUFNLENBQUMsU0FBUztRQUMzQixPQUFPLEVBQUUsTUFBTSxDQUFDLGlCQUFpQjtLQUNsQyxDQUFDLENBQUM7SUFDSCxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUMxQixPQUFPLEVBQUUsU0FBUyxFQUFFLENBQUM7QUFDdkIsQ0FBQyxDQUFDO0FBWFcsUUFBQSxvQkFBb0Isd0JBVy9CIn0=