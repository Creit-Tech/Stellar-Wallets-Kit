"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.freighterSignTransaction = exports.freighterGetPublicKey = exports.isFreighterInstalled = void 0;
const freighter_api_1 = require("@stellar/freighter-api");
const isFreighterInstalled = async () => (0, freighter_api_1.isConnected)();
exports.isFreighterInstalled = isFreighterInstalled;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJlaWdodGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9mcmVpZ2h0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMERBSWdDO0FBRXpCLE1BQU0sb0JBQW9CLEdBQUcsS0FBSyxJQUFJLEVBQUUsQ0FBQyxJQUFBLDJCQUFXLEdBQUUsQ0FBQztBQUFqRCxRQUFBLG9CQUFvQix3QkFBNkI7QUFFdkQsTUFBTSxxQkFBcUIsR0FBRyxLQUFLLElBQXFCLEVBQUU7SUFDL0QsSUFBSSxDQUFDLElBQUEsMkJBQVcsR0FBRSxFQUFFO1FBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQUMsNEJBQTRCLENBQUMsQ0FBQztLQUMvQztJQUVELE9BQU8sSUFBQSw0QkFBWSxHQUFFLENBQUM7QUFDeEIsQ0FBQyxDQUFDO0FBTlcsUUFBQSxxQkFBcUIseUJBTWhDO0FBRUssTUFBTSx3QkFBd0IsR0FBRyxLQUFLLEVBQzNDLE1BQTRCLEVBQ1gsRUFBRTtJQUNuQixJQUFJLENBQUMsSUFBQSwyQkFBVyxHQUFFLEVBQUU7UUFDbEIsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0tBQy9DO0lBRUQsT0FBTyxJQUFBLCtCQUFlLEVBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRTtRQUNqQyxhQUFhLEVBQUUsTUFBTSxDQUFDLGFBQWE7UUFDbkMsaUJBQWlCLEVBQUUsTUFBTSxDQUFDLGlCQUFpQjtLQUM1QyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUM7QUFYVyxRQUFBLHdCQUF3Qiw0QkFXbkMifQ==