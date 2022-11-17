"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.freighterSignTransaction = exports.freighterGetPublicKey = void 0;
const freighter_api_1 = require("@stellar/freighter-api");
const freighterGetPublicKey = async () => {
    if (!(0, freighter_api_1.isConnected)()) {
        throw new Error(`Freighter is not connected`);
    }
    return (0, freighter_api_1.getPublicKey)();
};
exports.freighterGetPublicKey = freighterGetPublicKey;
const freighterSignTransaction = async (params) => {
    if (!(0, freighter_api_1.isConnected)()) {
        throw new Error(`Freighter is not connected`);
    }
    return (0, freighter_api_1.signTransaction)(params.xdr, {
        accountToSign: params.accountToSign,
        networkPassphrase: params.networkPassphrase,
    });
};
exports.freighterSignTransaction = freighterSignTransaction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJlaWdodGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9mcmVpZ2h0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMERBSWdDO0FBRXpCLE1BQU0scUJBQXFCLEdBQUcsS0FBSyxJQUFxQixFQUFFO0lBQy9ELElBQUksQ0FBQyxJQUFBLDJCQUFXLEdBQUUsRUFBRTtRQUNsQixNQUFNLElBQUksS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUM7S0FDL0M7SUFFRCxPQUFPLElBQUEsNEJBQVksR0FBRSxDQUFDO0FBQ3hCLENBQUMsQ0FBQztBQU5XLFFBQUEscUJBQXFCLHlCQU1oQztBQUVLLE1BQU0sd0JBQXdCLEdBQUcsS0FBSyxFQUMzQyxNQUE0QixFQUNYLEVBQUU7SUFDbkIsSUFBSSxDQUFDLElBQUEsMkJBQVcsR0FBRSxFQUFFO1FBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQUMsNEJBQTRCLENBQUMsQ0FBQztLQUMvQztJQUVELE9BQU8sSUFBQSwrQkFBZSxFQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUU7UUFDakMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxhQUFhO1FBQ25DLGlCQUFpQixFQUFFLE1BQU0sQ0FBQyxpQkFBaUI7S0FDNUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDO0FBWFcsUUFBQSx3QkFBd0IsNEJBV25DIn0=