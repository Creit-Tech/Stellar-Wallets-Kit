"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlbedoNetwork = exports.albedoSignTransaction = exports.albedoGetPublicKey = void 0;
const intent_1 = __importDefault(require("@albedo-link/intent"));
const albedoGetPublicKey = async () => {
    return intent_1.default.publicKey({});
};
exports.albedoGetPublicKey = albedoGetPublicKey;
const albedoSignTransaction = async (params) => {
    return intent_1.default.tx({
        xdr: params.xdr,
        pubkey: params.pubKey,
        network: params.network,
    });
};
exports.albedoSignTransaction = albedoSignTransaction;
var AlbedoNetwork;
(function (AlbedoNetwork) {
    AlbedoNetwork["PUBLIC"] = "public";
    AlbedoNetwork["TESTNET"] = "testnet";
})(AlbedoNetwork = exports.AlbedoNetwork || (exports.AlbedoNetwork = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxiZWRvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9hbGJlZG8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsaUVBRzZCO0FBRXRCLE1BQU0sa0JBQWtCLEdBQUcsS0FBSyxJQUFvQyxFQUFFO0lBQzNFLE9BQU8sZ0JBQU0sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsQ0FBQyxDQUFDO0FBRlcsUUFBQSxrQkFBa0Isc0JBRTdCO0FBRUssTUFBTSxxQkFBcUIsR0FBRyxLQUFLLEVBQ3hDLE1BQXlCLEVBQ0EsRUFBRTtJQUMzQixPQUFPLGdCQUFNLENBQUMsRUFBRSxDQUFDO1FBQ2YsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHO1FBQ2YsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNO1FBQ3JCLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTztLQUN4QixDQUFDLENBQUM7QUFDTCxDQUFDLENBQUM7QUFSVyxRQUFBLHFCQUFxQix5QkFRaEM7QUFFRixJQUFZLGFBR1g7QUFIRCxXQUFZLGFBQWE7SUFDdkIsa0NBQWlCLENBQUE7SUFDakIsb0NBQW1CLENBQUE7QUFDckIsQ0FBQyxFQUhXLGFBQWEsR0FBYixxQkFBYSxLQUFiLHFCQUFhLFFBR3hCIn0=