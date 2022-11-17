export const rabetGetPublicKey = async () => {
    if (!window?.rabet) {
        throw new Error('Rabet is not installed');
    }
    return window.rabet.connect();
};
export const rabetSignTransaction = async (params) => {
    if (!window?.rabet) {
        throw new Error('Rabet is not installed');
    }
    return window.rabet.sign(params.xdr, params.network);
};
export var RabetNetwork;
(function (RabetNetwork) {
    RabetNetwork["PUBLIC"] = "mainnet";
    RabetNetwork["TESTNET"] = "testnet";
})(RabetNetwork || (RabetNetwork = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFiZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL3JhYmV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVFBLE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHLEtBQUssSUFBb0MsRUFBRTtJQUMxRSxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRTtRQUNsQixNQUFNLElBQUksS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUM7S0FDM0M7SUFFRCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDaEMsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQUcsS0FBSyxFQUFFLE1BRzFDLEVBQTRCLEVBQUU7SUFDN0IsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUU7UUFDbEIsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0tBQzNDO0lBRUQsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN2RCxDQUFDLENBQUM7QUFFRixNQUFNLENBQU4sSUFBWSxZQUdYO0FBSEQsV0FBWSxZQUFZO0lBQ3RCLGtDQUFrQixDQUFBO0lBQ2xCLG1DQUFtQixDQUFBO0FBQ3JCLENBQUMsRUFIVyxZQUFZLEtBQVosWUFBWSxRQUd2QiJ9