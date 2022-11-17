import albedo from '@albedo-link/intent';
export const albedoGetPublicKey = async () => {
    return albedo.publicKey({});
};
export const albedoSignTransaction = async (params) => {
    return albedo.tx({
        xdr: params.xdr,
        pubkey: params.pubKey,
        network: params.network,
    });
};
export var AlbedoNetwork;
(function (AlbedoNetwork) {
    AlbedoNetwork["PUBLIC"] = "public";
    AlbedoNetwork["TESTNET"] = "testnet";
})(AlbedoNetwork || (AlbedoNetwork = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxiZWRvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9hbGJlZG8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxNQUdOLE1BQU0scUJBQXFCLENBQUM7QUFFN0IsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsS0FBSyxJQUFvQyxFQUFFO0lBQzNFLE9BQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5QixDQUFDLENBQUM7QUFFRixNQUFNLENBQUMsTUFBTSxxQkFBcUIsR0FBRyxLQUFLLEVBQ3hDLE1BQXlCLEVBQ0EsRUFBRTtJQUMzQixPQUFPLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDZixHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUc7UUFDZixNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU07UUFDckIsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPO0tBQ3hCLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQztBQUVGLE1BQU0sQ0FBTixJQUFZLGFBR1g7QUFIRCxXQUFZLGFBQWE7SUFDdkIsa0NBQWlCLENBQUE7SUFDakIsb0NBQW1CLENBQUE7QUFDckIsQ0FBQyxFQUhXLGFBQWEsS0FBYixhQUFhLFFBR3hCIn0=