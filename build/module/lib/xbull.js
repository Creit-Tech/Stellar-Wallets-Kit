import { xBullWalletConnect } from '@creit-tech/xbull-wallet-connect';
export const xBullGetPublicKey = async () => {
    const bridge = new xBullWalletConnect();
    const publicKey = await bridge.connect();
    bridge.closeConnections();
    return publicKey;
};
export const xBullSignTransaction = async (params) => {
    const bridge = new xBullWalletConnect();
    const signedXDR = await bridge.sign({
        xdr: params.xdr,
        publicKey: params.publicKey,
        network: params.networkPassphrase,
    });
    bridge.closeConnections();
    return { signedXDR };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGJ1bGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL3hidWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBRXRFLE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHLEtBQUssSUFBcUIsRUFBRTtJQUMzRCxNQUFNLE1BQU0sR0FBRyxJQUFJLGtCQUFrQixFQUFFLENBQUM7SUFDeEMsTUFBTSxTQUFTLEdBQUcsTUFBTSxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDekMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUM7SUFDMUIsT0FBTyxTQUFTLENBQUM7QUFDbkIsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQUcsS0FBSyxFQUN2QyxNQUF3QixFQUNRLEVBQUU7SUFDbEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxrQkFBa0IsRUFBRSxDQUFDO0lBQ3hDLE1BQU0sU0FBUyxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQztRQUNsQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUc7UUFDZixTQUFTLEVBQUUsTUFBTSxDQUFDLFNBQVM7UUFDM0IsT0FBTyxFQUFFLE1BQU0sQ0FBQyxpQkFBaUI7S0FDbEMsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUM7SUFDMUIsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFDO0FBQ3ZCLENBQUMsQ0FBQyJ9