"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabetNetwork = exports.rabetSignTransaction = exports.rabetGetPublicKey = exports.isRabetAvailable = void 0;
const isRabetAvailable = () => !!window.rabet;
exports.isRabetAvailable = isRabetAvailable;
const rabetGetPublicKey = async () => {
    if (!(window === null || window === void 0 ? void 0 : window.rabet)) {
        throw new Error('Rabet is not installed');
    }
    return window.rabet.connect();
};
exports.rabetGetPublicKey = rabetGetPublicKey;
const rabetSignTransaction = async (params) => {
    if (!(window === null || window === void 0 ? void 0 : window.rabet)) {
        throw new Error('Rabet is not installed');
    }
    return window.rabet.sign(params.xdr, params.network);
};
exports.rabetSignTransaction = rabetSignTransaction;
var RabetNetwork;
(function (RabetNetwork) {
    RabetNetwork["PUBLIC"] = "mainnet";
    RabetNetwork["TESTNET"] = "testnet";
})(RabetNetwork = exports.RabetNetwork || (exports.RabetNetwork = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFiZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL3JhYmV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQVFPLE1BQU0sZ0JBQWdCLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFBeEMsUUFBQSxnQkFBZ0Isb0JBQXdCO0FBRTlDLE1BQU0saUJBQWlCLEdBQUcsS0FBSyxJQUFvQyxFQUFFO0lBQzFFLElBQUksQ0FBQyxDQUFBLE1BQU0sYUFBTixNQUFNLHVCQUFOLE1BQU0sQ0FBRSxLQUFLLENBQUEsRUFBRTtRQUNsQixNQUFNLElBQUksS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUM7S0FDM0M7SUFFRCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDaEMsQ0FBQyxDQUFDO0FBTlcsUUFBQSxpQkFBaUIscUJBTTVCO0FBRUssTUFBTSxvQkFBb0IsR0FBRyxLQUFLLEVBQUUsTUFHMUMsRUFBNEIsRUFBRTtJQUM3QixJQUFJLENBQUMsQ0FBQSxNQUFNLGFBQU4sTUFBTSx1QkFBTixNQUFNLENBQUUsS0FBSyxDQUFBLEVBQUU7UUFDbEIsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0tBQzNDO0lBRUQsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN2RCxDQUFDLENBQUM7QUFUVyxRQUFBLG9CQUFvQix3QkFTL0I7QUFFRixJQUFZLFlBR1g7QUFIRCxXQUFZLFlBQVk7SUFDdEIsa0NBQWtCLENBQUE7SUFDbEIsbUNBQW1CLENBQUE7QUFDckIsQ0FBQyxFQUhXLFlBQVksR0FBWixvQkFBWSxLQUFaLG9CQUFZLFFBR3ZCIn0=