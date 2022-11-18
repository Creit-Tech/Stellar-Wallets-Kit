import { getPublicKey, isConnected, signTransaction, } from '@stellar/freighter-api';
export const isFreighterInstalled = () => isConnected();
export const freighterGetPublicKey = async () => {
    if (!isConnected()) {
        throw new Error(`Freighter is not connected`);
    }
    return getPublicKey();
};
export const freighterSignTransaction = async (params) => {
    if (!isConnected()) {
        throw new Error(`Freighter is not connected`);
    }
    return signTransaction(params.xdr, {
        accountToSign: params.accountToSign,
        networkPassphrase: params.networkPassphrase,
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJlaWdodGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9mcmVpZ2h0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLFlBQVksRUFDWixXQUFXLEVBQ1gsZUFBZSxHQUNoQixNQUFNLHdCQUF3QixDQUFDO0FBRWhDLE1BQU0sQ0FBQyxNQUFNLG9CQUFvQixHQUFHLEdBQUcsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBRXhELE1BQU0sQ0FBQyxNQUFNLHFCQUFxQixHQUFHLEtBQUssSUFBcUIsRUFBRTtJQUMvRCxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUU7UUFDbEIsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0tBQy9DO0lBRUQsT0FBTyxZQUFZLEVBQUUsQ0FBQztBQUN4QixDQUFDLENBQUM7QUFFRixNQUFNLENBQUMsTUFBTSx3QkFBd0IsR0FBRyxLQUFLLEVBQzNDLE1BQTRCLEVBQ1gsRUFBRTtJQUNuQixJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUU7UUFDbEIsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0tBQy9DO0lBRUQsT0FBTyxlQUFlLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRTtRQUNqQyxhQUFhLEVBQUUsTUFBTSxDQUFDLGFBQWE7UUFDbkMsaUJBQWlCLEVBQUUsTUFBTSxDQUFDLGlCQUFpQjtLQUM1QyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMifQ==