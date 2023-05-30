import { getPublicKey, isConnected, signTransaction, } from '@stellar/freighter-api';
export const isFreighterInstalled = async () => isConnected();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJlaWdodGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9mcmVpZ2h0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLFlBQVksRUFDWixXQUFXLEVBQ1gsZUFBZSxHQUNoQixNQUFNLHdCQUF3QixDQUFDO0FBRWhDLE1BQU0sQ0FBQyxNQUFNLG9CQUFvQixHQUFHLEtBQUssSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7QUFFOUQsTUFBTSxDQUFDLE1BQU0scUJBQXFCLEdBQUcsS0FBSyxJQUFxQixFQUFFO0lBQy9ELElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRTtRQUNsQixNQUFNLElBQUksS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUM7S0FDL0M7SUFFRCxPQUFPLFlBQVksRUFBRSxDQUFDO0FBQ3hCLENBQUMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxNQUFNLHdCQUF3QixHQUFHLEtBQUssRUFDM0MsTUFBNEIsRUFDWCxFQUFFO0lBQ25CLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRTtRQUNsQixNQUFNLElBQUksS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUM7S0FDL0M7SUFFRCxPQUFPLGVBQWUsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFO1FBQ2pDLGFBQWEsRUFBRSxNQUFNLENBQUMsYUFBYTtRQUNuQyxpQkFBaUIsRUFBRSxNQUFNLENBQUMsaUJBQWlCO0tBQzVDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyJ9